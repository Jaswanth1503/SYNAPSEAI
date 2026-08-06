import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterviewQA {
  questionId: string;
  questionText: string;
  userAnswerText?: string;
  score?: number;
  feedback?: string;
}

export interface IMockInterview extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  category: string;
  status: 'in_progress' | 'completed';
  questions: IInterviewQA[];
  overallScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQASchema = new Schema<IInterviewQA>(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    userAnswerText: { type: String },
    score: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
  },
  { _id: false }
);

const MockInterviewSchema: Schema<IMockInterview> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'Technical' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questions: { type: [InterviewQASchema], default: [] },
    overallScore: { type: Number },
  },
  { timestamps: true }
);

export const MockInterview: Model<IMockInterview> = mongoose.model<IMockInterview>(
  'MockInterview',
  MockInterviewSchema
);
