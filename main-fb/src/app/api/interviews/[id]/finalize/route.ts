import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Interview } from '@/models'
import { auth } from '@clerk/nextjs/server'
import { aiScore, buildScoringPrompt } from '@/lib/ai'

/**
 * POST /api/interviews/[id]/finalize - Finalize and score an interview
 * Ends interview session and generates AI-powered score with feedback. Validates minimum
 * interaction, checks time limits, and provides detailed scoring breakdown. Requires authentication.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params;
    await dbConnect();
    
    // OPTIMISTIC LOCKING: Use findOneAndUpdate to atomically set endedAt
    // This prevents concurrent finalization requests
    const interview = await Interview.findOneAndUpdate(
      { 
        _id: id, 
        clerkId: userId,
        endedAt: null // Only update if not already finalized
      },
      { 
        $set: { endedAt: new Date() } // Set immediately to lock
      },
      { new: true }
    );
    
    if (!interview) {
      // Either not found or already finalized
      const existing = await Interview.findOne({ _id: id, clerkId: userId });
      if (!existing) {
        return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
      }
      // Already finalized - return existing results
      return NextResponse.json({
        score: existing.score || 0,
        breakdown: existing.scoreBreakdown || {},
        suggestions: existing.suggestions || [],
        improvements: existing.improvements || [],
        mistakes: existing.mistakes || [],
        summary: existing.summary || 'Interview already finalized',
      })
    }

    // Validate minimum interaction
    const userMessages = interview.messages.filter((m: any) => m.role === 'user');
    if (userMessages.length < 2) {
      interview.score = 0;
      interview.summary = 'Insufficient interaction to provide a meaningful score. Please engage more actively in future interviews.';
      interview.suggestions = ['Send at least 3-4 messages explaining your approach'];
      interview.improvements = ['Practice articulating your thought process'];
      interview.mistakes = ['Did not complete the interview'];
      await interview.save();
      
      return NextResponse.json({
        score: 0,
        breakdown: {},
        suggestions: interview.suggestions,
        improvements: interview.improvements,
        mistakes: interview.mistakes,
        summary: interview.summary,
      })
    }

    // Check interview duration (max 11 minutes with grace period)
    let timeLimitExceeded = false;
    let durationMinutes = 0;
    if (interview.endedAt) {
      const duration = interview.endedAt.getTime() - new Date(interview.startedAt).getTime();
      durationMinutes = Math.floor(duration / 60000);
      if (duration > 11 * 60 * 1000) {
        console.log(`[Finalize ${id}] Interview exceeded time limit: ${Math.floor(duration / 1000)}s`);
        timeLimitExceeded = true;
      }
    }

    // Build transcript from user messages only (token efficient)
    const transcript = userMessages
      .map((m: any, idx: number) => `${idx + 1}. ${m.content}`)
      .join('\n')
      .slice(0, 6000)

    console.log(`[Finalize ${id}] Starting AI scoring for ${userMessages.length} messages${timeLimitExceeded ? ' (TIME LIMIT EXCEEDED)' : ''}`);
    
    const prompt = buildScoringPrompt(transcript, timeLimitExceeded, durationMinutes)
    let result;
    try {
      result = await aiScore(interview.provider, prompt)
      console.log(`[Finalize ${id}] AI scoring successful:`, {
        score: result.score,
        hasSuggestions: !!result.suggestions?.length,
        hasImprovements: !!result.improvements?.length,
        hasMistakes: !!result.mistakes?.length
      });
    } catch (aiError: any) {
      console.error(`[Finalize ${id}] AI scoring failed:`, aiError.message);
      // Fallback scoring if AI fails
      result = {
        score: 5,
        breakdown: { correctness: 5, approach: 5, clarity: 5, efficiency: 5, communication: 5 },
        suggestions: ['Could not generate AI feedback due to technical error'],
        improvements: ['Please try again or contact support if this persists'],
        mistakes: [],
        summary: 'Interview completed but AI scoring encountered an error. Your responses have been recorded.'
      };
    }

    interview.score = Math.max(0, Math.min(10, Math.round(result.score)))
    interview.scoreBreakdown = result.breakdown as any
    interview.suggestions = result.suggestions?.slice(0, 5) || []
    interview.improvements = result.improvements?.slice(0, 5) || []
    interview.mistakes = result.mistakes?.slice(0, 5) || []
    interview.summary = result.summary || ''
    await interview.save()
    
    console.log(`[Finalize ${id}] Saved to DB - Score: ${interview.score}`);

    return NextResponse.json({
      score: interview.score,
      breakdown: interview.scoreBreakdown,
      suggestions: interview.suggestions,
      improvements: interview.improvements,
      mistakes: interview.mistakes,
      summary: interview.summary,
      timeLimitExceeded
    })
  } catch (e) {
    console.error('Error finalizing interview', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


