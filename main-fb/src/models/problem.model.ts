import mongoose, { Document, Schema, Model } from "mongoose";

/**
 * Problem Model with Auto Question Number Assignment
 * 
 * Features:
 * - Auto-assigns question numbers when creating new problems
 * - Fills gaps when problems are deleted (e.g., if problems 1,2,4 exist, next problem gets #3)
 * - If no gaps exist, assigns the next sequential number
 * - Manual assignment is also supported by providing questionNumber in the data
 */
export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

// Input variable interface
export interface IInputVariable {
  name: string;
  type: string;
  description?: string;
}

// Output variable interface
export interface IOutputVariable {
  type: string;
  description?: string;
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  questionNumber: number;
  tags: string[];
  starterCode: string;
  functionName: string;
  hints: string[];
  inputVariables: IInputVariable[];
  outputVariable: IOutputVariable;
  createdAt: Date;
  updatedAt: Date;
  companyTags: string[];
}

// Function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    questionNumber: {
      type: Number,
      required: false, // Will be handled in API route
      unique: true,
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
    hints: [{
      type: String,
    }],
    inputVariables: [{
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    }],
    outputVariable: {
      type: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    },
    companyTags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate slug if not provided
ProblemSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

// Index for better query performance
ProblemSchema.index({ difficulty: 1, tags: 1 });
ProblemSchema.index({ title: "text", description: "text" });

// Static method to get next available question number
ProblemSchema.statics.getNextQuestionNumber = async function(): Promise<number> {
  const existingNumbers = await this.find({}, 'questionNumber')
    .sort({ questionNumber: 1 })
    .lean();
  
  let nextNumber = 1;
  
  // Find the first gap or use the next number after the highest
  for (const problem of existingNumbers) {
    if (problem.questionNumber !== nextNumber) {
      // Found a gap, use this number
      break;
    }
    nextNumber++;
  }
  
  return nextNumber;
};


const existingModels = (mongoose as any).models as Record<string, Model<any>> | undefined;


const Problem: Model<IProblem> =
  (existingModels && existingModels.Problem) || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem; 