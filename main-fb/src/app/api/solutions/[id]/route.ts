import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { Solution, User, Vote, VoteType } from '@/models';
import mongoose from 'mongoose';

/**
 * GET /api/solutions/[id] - Fetch a specific solution by ID
 * Returns solution details with populated author and problem data. Increments view count.
 * Only returns published solutions. No authentication required for viewing.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid solution ID' }, { status: 400 });
    }

    await dbConnect();

    const solution = await Solution.findById(id)
      .populate('author', 'firstName lastName username imageUrl')
      .populate('problemId', 'title slug difficulty')
      .lean();

    if (!solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    if (!solution.isPublished) {
      return NextResponse.json({ error: 'Solution not available' }, { status: 404 });
    }

    // Increment view count
    await Solution.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ solution });

  } catch (error) {
    console.error('Error fetching solution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solution' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/solutions/[id] - Update a solution
 * Updates solution content, code, tags, complexity analysis, and metadata.
 * Only the author can update their solution. Requires authentication.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid solution ID' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const solution = await Solution.findById(id);
    if (!solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Check if user is the author
    if (solution.authorClerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      content, 
      code, 
      tags = [], 
      timeComplexity, 
      spaceComplexity, 
      approach,
      hasVideo = false,
      videoUrl,
      isEfficient = false
    } = body;

    // Update solution
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (code !== undefined) updateData.code = code.trim();
    if (tags !== undefined) updateData.tags = tags.filter((tag: string) => tag.trim().length > 0);
    if (timeComplexity !== undefined) updateData.timeComplexity = timeComplexity?.trim();
    if (spaceComplexity !== undefined) updateData.spaceComplexity = spaceComplexity?.trim();
    if (approach !== undefined) updateData.approach = approach?.trim();
    if (hasVideo !== undefined) updateData.hasVideo = hasVideo;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl?.trim();
    if (isEfficient !== undefined) updateData.isEfficient = isEfficient;

    const updatedSolution = await Solution.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('author', 'firstName lastName username imageUrl')
     .populate('problemId', 'title slug difficulty');

    return NextResponse.json({
      solution: updatedSolution,
      message: 'Solution updated successfully'
    });

  } catch (error) {
    console.error('Error updating solution:', error);
    return NextResponse.json(
      { error: 'Failed to update solution' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/solutions/[id] - Delete a solution
 * Permanently deletes a solution. Only the author can delete their solution.
 * Requires authentication.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid solution ID' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const solution = await Solution.findById(id);
    if (!solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Check if user is the author
    if (solution.authorClerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Solution.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Solution deleted successfully' });

  } catch (error) {
    console.error('Error deleting solution:', error);
    return NextResponse.json(
      { error: 'Failed to delete solution' },
      { status: 500 }
    );
  }
}
