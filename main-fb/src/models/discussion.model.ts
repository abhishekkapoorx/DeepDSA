import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscussion extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  authorClerkId: string;
  problemId?: mongoose.Types.ObjectId; // Optional - for problem-specific discussions
  problemSlug?: string; // Optional - for easy reference
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorClerkId: {
    type: String,
    required: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: false
  },
  problemSlug: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
DiscussionSchema.index({ createdAt: -1 });
DiscussionSchema.index({ upvotes: -1 });
DiscussionSchema.index({ commentCount: -1 });
DiscussionSchema.index({ problemId: 1 });
DiscussionSchema.index({ tags: 1 });
DiscussionSchema.index({ authorClerkId: 1 });

// Virtual for net score
DiscussionSchema.virtual('netScore').get(function() {
  return this.upvotes - this.downvotes;
});

// Ensure virtual fields are serialized
DiscussionSchema.set('toJSON', { virtuals: true });
DiscussionSchema.set('toObject', { virtuals: true });

export const Discussion = mongoose.models.Discussion || mongoose.model<IDiscussion>('Discussion', DiscussionSchema);