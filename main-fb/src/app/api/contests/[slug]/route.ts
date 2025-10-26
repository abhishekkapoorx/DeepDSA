import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// GET /api/contests/[slug] - Get a specific contest by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDB();
    
    const { slug } = await params;
    const contest = await Contest.findOne({ slug: slug, isDeleted: { $ne: true } })
      .populate('problems.problemId', 'title slug difficulty description')
      .lean();
    
    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }
    
    // Add registration count
    const registrationCount = contest.registrations ? contest.registrations.length : 0;
    
    // Check if user is registered (if auth provided)
    const { userId } = await auth();
    const isRegistered = userId && contest.registrations 
      ? contest.registrations.some((reg: any) => reg.clerkId === userId)
      : false;
    
    return NextResponse.json({
      ...contest,
      registrationCount,
      isRegistered
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest' },
      { status: 500 }
    );
  }
}

// PUT /api/contests/[slug] - Update a contest (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin check here
    
    await connectToDB();
    
    const body = await request.json();
    const updateData = { ...body };
    
    // Convert date strings to Date objects
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }
    
    const { slug } = await params;
    const contest = await Contest.findOneAndUpdate(
      { slug: slug, isDeleted: { $ne: true } },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contest);
  } catch (error) {
    console.error('Error updating contest:', error);
    return NextResponse.json(
      { error: 'Failed to update contest' },
      { status: 500 }
    );
  }
}

// DELETE /api/contests/[slug] - Delete a contest (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin check here
    
    await connectToDB();
    
    const { slug } = await params;
    const contest = await Contest.findOneAndUpdate(
      { slug: slug, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    
    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { error: 'Failed to delete contest' },
      { status: 500 }
    );
  }
}
