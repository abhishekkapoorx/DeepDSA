import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// DELETE /api/admin/contests/[slug]/participants/bulk - Bulk remove participants
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
    const { clerkIds } = await request.json();

    if (!clerkIds || !Array.isArray(clerkIds) || clerkIds.length === 0) {
      return NextResponse.json({ error: 'No participants specified' }, { status: 400 });
    }

    const contest = await Contest.findOne({ slug, isDeleted: { $ne: true } });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Remove participants
    const initialLength = contest.registrations.length;
    contest.registrations = contest.registrations.filter((reg: { clerkId: string }) => !clerkIds.includes(reg.clerkId));
    
    const removedCount = initialLength - contest.registrations.length;

    if (removedCount === 0) {
      return NextResponse.json({ error: 'No participants found to remove' }, { status: 404 });
    }

    await contest.save();

    return NextResponse.json({ 
      message: `Successfully removed ${removedCount} participant(s)`,
      removedCount,
      remainingCount: contest.registrations.length
    });
  } catch (error) {
    console.error('Error bulk removing participants:', error);
    return NextResponse.json(
      { error: 'Failed to remove participants' },
      { status: 500 }
    );
  }
}
