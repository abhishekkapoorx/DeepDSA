import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITestResult extends Document {
  submissionId: mongoose.Types.ObjectId;
  testCaseId: mongoose.Types.ObjectId;
  passed: boolean;
  actualOutput?: string;
  runtime?: number;
  memory?: number;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    testCaseId: {
      type: Schema.Types.ObjectId,
      ref: "TestCase",
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    actualOutput: {
      type: String,
    },
    runtime: {
      type: Number,
    },
    memory: {
      type: Number,
    },
  }
);

// Indexes for better query performance
TestResultSchema.index({ submissionId: 1, testCaseId: 1 });
TestResultSchema.index({ passed: 1 });

const TestResult: Model<ITestResult> =
  mongoose.models.TestResult || mongoose.model<ITestResult>("TestResult", TestResultSchema);

export default TestResult; 