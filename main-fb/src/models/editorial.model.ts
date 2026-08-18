import mongoose, { Document, Schema, Model } from "mongoose";
import { ApproachType } from "@/types/editorial";

export interface ICodeSolution {
  language: string;
  code: string;
  explanation?: string;
}

export interface IApproach {
  type: ApproachType;
  title: string;
  description: string;
  algorithm: string;
  codeSolutions: ICodeSolution[];
  timeComplexity: string;
  spaceComplexity: string;
  pros?: string[];
  cons?: string[];
}

export interface IEditorial extends Document {
  problemId: mongoose.Types.ObjectId;
  title: string;
  overview: string;
  approaches: IApproach[];
  followUpQuestions?: string[];
  relatedProblems?: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSolutionSchema = new Schema<ICodeSolution>({
  language: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    trim: true,
  },
});

const ApproachSchema = new Schema<IApproach>({
  type: {
    type: String,
    enum: ApproachType,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  algorithm: {
    type: String,
    required: true,
  },
  codeSolutions: [CodeSolutionSchema],
  timeComplexity: {
    type: String,
    required: true,
    trim: true,
  },
  spaceComplexity: {
    type: String,
    required: true,
    trim: true,
  },
  pros: [{
    type: String,
    trim: true,
  }],
  cons: [{
    type: String,
    trim: true,
  }],
});

const EditorialSchema = new Schema<IEditorial>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
    },
    approaches: [ApproachSchema],
    followUpQuestions: [{
      type: String,
      trim: true,
    }],
    relatedProblems: [{
      type: String,
      trim: true,
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance (guard for environments that may not support emitWarning)
try {
  EditorialSchema.index({ isPublished: 1 });
} catch (_) {
  // no-op in non-server environments
}

const existingModels = (mongoose as any).models as Record<string, Model<any>> | undefined;

const Editorial: Model<IEditorial> =
  (existingModels && existingModels.Editorial) || mongoose.model<IEditorial>("Editorial", EditorialSchema);

export default Editorial;