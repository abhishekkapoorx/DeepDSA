import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import User from '@/models/user.model';
import Submission from '@/models/submission.model';
import Interview from '@/models/interview.model';
import Problem from '@/models/problem.model';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find user by username
    const user = await User.findOne({ username }).select('-email -clerkId');
    console.log("user", user);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user submissions with problem details
    const submissions = await Submission.find({ userId: user._id })
      .populate('problemId', 'slug title difficulty')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('problemId status language createdAt');

    // Get user interviews
    const interviews = await Interview.find({ userId: user._id })
      .sort({ startedAt: -1 })
      .limit(3)
      .select('problemSlug scoreBreakdown startedAt');

    // Calculate statistics
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

    // Calculate interview statistics
    const interviewStats = await Interview.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    // Format the response
    const profile = {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || username,
      username: user.username,
      role: user.role,
      country: 'Unknown', // Not in current user model
      joinDate: user.createdAt,
      lastActive: user.updatedAt,
      stats: {
        totalProblems,
        solvedProblems: acceptedSubmissions,
        totalSubmissions,
        acceptedSubmissions,
        easy: difficultyStats.easy,
        medium: difficultyStats.medium,
        hard: difficultyStats.hard,
      },
      interviews: {
        total: interviewStats[0]?.total || 0,
        averageScore: Math.round((interviewStats[0]?.averageScore || 0) * 10) / 10,
        streakDays: 0, // This would need a separate calculation
        recent: interviews.map(interview => ({
          id: interview._id,
          title: interview.problemSlug || 'General Interview',
          score: interview.score || 0,
          date: interview.startedAt
        }))
      },
      submissions: submissions.map(submission => ({
        id: submission._id,
        problemTitle: (submission.problemId as any)?.slug || 'Unknown Problem',
        status: submission.status,
        language: submission.language,
        date: submission.createdAt
      }))
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
