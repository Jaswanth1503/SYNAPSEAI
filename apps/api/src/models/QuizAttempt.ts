import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserAnswer {
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  userAnswers: IUserAnswer[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserAnswerSchema = new Schema<IUserAnswer>(
  {
    questionText: { type: String, required: true },
    selectedOption: { type: String, required: true },
    correctOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuizAttemptSchema: Schema<IQuizAttempt> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    userAnswers: { type: [UserAnswerSchema], required: true },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const QuizAttempt: Model<IQuizAttempt> = mongoose.model<IQuizAttempt>(
  'QuizAttempt',
  QuizAttemptSchema
);
