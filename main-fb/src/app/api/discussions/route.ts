import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { Discussion, Comment, Vote, User } from '@/models';
import { validateTags } from '@/lib/discussionTags';

/**
 * GET /api/discussions - Fetch paginated list of discussions
 * Supports filtering by problemId, tag, and search query. Can be sorted by
 * newest, oldest, mostUpvoted, mostCommented, or trending. Returns discussions with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const problemId = searchParams.get('problemId');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = {};
    
    if (problemId) {
      filter.problemId = problemId;
    }
    
    if (tag) {
      filter.tags = { $in: [tag.toLowerCase()] };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort: any = { createdAt: -1 }; // Default: newest first
    
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'mostUpvoted':
        sort = { upvotes: -1, createdAt: -1 };
        break;
      case 'mostCommented':
        sort = { commentCount: -1, createdAt: -1 };
        break;
      case 'trending':
        // Trending = most upvoted in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filter.createdAt = { $gte: weekAgo };
        sort = { upvotes: -1, createdAt: -1 };
        break;
    }

    const [discussions, total] = await Promise.all([
      Discussion.find(filter)
        .populate('author', 'firstName lastName username imageUrl')
        .populate('problemId', 'title slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Discussion.countDocuments(filter)
    ]);

    return NextResponse.json({
      discussions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions - Create a new discussion
 * Creates a discussion thread with title, content, tags, and optional problem link.
 * Validates tags and content length. Returns created discussion with populated author data.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    console.log("==============================================")
    console.log("==============================================")
    console.log("In create discussion route")
    console.log("==============================================")
    console.log("==============================================")
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    console.log("CLERK ID "+ userId)

    const user = await User.findOne({ clerkId: userId });
    console.log("user", user)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, tags = [], problemId, problemSlug } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be less than 200 characters' },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be less than 10000 characters' },
        { status: 400 }
      );
    }

    if (!validateTags(tags)) {
      return NextResponse.json(
        { error: 'Invalid tags provided' },
        { status: 400 }
      );
    }

    const discussion = new Discussion({
      title: title.trim(),
      content: content.trim(),
      author: user._id,
      authorClerkId: userId,
      problemId: problemId || null,
      problemSlug: problemSlug || null,
      tags: tags
    });

    await discussion.save();

    // Populate the author and problem data
    await discussion.populate('author', 'firstName lastName username imageUrl');
    if (problemId) {
      await discussion.populate('problemId', 'title slug');
    }

    return NextResponse.json({
      discussion,
      message: 'Discussion created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}