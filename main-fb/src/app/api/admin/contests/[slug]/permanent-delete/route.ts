import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// DELETE /api/admin/contests/[slug]/permanent-delete - Permanently delete contest
export async function DELETE(
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

    const contest = await Contest.findOne({ slug });
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Check if contest has active registrations
    if (contest.registrations.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot permanently delete contest with active registrations. Please remove all participants first.' 
      }, { status: 400 });
    }

    // Permanently delete the contest
    await Contest.findByIdAndDelete(contest._id);

    return NextResponse.json({ 
      message: 'Contest permanently deleted successfully'
    });
  } catch (error) {
    console.error('Error permanently deleting contest:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete contest' },
      { status: 500 }
    );
  }
}
