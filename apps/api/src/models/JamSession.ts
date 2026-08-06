import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFillerBreakdown {
  um: number;
  uh: number;
  like: number;
  youKnow: number;
  actually: number;
}

export interface IJamSession extends Document {
  userId: mongoose.Types.ObjectId;
  topicPrompt: string;
  transcript: string;
  durationSeconds: number;
  wpm: number;
  fillerWordsCount: number;
  fillerWordsBreakdown: IFillerBreakdown;
  grammarScore: number;
  technicalAccuracyScore: number;
  overallScore: number;
  feedbackMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

const JamSessionSchema: Schema<IJamSession> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicPrompt: { type: String, required: true, trim: true },
    transcript: { type: String, required: true },
    durationSeconds: { type: Number, required: true, default: 60 },
    wpm: { type: Number, required: true },
    fillerWordsCount: { type: Number, required: true },
    fillerWordsBreakdown: {
      um: { type: Number, default: 0 },
      uh: { type: Number, default: 0 },
      like: { type: Number, default: 0 },
      youKnow: { type: Number, default: 0 },
      actually: { type: Number, default: 0 },
    },
    grammarScore: { type: Number, required: true, min: 0, max: 100 },
    technicalAccuracyScore: { type: Number, required: true, min: 0, max: 100 },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    feedbackMarkdown: { type: String, required: true },
  },
  { timestamps: true }
);

export const JamSession: Model<IJamSession> = mongoose.model<IJamSession>('JamSession', JamSessionSchema);
