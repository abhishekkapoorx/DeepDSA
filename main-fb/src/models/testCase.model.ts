import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITestCase extends Document {
  input: string;
  output: string;
  isHidden: boolean;
  problemId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
TestCaseSchema.index({ problemId: 1, isHidden: 1 });

const TestCase: Model<ITestCase> =
  mongoose.models.TestCase || mongoose.model<ITestCase>("TestCase", TestCaseSchema);

export default TestCase; 