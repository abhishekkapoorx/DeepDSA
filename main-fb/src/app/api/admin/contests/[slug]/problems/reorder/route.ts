import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// PUT /api/admin/contests/[slug]/problems/reorder - Reorder contest problems
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
    const { problems } = await request.json();

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Update problems with new order
    contest.problems = problems.map((problem: any, index: number) => ({
      ...problem,
      order: index + 1
    }));

    await contest.save();

    return NextResponse.json({ 
      message: 'Problems reordered successfully',
      problems: contest.problems
    });
  } catch (error) {
    console.error('Error reordering problems:', error);
    return NextResponse.json(
      { error: 'Failed to reorder problems' },
      { status: 500 }
    );
  }
}
