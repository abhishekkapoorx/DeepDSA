import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/contests/[slug]/participants - Get contest participants
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
      .populate('registrations.userId', 'username email')
      .lean();

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json({ participants: contest.registrations });
  } catch (error) {
    console.error('Error fetching contest participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest participants' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contests/[slug]/participants - Remove participant from contest
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
    const { clerkId } = await request.json();

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Remove participant from contest
    const initialLength = contest.registrations.length;
    contest.registrations = contest.registrations.filter(r => r.clerkId !== clerkId);

    if (contest.registrations.length === initialLength) {
      return NextResponse.json({ error: 'Participant not found in contest' }, { status: 404 });
    }

    await contest.save();

    return NextResponse.json({ 
      message: 'Participant removed from contest successfully',
      registrationCount: contest.registrations.length
    });
  } catch (error) {
    console.error('Error removing participant from contest:', error);
    return NextResponse.json(
      { error: 'Failed to remove participant from contest' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contests/[slug]/participants - Update participant data
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
    const { clerkId, score, problemsSolved, totalTime } = await request.json();

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const participant = contest.registrations.find(r => r.clerkId === clerkId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found in contest' }, { status: 404 });
    }

    // Update participant data
    if (score !== undefined) participant.score = score;
    if (problemsSolved !== undefined) participant.problemsSolved = problemsSolved;
    if (totalTime !== undefined) participant.totalTime = totalTime;

    await contest.save();

    return NextResponse.json({ message: 'Participant updated successfully' });
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}
