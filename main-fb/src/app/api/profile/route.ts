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

    // Return profile data in expected format
    const profileData = {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      username: user.username || 'user',
      email: user.email || '',
      imageUrl: user.imageUrl || '',
      role: user.role || 'USER',
      country: 'Unknown', // Not in current user model
      joinDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lastActive: user.updatedAt ? user.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
