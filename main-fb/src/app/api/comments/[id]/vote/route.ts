import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { Comment, Vote, VoteType, User } from '@/models';
import mongoose from 'mongoose';

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
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !Object.values(VoteType).includes(voteType as VoteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote" or "downvote"' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      userClerkId: userId,
      targetType: 'comment',
      targetId: id
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await Vote.findByIdAndDelete(existingVote._id);
        
        // Update comment vote count
        const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        await Comment.findByIdAndUpdate(id, {
          $inc: { [updateField]: -1 }
        });

        return NextResponse.json({
          message: 'Vote removed',
          voteType: null,
          upvotes: comment.upvotes - (voteType === 'upvote' ? 1 : 0),
          downvotes: comment.downvotes - (voteType === 'downvote' ? 1 : 0)
        });
      } else {
        // Change vote type
        existingVote.voteType = voteType;
        await existingVote.save();

        // Update comment vote counts
        const oldField = voteType === 'upvote' ? 'downvotes' : 'upvotes';
        const newField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        
        await Comment.findByIdAndUpdate(id, {
          $inc: { 
            [oldField]: -1,
            [newField]: 1
          }
        });

        return NextResponse.json({
          message: 'Vote updated',
          voteType,
          upvotes: comment.upvotes + (voteType === 'upvote' ? 1 : -1),
          downvotes: comment.downvotes + (voteType === 'downvote' ? 1 : -1)
        });
      }
    } else {
      // Create new vote
      const vote = new Vote({
        user: user._id,
        userClerkId: userId,
        targetType: 'comment',
        targetId: id,
        voteType
      });

      await vote.save();

      // Update comment vote count
      const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
      await Comment.findByIdAndUpdate(id, {
        $inc: { [updateField]: 1 }
      });

      return NextResponse.json({
        message: 'Vote added',
        voteType,
        upvotes: comment.upvotes + (voteType === 'upvote' ? 1 : 0),
        downvotes: comment.downvotes + (voteType === 'downvote' ? 1 : 0)
      });
    }

  } catch (error) {
    console.error('Error voting on comment:', error);
    return NextResponse.json(
      { error: 'Failed to vote on comment' },
      { status: 500 }
    );
  }
}

export async function GET(
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
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    await dbConnect();

    const vote = await Vote.findOne({
      userClerkId: userId,
      targetType: 'comment',
      targetId: id
    });

    return NextResponse.json({
      voteType: vote ? vote.voteType : null
    });

  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}