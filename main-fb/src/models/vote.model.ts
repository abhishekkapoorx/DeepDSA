import mongoose, { Schema, Document } from 'mongoose';

export const VoteType = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote'
} as const;

export type VoteType = typeof VoteType[keyof typeof VoteType];

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  userClerkId: string;
  targetType: 'discussion' | 'comment';
  targetId: mongoose.Types.ObjectId;
  voteType: VoteType;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userClerkId: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['discussion', 'comment'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  voteType: {
    type: String,
    enum: Object.values(VoteType),
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per target
VoteSchema.index({ userClerkId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Indexes for better performance
VoteSchema.index({ targetType: 1, targetId: 1 });
VoteSchema.index({ userClerkId: 1 });

export const Vote = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
