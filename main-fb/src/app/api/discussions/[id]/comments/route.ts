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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'newest';

    const skip = (page - 1) * limit;

    // Build sort object
    let sort: any = { createdAt: 1 }; // Default: oldest first for comments
    
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'mostUpvoted':
        sort = { upvotes: -1, createdAt: 1 };
        break;
    }

    const [comments, total] = await Promise.all([
      Comment.find({ 
        discussion: id, 
        isDeleted: false 
      })
        .populate('author', 'firstName lastName username imageUrl')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ 
        discussion: id, 
        isDeleted: false 
      })
    ]);

    // Debug: Log comment structure
    // console.log('Raw comments from DB:', comments.length, 'comments');

    // Build comment tree structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map of all comments with proper structure
    comments.forEach(comment => {
      const commentObj = {
        ...comment,
        replies: [],
        netScore: comment.upvotes - comment.downvotes
      };
      commentMap.set((comment._id as mongoose.Types.ObjectId).toString(), commentObj);
    });

    // Second pass: build tree structure
    comments.forEach(comment => {
      const commentObj = commentMap.get((comment._id as mongoose.Types.ObjectId).toString());
      
      if (comment.parentComment) {
        // This is a reply - add it to parent's replies
        const parent = commentMap.get(comment.parentComment.toString());
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        // This is a root comment - add it to root comments
        rootComments.push(commentObj);
      }
    });

    // Sort replies within each comment
    const sortReplies = (commentList: any[]) => {
      commentList.forEach(comment => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          sortReplies(comment.replies);
        }
      });
    };

    sortReplies(rootComments);

    return NextResponse.json({
      comments: rootComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    if (discussion.isLocked) {
      return NextResponse.json({ error: 'Discussion is locked' }, { status: 403 });
    }

    const body = await request.json();
    const { content, parentCommentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be less than 5000 characters' },
        { status: 400 }
      );
    }

    let depth = 0;
    let parentComment = null;

    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return NextResponse.json({ error: 'Invalid parent comment ID' }, { status: 400 });
      }

      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      if (parentComment.discussion.toString() !== id) {
        return NextResponse.json({ error: 'Parent comment does not belong to this discussion' }, { status: 400 });
      }

      depth = parentComment.depth + 1;
      
      if (depth > 5) {
        return NextResponse.json({ error: 'Maximum nesting depth reached' }, { status: 400 });
      }
    }

    // Check for duplicate comments in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const duplicateCheck = await Comment.findOne({
      content: content.trim(),
      author: user._id,
      discussion: id,
      parentComment: parentCommentId || null,
      createdAt: { $gte: thirtySecondsAgo }
    });

    if (duplicateCheck) {
      console.log('Duplicate comment detected, returning existing comment:', duplicateCheck._id);
      await duplicateCheck.populate('author', 'firstName lastName username imageUrl');
      return NextResponse.json({
        comment: duplicateCheck,
        message: 'Comment already exists'
      }, { status: 200 });
    }

    console.log('Creating comment:', { 
      content: content.trim(), 
      author: user._id, 
      discussion: id, 
      parentCommentId, 
      depth 
    });

    const comment = new Comment({
      content: content.trim(),
      author: user._id,
      authorClerkId: userId,
      discussion: id,
      parentComment: parentCommentId || null,
      depth
    });

    await comment.save();
    console.log('Comment created with ID:', comment._id);

    // Update comment count on discussion
    await Discussion.findByIdAndUpdate(id, {
      $inc: { commentCount: 1 }
    });

    // Update reply count on parent comment
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { replyCount: 1 }
      });
    }

    // Populate the author data
    await comment.populate('author', 'firstName lastName username imageUrl');

    return NextResponse.json({
      comment,
      message: 'Comment created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}