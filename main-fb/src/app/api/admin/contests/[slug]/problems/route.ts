import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest, Problem } from '@/models';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/contests/[slug]/problems - Get contest problems
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

    type ContestProblemDoc = {
      problemSlug: string;
      points: number;
      order: number;
      problemId?: {
        title?: string;
        slug?: string;
        difficulty?: string;
        description?: string;
      } | null;
    };

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } })
      .populate('problems.problemId', 'title slug difficulty description')
      .lean<{ problems?: ContestProblemDoc[] } | null>();

    if (!contest || !contest.problems) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json({ problems: contest.problems });
  } catch (error) {
    console.error('Error fetching contest problems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest problems' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contests/[slug]/problems - Add problem to contest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { slug } = await params;
    const { problemSlug, points, order } = await request.json();

    // Find the problem
    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Find the contest
    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Check if problem is already added
    const existingProblem = contest.problems.find((p: { problemSlug: string }) => p.problemSlug === problemSlug);
    if (existingProblem) {
      return NextResponse.json({ error: 'Problem already added to contest' }, { status: 400 });
    }

    // Add problem to contest
    const newOrder = order || contest.problems.length + 1;
    contest.problems.push({
      problemId: problem._id,
      problemSlug: problemSlug,
      points: points || 100,
      order: newOrder
    });

    await contest.save();

    return NextResponse.json({ 
      message: 'Problem added to contest successfully',
      problem: {
        problemId: problem._id,
        problemSlug: problemSlug,
        points: points || 100,
        order: newOrder,
        title: problem.title,
        difficulty: problem.difficulty
      }
    });
  } catch (error) {
    console.error('Error adding problem to contest:', error);
    return NextResponse.json(
      { error: 'Failed to add problem to contest' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contests/[slug]/problems - Remove problem from contest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { slug } = await params;
    const { problemSlug } = await request.json();

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Remove problem from contest
    const initialLength = contest.problems.length;
    contest.problems = contest.problems.filter((p: { problemSlug: string }) => p.problemSlug !== problemSlug);

    if (contest.problems.length === initialLength) {
      return NextResponse.json({ error: 'Problem not found in contest' }, { status: 404 });
    }

    // Reorder remaining problems
    contest.problems.forEach((problem: { order: number }, index: number) => {
      problem.order = index + 1;
    });

    await contest.save();

    return NextResponse.json({ message: 'Problem removed from contest successfully' });
  } catch (error) {
    console.error('Error removing problem from contest:', error);
    return NextResponse.json(
      { error: 'Failed to remove problem from contest' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contests/[slug]/problems - Update problem settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const { slug } = await params;
    const { problemSlug, points, order } = await request.json();

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const problem = contest.problems.find((p: { problemSlug: string }) => p.problemSlug === problemSlug);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found in contest' }, { status: 404 });
    }

    // Update problem settings
    if (points !== undefined) problem.points = points;
    if (order !== undefined) problem.order = order;

    await contest.save();

    return NextResponse.json({ message: 'Problem updated successfully' });
  } catch (error) {
    console.error('Error updating problem:', error);
    return NextResponse.json(
      { error: 'Failed to update problem' },
      { status: 500 }
    );
  }
}
