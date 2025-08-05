import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
  currentStreak: number;
  maxStreak: number;
  lastSolvedAt?: Date;
  ranking?: number;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
    easySolved: {
      type: Number,
      default: 0,
    },
    mediumSolved: {
      type: Number,
      default: 0,
    },
    hardSolved: {
      type: Number,
      default: 0,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0.0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    lastSolvedAt: {
      type: Date,
    },
    ranking: {
      type: Number,
    },
  }
);

// Indexes for better query performance
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ totalSolved: -1, ranking: 1 });

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress || mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress; 