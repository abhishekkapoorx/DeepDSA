import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDB } from '@/lib/mongoose';
import User from '@/models/user.model';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId }).select('-clerkId');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile data
    const profile = {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      username: user.username,
      email: user.email,
      role: user.role,
      country: 'Unknown', // Not in current user model
      joinDate: user.createdAt,
      lastActive: user.updatedAt,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
