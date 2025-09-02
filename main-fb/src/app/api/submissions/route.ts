import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDB } from '@/lib/mongoose';
import User from '@/models/user.model';
import Submission, { SubmissionStatus } from '@/models/submission.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user submissions with problem details
    const submissions = await Submission.find({ userId: user._id })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to recent submissions

    // Format submissions for response
    const formattedSubmissions = submissions.map(submission => ({
      _id: submission._id,
      problemId: {
        title: (submission.problemId as any)?.title || 'Unknown Problem',
        difficulty: (submission.problemId as any)?.difficulty || 'Unknown'
      },
      status: submission.status,
      language: submission.language || 'Unknown',
      createdAt: submission.createdAt,
      runtime: submission.runtime,
      memory: submission.memory
    }));

    return NextResponse.json({
      submissions: formattedSubmissions,
      total: formattedSubmissions.length
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const submission = new Submission({
      ...body,
      userId: user._id,
      status: SubmissionStatus.PENDING,
      testsPassed: 0,
      totalTests: 0,
    });
    
    await submission.save();

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 