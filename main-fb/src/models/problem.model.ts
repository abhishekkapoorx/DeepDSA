import mongoose, { Document, Schema, Model } from "mongoose";

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  starterCode: string;
  functionName: string;
  inputVariables: string;
  outputVariable: string;
  hints: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: Difficulty,
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    starterCode: {
      type: String,
      required: true,
    },
    functionName: {
      type: String,
      required: true,
    },
    inputVariables: {
      type: String,
      required: true,
    },
    outputVariable: {
      type: String,
      required: true,
    },
    hints: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
ProblemSchema.index({ difficulty: 1, tags: 1 });
ProblemSchema.index({ title: "text", description: "text" });

const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem; 