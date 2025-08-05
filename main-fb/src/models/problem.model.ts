import mongoose, { Document, Schema, Model } from "mongoose";

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
  tags: string[];
  starterCode: string;
  functionName: string;
  hints: string[];
  inputVariables: IInputVariable[];
  outputVariable: IOutputVariable;
  createdAt: Date;
  updatedAt: Date;
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
ProblemSchema.index({ slug: 1 }, { unique: true });

const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem; 