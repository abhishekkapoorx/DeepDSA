import mongoose, { Schema, Document } from 'mongoose';

export interface IContestProblem {
  problemId: mongoose.Types.ObjectId;
  problemSlug: string;
  points: number;
  order: number;
}

export interface IContestRegistration {
  userId?: mongoose.Types.ObjectId; // Optional since we're using clerkId
  clerkId: string;
  registeredAt: Date;
  score?: number;
  problemsSolved?: number;
  totalTime?: number; // in minutes
}

export interface IContest extends Document {
  title: string;
  description: string;
  slug: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  maxParticipants?: number;
  isActive: boolean;
  isPublished: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  problems: IContestProblem[];
  registrations: IContestRegistration[];
  rules: string[];
  prizes?: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ContestProblemSchema = new Schema<IContestProblem>({
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  problemSlug: { type: String, required: true },
  points: { type: Number, required: true, min: 1 },
  order: { type: Number, required: true, min: 1 }
});

const ContestRegistrationSchema = new Schema<IContestRegistration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: undefined },
  clerkId: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 }
});

const ContestSchema = new Schema<IContest>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 },
  maxParticipants: { type: Number, min: 1 },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  problems: [ContestProblemSchema],
  registrations: [ContestRegistrationSchema],
  rules: [{ type: String }],
  prizes: [{ type: String }],
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'mixed'], 
    default: 'mixed' 
  },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
ContestSchema.index({ startTime: 1 });
ContestSchema.index({ isPublished: 1, isActive: 1 });
ContestSchema.index({ isDeleted: 1 });

// Pre-save middleware to update updatedAt
ContestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if contest is currently running
ContestSchema.virtual('isRunning').get(function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
});

// Virtual for checking if contest has ended
ContestSchema.virtual('hasEnded').get(function() {
  return new Date() > this.endTime;
});

// Virtual for checking if registration is open
ContestSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return now < this.startTime && this.isPublished;
});

// Virtual for getting registration count
ContestSchema.virtual('registrationCount').get(function() {
  return this.registrations.length;
});

export const Contest = mongoose.models.Contest || mongoose.model<IContest>('Contest', ContestSchema);
