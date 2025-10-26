import mongoose, { Schema, Document } from 'mongoose';

export interface IContestTemplate extends Document {
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  duration: number; // in minutes
  maxParticipants?: number;
  problems: Array<{
    problemSlug: string;
    points: number;
    order: number;
  }>;
  rules: string[];
  prizes?: string[];
  tags: string[];
  createdBy: string; // clerkId of creator
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  reviews?: Array<{
    userId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ContestTemplateSchema = new Schema<IContestTemplate>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'custom'],
    default: 'custom'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  duration: { type: Number, required: true, min: 1 },
  maxParticipants: { type: Number, min: 1 },
  problems: [{
    problemSlug: { type: String, required: true },
    points: { type: Number, required: true, min: 1 },
    order: { type: Number, required: true, min: 1 }
  }],
  rules: [{ type: String }],
  prizes: [{ type: String }],
  tags: [{ type: String }],
  createdBy: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5 },
  reviews: [{
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
ContestTemplateSchema.index({ category: 1, difficulty: 1 });
ContestTemplateSchema.index({ isPublic: 1 });
ContestTemplateSchema.index({ createdBy: 1 });
ContestTemplateSchema.index({ tags: 1 });
ContestTemplateSchema.index({ rating: -1 });
ContestTemplateSchema.index({ usageCount: -1 });

// Pre-save middleware to update updatedAt
ContestTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for average rating
ContestTemplateSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

export const ContestTemplate = mongoose.models.ContestTemplate || mongoose.model<IContestTemplate>('ContestTemplate', ContestTemplateSchema);
