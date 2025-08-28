import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IInterviewMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IInterviewScoreBreakdown {
  correctness: number; // 0-10
  approach: number;    // 0-10
  clarity: number;     // 0-10
  efficiency: number;  // 0-10
  communication: number; // 0-10
}

export interface IInterview extends Document {
  userId: Types.ObjectId;
  clerkId: string; // duplicate for quick lookup by Clerk
  problemId?: Types.ObjectId; // optional if interviewing generic topics
  problemSlug?: string;       // denormalized for quick reads
  startedAt: Date;
  endedAt?: Date;
  provider: "gemini" | "openai";
  messages: IInterviewMessage[];
  dailySequence: number; // which interview number in the day (1..3)
  score?: number; // 0..10
  scoreBreakdown?: IInterviewScoreBreakdown;
  suggestions?: string[];
  improvements?: string[];
  mistakes?: string[];
  summary?: string;
}

const InterviewMessageSchema = new Schema<IInterviewMessage>({
  role: { type: String, enum: ["system", "user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const InterviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clerkId: { type: String, required: true, index: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem" },
    problemSlug: { type: String, index: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    provider: { type: String, enum: ["gemini", "openai"], default: "gemini" },
    messages: { type: [InterviewMessageSchema], default: [] },
    dailySequence: { type: Number, required: true },
    score: { type: Number, min: 0, max: 10 },
    scoreBreakdown: {
      correctness: { type: Number, min: 0, max: 10 },
      approach: { type: Number, min: 0, max: 10 },
      clarity: { type: Number, min: 0, max: 10 },
      efficiency: { type: Number, min: 0, max: 10 },
      communication: { type: Number, min: 0, max: 10 },
    },
    suggestions: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    mistakes: { type: [String], default: [] },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

InterviewSchema.index({ clerkId: 1, startedAt: 1 });
InterviewSchema.index({ userId: 1, createdAt: -1 });

const existingModels = (mongoose as any).models as Record<string, Model<any>> | undefined;

const Interview: Model<IInterview> =
  (existingModels && (existingModels.Interview as Model<IInterview>)) ||
  mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;


