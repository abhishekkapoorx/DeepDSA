import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import { Contest } from '@/models';
import { auth } from '@clerk/nextjs/server';

// GET /api/contests - Get all published contests
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // upcoming, running, ended
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'
    const includeDeleted = searchParams.get('includeDeleted') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    const now = new Date();
    let filter: any = { isDeleted: includeDeleted ? { $in: [true, false] } : { $ne: true } };
    if (!includeUnpublished) {
      filter.isPublished = true
    }
    
    // Filter by status
    if (status === 'upcoming') {
      filter.startTime = { $gt: now };
    } else if (status === 'running') {
      filter.startTime = { $lte: now };
      filter.endTime = { $gte: now };
    } else if (status === 'ended') {
      filter.endTime = { $lt: now };
    }
    
    const contests = await Contest.find(filter)
      .populate('problems.problemId', 'title slug difficulty')
      .sort({ startTime: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Contest.countDocuments(filter);
    
    return NextResponse.json({
      contests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}

// POST /api/contests - Create a new contest (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin check here
    // const user = await User.findOne({ clerkId: userId });
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    
    await connectToDB();
    
    const body = await request.json();
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      maxParticipants,
      problems,
      rules,
      prizes,
      difficulty,
      tags
    } = body;
    
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const contest = new Contest({
      title,
      description,
      slug,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      maxParticipants,
      problems,
      rules: rules || [],
      prizes: prizes || [],
      difficulty: difficulty || 'mixed',
      tags: tags || [],
      isActive: true,
      isPublished: false // Start as unpublished
    });
    
    await contest.save();
    
    return NextResponse.json(contest, { status: 201 });
  } catch (error) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { error: 'Failed to create contest' },
      { status: 500 }
    );
  }
}
