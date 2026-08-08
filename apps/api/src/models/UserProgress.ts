import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  mediaId?: mongoose.Types.ObjectId;
  courseId: string;
  completionPercentage: number;
  completed: boolean;
  quizScore: number;
  lastActivityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema<IUserProgress> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    courseId: {
      type: String,
      required: true,
      default: 'course_101',
      index: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserProgress: Model<IUserProgress> = mongoose.model<IUserProgress>(
  'UserProgress',
  UserProgressSchema
);
