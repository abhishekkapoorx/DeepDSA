import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISolution extends Document {
  title: string;
  description: string;
  content: string;
  code: string;
  language: string;
  author: mongoose.Types.ObjectId;
  authorClerkId: string;
  problemId: mongoose.Types.ObjectId;
  problemSlug: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  commentCount: number;
  isPublished: boolean;
  isEfficient?: boolean;
  hasVideo?: boolean;
  videoUrl?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  approach?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionSchema = new Schema<ISolution>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    content: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['java', 'cpp', 'python', 'javascript', 'c', 'csharp', 'go', 'rust'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorClerkId: {
      type: String,
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    problemSlug: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isEfficient: {
      type: Boolean,
      default: false,
    },
    hasVideo: {
      type: Boolean,
      default: false,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    timeComplexity: {
      type: String,
      trim: true,
    },
    spaceComplexity: {
      type: String,
      trim: true,
    },
    approach: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
SolutionSchema.index({ problemId: 1, createdAt: -1 });
SolutionSchema.index({ author: 1, createdAt: -1 });
SolutionSchema.index({ problemSlug: 1, createdAt: -1 });
SolutionSchema.index({ language: 1, createdAt: -1 });
SolutionSchema.index({ isPublished: 1, createdAt: -1 });
SolutionSchema.index({ upvotes: -1, createdAt: -1 });
SolutionSchema.index({ views: -1, createdAt: -1 });

const existingModels = (mongoose as any).models as Record<string, Model<any>> | undefined;

const Solution: Model<ISolution> =
  (existingModels && existingModels.Solution) || mongoose.model<ISolution>("Solution", SolutionSchema);

export default Solution;
