import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { Solution, User, Problem } from '@/models';
import mongoose from 'mongoose';

/**
 * GET /api/solutions - Fetch paginated list of published solutions
 * Supports filtering by problemSlug, language, and search query. Can be sorted by
 * newest, oldest, mostUpvoted, mostViewed, or mostEfficient. Returns solutions with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const problemSlug = searchParams.get('problemSlug');
    const language = searchParams.get('language');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = { isPublished: true };
    
    if (problemSlug) {
      filter.problemSlug = problemSlug;
    }
    
    if (language) {
      filter.language = language;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
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
      case 'mostViewed':
        sort = { views: -1, createdAt: -1 };
        break;
      case 'mostEfficient':
        sort = { isEfficient: -1, upvotes: -1, createdAt: -1 };
        break;
    }

    const [solutions, total] = await Promise.all([
      Solution.find(filter)
        .populate('author', 'firstName lastName username imageUrl')
        .populate('problemId', 'title slug difficulty')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Solution.countDocuments(filter)
    ]);

    return NextResponse.json({
      solutions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching solutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solutions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/solutions - Create a new solution
 * Creates a user-submitted solution with code, explanation, complexity analysis, and tags.
 * Prevents duplicate solutions from same user for same problem/language. Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      content, 
      code, 
      language, 
      problemSlug, 
      tags = [], 
      timeComplexity, 
      spaceComplexity, 
      approach,
      hasVideo = false,
      videoUrl,
      isEfficient = false
    } = body;

    if (!title || !description || !content || !code || !language || !problemSlug) {
      return NextResponse.json(
        { error: 'Title, description, content, code, language, and problemSlug are required' },
        { status: 400 }
      );
    }

    // Find the problem
    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Check for duplicate solution from same user for same problem
    const existingSolution = await Solution.findOne({
      author: user._id,
      problemId: problem._id,
      language
    });

    if (existingSolution) {
      return NextResponse.json(
        { error: 'You have already submitted a solution for this problem in this language' },
        { status: 400 }
      );
    }

    const solution = new Solution({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      code: code.trim(),
      language,
      author: user._id,
      authorClerkId: userId,
      problemId: problem._id,
      problemSlug,
      tags: tags.filter((tag: string) => tag.trim().length > 0),
      timeComplexity: timeComplexity?.trim(),
      spaceComplexity: spaceComplexity?.trim(),
      approach: approach?.trim(),
      hasVideo,
      videoUrl: videoUrl?.trim(),
      isEfficient
    });

    await solution.save();

    // Populate the author and problem data
    await solution.populate('author', 'firstName lastName username imageUrl');
    await solution.populate('problemId', 'title slug difficulty');

    return NextResponse.json({
      solution,
      message: 'Solution created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating solution:', error);
    return NextResponse.json(
      { error: 'Failed to create solution' },
      { status: 500 }
    );
  }
}
