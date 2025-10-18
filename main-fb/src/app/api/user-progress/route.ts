import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { UserProgress, User, Submission, Problem } from '@/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId: user._id });
    
    if (!userProgress) {
      // Create initial progress record
      userProgress = new UserProgress({
        userId: user._id,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalSubmissions: 0,
        acceptanceRate: 0,
        currentStreak: 0,
        maxStreak: 0
      });
      await userProgress.save();
    }

    // Calculate real-time statistics
    const stats = await calculateUserStats(user._id);
    
    // Update the progress record with latest stats
    userProgress = await UserProgress.findByIdAndUpdate(
      userProgress._id,
      stats,
      { new: true }
    );

    return NextResponse.json({ userProgress });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      totalSolved, 
      easySolved, 
      mediumSolved, 
      hardSolved, 
      totalSubmissions, 
      acceptanceRate, 
      currentStreak, 
      maxStreak, 
      lastSolvedAt, 
      ranking 
    } = body;

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId: user._id });
    
    if (!userProgress) {
      userProgress = new UserProgress({ userId: user._id });
    }

    // Update fields if provided
    if (totalSolved !== undefined) userProgress.totalSolved = totalSolved;
    if (easySolved !== undefined) userProgress.easySolved = easySolved;
    if (mediumSolved !== undefined) userProgress.mediumSolved = mediumSolved;
    if (hardSolved !== undefined) userProgress.hardSolved = hardSolved;
    if (totalSubmissions !== undefined) userProgress.totalSubmissions = totalSubmissions;
    if (acceptanceRate !== undefined) userProgress.acceptanceRate = acceptanceRate;
    if (currentStreak !== undefined) userProgress.currentStreak = currentStreak;
    if (maxStreak !== undefined) userProgress.maxStreak = maxStreak;
    if (lastSolvedAt !== undefined) userProgress.lastSolvedAt = lastSolvedAt;
    if (ranking !== undefined) userProgress.ranking = ranking;

    await userProgress.save();

    return NextResponse.json({
      userProgress,
      message: 'User progress updated successfully'
    });

  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    );
  }
}

// Helper function to calculate user statistics
async function calculateUserStats(userId: mongoose.Types.ObjectId) {
  try {
    // Get all accepted submissions
    const acceptedSubmissions = await Submission.find({
      userId,
      status: 'accepted'
    }).populate('problemId', 'difficulty');

    // Get all submissions for acceptance rate calculation
    const allSubmissions = await Submission.find({ userId });
    
    // Calculate difficulty-wise solved counts
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    const solvedProblems = new Set();

    acceptedSubmissions.forEach(submission => {
      if (submission.problemId && !solvedProblems.has(submission.problemId._id.toString())) {
        solvedProblems.add(submission.problemId._id.toString());
        const difficulty = submission.problemId.difficulty?.toLowerCase();
        if (difficultyCounts.hasOwnProperty(difficulty)) {
          difficultyCounts[difficulty]++;
        }
      }
    });

    // Calculate acceptance rate
    const acceptanceRate = allSubmissions.length > 0 
      ? (acceptedSubmissions.length / allSubmissions.length) * 100 
      : 0;

    // Calculate streak (simplified - based on last solved date)
    let currentStreak = 0;
    let maxStreak = 0;
    
    if (acceptedSubmissions.length > 0) {
      // Sort by submission date
      const sortedSubmissions = acceptedSubmissions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Calculate current streak (simplified logic)
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if last submission was today or yesterday
      const lastSubmissionDate = new Date(sortedSubmissions[0].createdAt);
      if (lastSubmissionDate.toDateString() === today.toDateString() || 
          lastSubmissionDate.toDateString() === yesterday.toDateString()) {
        currentStreak = 1; // Simplified - would need more complex logic for actual streak
      }
      
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    return {
      totalSolved: solvedProblems.size,
      easySolved: difficultyCounts.easy,
      mediumSolved: difficultyCounts.medium,
      hardSolved: difficultyCounts.hard,
      totalSubmissions: allSubmissions.length,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      currentStreak,
      maxStreak,
      lastSolvedAt: acceptedSubmissions.length > 0 ? acceptedSubmissions[0].createdAt : null
    };

  } catch (error) {
    console.error('Error calculating user stats:', error);
    return {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      totalSubmissions: 0,
      acceptanceRate: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastSolvedAt: null
    };
  }
}
