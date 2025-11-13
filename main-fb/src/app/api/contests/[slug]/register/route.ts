import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import type { IContestRegistration } from '@/models';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/contests/[slug]/register - Register for a contest
 * Registers authenticated user for a contest. Validates registration is open,
 * user not already registered, and contest not full. Requires authentication.
 */
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
    const contest = await Contest.findOne({ slug });
    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }
    
    // Check if registration is open
    const now = new Date();
    if (now >= contest.startTime) {
      return NextResponse.json(
        { error: 'Registration is closed' },
        { status: 400 }
      );
    }
    
    // Check if user is already registered
    const existingRegistration = contest.registrations.find(
      (reg: IContestRegistration) => reg.clerkId === userId
    );
    
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this contest' },
        { status: 400 }
      );
    }
    
    // Check if contest is full
    if (contest.maxParticipants && contest.registrations.length >= contest.maxParticipants) {
      return NextResponse.json(
        { error: 'Contest is full' },
        { status: 400 }
      );
    }
    
    // Add registration
    contest.registrations.push({
      clerkId: userId,
      registeredAt: new Date()
    });
    
    await contest.save();
    
    return NextResponse.json({ 
      message: 'Successfully registered for contest',
      registrationCount: contest.registrations.length
    });
  } catch (error) {
    console.error('Error registering for contest:', error);
    return NextResponse.json(
      { error: 'Failed to register for contest' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contests/[slug]/register - Unregister from a contest
 * Removes user's registration from a contest. Only allowed before contest starts.
 * Requires authentication and user must be registered.
 */
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
    const contest = await Contest.findOne({ slug });
    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }
    
    // Check if contest has started
    const now = new Date();
    if (now >= contest.startTime) {
      return NextResponse.json(
        { error: 'Cannot unregister after contest has started' },
        { status: 400 }
      );
    }
    
    // Remove registration
    const registrationIndex = contest.registrations.findIndex(
      (reg: IContestRegistration) => reg.clerkId === userId
    );
    
    if (registrationIndex === -1) {
      return NextResponse.json(
        { error: 'Not registered for this contest' },
        { status: 400 }
      );
    }
    
    contest.registrations.splice(registrationIndex, 1);
    await contest.save();
    
    return NextResponse.json({ 
      message: 'Successfully unregistered from contest',
      registrationCount: contest.registrations.length
    });
  } catch (error) {
    console.error('Error unregistering from contest:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from contest' },
      { status: 500 }
    );
  }
}
