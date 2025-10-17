import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  authorClerkId: string;
  discussion: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // For nested replies
  upvotes: number;
  downvotes: number;
  replyCount: number;
  depth: number; // Track nesting level
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    maxlength: 5000
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
  discussion: {
    type: Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  depth: {
    type: Number,
    default: 0,
    max: 5 // Limit nesting depth
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
CommentSchema.index({ discussion: 1, createdAt: 1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ authorClerkId: 1 });
CommentSchema.index({ depth: 1 });

// Virtual for net score
CommentSchema.virtual('netScore').get(function() {
  return this.upvotes - this.downvotes;
});

// Ensure virtual fields are serialized
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

export const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);