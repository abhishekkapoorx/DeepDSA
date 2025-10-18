import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { Discussion, Comment, Vote, User } from '@/models';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid discussion ID' }, { status: 400 });
    }

    await dbConnect();

    const discussion = await Discussion.findById(id)
      .populate('author', 'firstName lastName username imageUrl')
      .populate('problemId', 'title slug')
      .lean();

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    return NextResponse.json({ discussion });

  } catch (error) {
    console.error('Error fetching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: 'Invalid discussion ID' }, { status: 400 });
    }

    await dbConnect();

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    if (discussion.authorClerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, tags } = body;

    if (title !== undefined) {
      if (!title || title.length > 200) {
        return NextResponse.json(
          { error: 'Title must be between 1 and 200 characters' },
          { status: 400 }
        );
      }
      discussion.title = title.trim();
    }

    if (content !== undefined) {
      if (!content || content.length > 10000) {
        return NextResponse.json(
          { error: 'Content must be between 1 and 10000 characters' },
          { status: 400 }
        );
      }
      discussion.content = content.trim();
    }

    if (tags !== undefined) {
      discussion.tags = tags.map((tag: string) => tag.toLowerCase().trim()).filter(Boolean);
    }

    await discussion.save();

    // Populate the updated discussion
    await discussion.populate('author', 'firstName lastName username imageUrl');
    if (discussion.problemId) {
      await discussion.populate('problemId', 'title slug');
    }

    return NextResponse.json({
      discussion,
      message: 'Discussion updated successfully'
    });

  } catch (error) {
    console.error('Error updating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to update discussion' },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: 'Invalid discussion ID' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Check if user is author or admin
    const isAuthor = discussion.authorClerkId === userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete all related comments and votes
    await Promise.all([
      Comment.deleteMany({ discussion: id }),
      Vote.deleteMany({ targetType: 'discussion', targetId: id }),
      Vote.deleteMany({ targetType: 'comment', targetId: { $in: await Comment.find({ discussion: id }).distinct('_id') } })
    ]);

    await Discussion.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Discussion deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json(
      { error: 'Failed to delete discussion' },
      { status: 500 }
    );
  }
}