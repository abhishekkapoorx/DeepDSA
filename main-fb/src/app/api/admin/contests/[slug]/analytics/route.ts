import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/admin/contests/[slug]/analytics - Get contest analytics (admin only)
 * Returns comprehensive contest analytics including registration timeline, score distribution,
 * problem statistics, top performers, and participation metrics. Requires authentication.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { slug } = await params;

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } })
      .populate('problems.problemId', 'title difficulty')
      .lean() as any;

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Calculate registration timeline
    const registrationTimeline = contest.registrations.map((reg: any) => ({
      date: new Date(reg.registeredAt).toISOString().split('T')[0],
      time: new Date(reg.registeredAt).toISOString().split('T')[1].split('.')[0],
      clerkId: reg.clerkId,
      score: reg.score || 0,
      problemsSolved: reg.problemsSolved || 0
    })).sort((a: any, b: any) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

    // Group registrations by hour
    const hourlyRegistrations = registrationTimeline.reduce((acc: any, reg: any) => {
      const hour = new Date(reg.date + 'T' + reg.time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Calculate daily registrations
    const dailyRegistrations = registrationTimeline.reduce((acc: any, reg: any) => {
      acc[reg.date] = (acc[reg.date] || 0) + 1;
      return acc;
    }, {});

    // Calculate participation metrics
    const totalRegistrations = contest.registrations.length;
    const avgScore = totalRegistrations > 0 
      ? contest.registrations.reduce((sum: number, reg: any) => sum + (reg.score || 0), 0) / totalRegistrations 
      : 0;
    const avgProblemsSolved = totalRegistrations > 0
      ? contest.registrations.reduce((sum: number, reg: any) => sum + (reg.problemsSolved || 0), 0) / totalRegistrations
      : 0;

    // Score distribution
    const scoreRanges = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];

    contest.registrations.forEach((reg: any) => {
      const score = reg.score || 0;
      if (score <= 20) scoreRanges[0].count++;
      else if (score <= 40) scoreRanges[1].count++;
      else if (score <= 60) scoreRanges[2].count++;
      else if (score <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    // Problem difficulty analysis
    const problemStats = contest.problems.map((problem: any) => ({
      title: problem.problemId?.title || 'Unknown',
      slug: problem.problemSlug,
      difficulty: problem.problemId?.difficulty || 'Mixed',
      points: problem.points,
      order: problem.order
    }));

    // Top performers
    const topPerformers = contest.registrations
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map((reg: any) => ({
        clerkId: reg.clerkId,
        score: reg.score || 0,
        problemsSolved: reg.problemsSolved || 0,
        registeredAt: reg.registeredAt
      }));

    const analytics = {
      overview: {
        totalRegistrations,
        avgScore: Math.round(avgScore * 100) / 100,
        avgProblemsSolved: Math.round(avgProblemsSolved * 100) / 100,
        contestDuration: contest.duration,
        totalProblems: contest.problems.length,
        maxParticipants: contest.maxParticipants || null
      },
      registrationTimeline: {
        hourly: hourlyRegistrations,
        daily: dailyRegistrations,
        timeline: registrationTimeline
      },
      scoreDistribution: scoreRanges,
      problemStats,
      topPerformers,
      contestInfo: {
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
        difficulty: contest.difficulty
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching contest analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest analytics' },
      { status: 500 }
    );
  }
}
