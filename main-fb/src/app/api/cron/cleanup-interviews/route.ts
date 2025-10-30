import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Interview } from '@/models';

// Cron job to cleanup abandoned interviews
// Run this every hour via Vercel Cron or external scheduler
// Example vercel.json cron: "0 * * * *" (every hour)

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find abandoned interviews (started > 1 hour ago, not ended)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const abandonedInterviews = await Interview.find({
      startedAt: { $lt: oneHourAgo },
      endedAt: null
    });

    const results = [];
    
    for (const interview of abandonedInterviews) {
      try {
        // Auto-finalize with score 0 and explanation
        interview.score = 0;
        interview.summary = 'Interview was automatically closed due to inactivity. Please complete future interviews within the time limit.';
        interview.suggestions = [
          'Stay engaged throughout the interview',
          'Complete the full 10-minute session',
          'Avoid leaving the interview page during the session'
        ];
        interview.improvements = [
          'Practice time management',
          'Ensure stable internet connection',
          'Close other browser tabs to avoid distractions'
        ];
        interview.mistakes = ['Interview abandoned or interrupted'];
        interview.scoreBreakdown = {
          correctness: 0,
          approach: 0,
          clarity: 0,
          efficiency: 0,
          communication: 0
        };
        interview.endedAt = new Date();
        
        await interview.save();
        
        results.push({
          id: interview._id,
          clerkId: interview.clerkId,
          startedAt: interview.startedAt,
          status: 'cleaned'
        });
      } catch (error) {
        console.error(`Failed to cleanup interview ${interview._id}:`, error);
        results.push({
          id: interview._id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`[Cleanup Cron] Processed ${abandonedInterviews.length} abandoned interviews`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: abandonedInterviews.length,
      results
    });
  } catch (error) {
    console.error('Error in cleanup cron:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

