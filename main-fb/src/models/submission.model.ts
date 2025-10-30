import mongoose, { Document, Schema, Model } from "mongoose";

export enum SubmissionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  ACCEPTED = "ACCEPTED",
  WRONG_ANSWER = "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  COMPILATION_ERROR = "COMPILATION_ERROR",
}

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId | string; // Can be ObjectId (legacy) or clerkId string
  clerkId?: string; // Clerk user ID for easier lookups
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  languageId?: number;
  status: SubmissionStatus;
  judge0Token?: string;
  runtime?: number;
  memory?: number;
  testsPassed: number;
  totalTests: number;
  errorMessage?: string;
  stdout?: string;
  stderr?: string;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.Mixed, // Can be ObjectId or String (clerkId)
      required: true,
    },
    clerkId: {
      type: String,
      required: false,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    languageId: {
      type: Number,
    },
    status: {
      type: String,
      enum: SubmissionStatus,
      default: SubmissionStatus.PENDING,
    },
    judge0Token: {
      type: String,
    },
    runtime: {
      type: Number,
    },
    memory: {
      type: Number,
    },
    testsPassed: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    stdout: {
      type: String,
    },
    stderr: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for better query performance
SubmissionSchema.index({ userId: 1, createdAt: -1 });
SubmissionSchema.index({ clerkId: 1, createdAt: -1 });
SubmissionSchema.index({ problemId: 1, status: 1 });
SubmissionSchema.index({ status: 1, createdAt: -1 });

const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission; 