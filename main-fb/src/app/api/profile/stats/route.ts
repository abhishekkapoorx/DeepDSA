import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDB } from '@/lib/mongoose';
import User from '@/models/user.model';
import Submission from '@/models/submission.model';
import Problem from '@/models/problem.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user submissions
    const totalSubmissions = await Submission.countDocuments({ userId: user._id });
    const acceptedSubmissions = await Submission.countDocuments({ 
      userId: user._id, 
      status: 'Accepted' 
    });

    // Get problem difficulty breakdown
    const problemStats = await Submission.aggregate([
      { $match: { userId: user._id, status: 'Accepted' } },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate difficulty stats
    const difficultyStats = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 }
    };

    problemStats.forEach(stat => {
      const difficulty = stat._id.toLowerCase();
      if (difficultyStats[difficulty as keyof typeof difficultyStats]) {
        difficultyStats[difficulty as keyof typeof difficultyStats].solved = stat.count;
      }
    });

    // Get total problems count
    const totalProblems = await Problem.countDocuments();

    // Return user statistics
    const stats = {
      totalProblems,
      solvedProblems: acceptedSubmissions,
      totalSubmissions,
      acceptedSubmissions,
      easy: difficultyStats.easy,
      medium: difficultyStats.medium,
      hard: difficultyStats.hard,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
