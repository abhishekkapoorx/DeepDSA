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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get total problems count
    const totalProblems = await Problem.countDocuments();

    // Get submission statistics
    const submissionStats = await Submission.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get solved problems by difficulty
    const solvedProblems = await Submission.aggregate([
      { $match: { userId: user._id, status: 'Accepted' } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.difficulty',
          solved: { $sum: 1 }
        }
      }
    ]);

    // Get total problems by difficulty
    const totalByDifficulty = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          total: { $sum: 1 }
        }
      }
    ]);

    // Process the data
    const stats = {
      totalProblems,
      solvedProblems: submissionStats[0]?.acceptedSubmissions || 0,
      totalSubmissions: submissionStats[0]?.totalSubmissions || 0,
      acceptedSubmissions: submissionStats[0]?.acceptedSubmissions || 0,
      easy: {
        solved: solvedProblems.find(p => p._id === 'Easy')?.solved || 0,
        total: totalByDifficulty.find(p => p._id === 'Easy')?.total || 0
      },
      medium: {
        solved: solvedProblems.find(p => p._id === 'Medium')?.solved || 0,
        total: totalByDifficulty.find(p => p._id === 'Medium')?.total || 0
      },
      hard: {
        solved: solvedProblems.find(p => p._id === 'Hard')?.solved || 0,
        total: totalByDifficulty.find(p => p._id === 'Hard')?.total || 0
      }
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
