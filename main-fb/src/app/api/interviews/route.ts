import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Interview from '@/models/interview.model';
import Problem from '@/models/problem.model';
import User from '@/models/user.model';
import { auth } from '@clerk/nextjs/server';

// POST /api/interviews -> start new interview (enforce 3/day)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { problemSlug, provider } = await req.json();

    // Check for active (non-finalized) interview
    const activeInterview = await Interview.findOne({ 
      clerkId: userId, 
      endedAt: null 
    });
    
    if (activeInterview) {
      return NextResponse.json({ 
        error: 'You already have an active interview. Please finish it first.',
        interviewId: String(activeInterview._id)
      }, { status: 409 });
    }

    // Count user interviews today (using UTC to prevent timezone exploitation)
    const now = new Date();
    const startOfDayUTC = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      0, 0, 0
    ));
    const endOfDayUTC = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      23, 59, 59, 999
    ));
    
    const todayCount = await Interview.countDocuments({ 
      clerkId: userId, 
      startedAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } 
    });
    
    if (todayCount >= 3) {
      return NextResponse.json({ 
        error: 'Daily interview limit reached (3 interviews per day)' 
      }, { status: 429 });
    }

    let problem = null as any;
    if (problemSlug) {
      problem = await Problem.findOne({ slug: problemSlug }).select('_id slug title');
    }

    const interview = new Interview({
      userId: user._id,
      clerkId: userId,
      problemId: problem?._id,
      problemSlug: problem?.slug,
      provider: provider === 'openai' ? 'openai' : 'gemini',
      dailySequence: todayCount + 1,
      startedAt: new Date(),
      messages: [
        {
          role: 'assistant',
          content: `Hello! Let's start the interview${problem?.title ? ` for: ${problem.title}` : ''}. Briefly explain your approach.`,
          timestamp: new Date(),
        },
      ],
    });
    await interview.save();

    return NextResponse.json({ id: interview._id, message: interview.messages[0] }, { status: 201 });
  } catch (e) {
    console.error('Error starting interview', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/interviews -> list user interviews (paginated)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Interview.find({ clerkId: userId })
        .select('startedAt endedAt problemSlug score dailySequence createdAt scoreBreakdown suggestions improvements mistakes summary messages')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Interview.countDocuments({ clerkId: userId })
    ]);

    // Mark abandoned interviews (started but not ended within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const processedItems = items.map((interview: any) => {
      const isAbandoned = !interview.endedAt && new Date(interview.startedAt) < oneHourAgo;
      const isActive = !interview.endedAt && new Date(interview.startedAt) >= oneHourAgo;
      
      return {
        ...interview,
        isAbandoned,
        isActive,
        status: isAbandoned ? 'abandoned' : isActive ? 'active' : 'completed',
        messageCount: interview.messages?.length || 0
      };
    });

    return NextResponse.json({
      interviews: processedItems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (e) {
    console.error('Error listing interviews', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


