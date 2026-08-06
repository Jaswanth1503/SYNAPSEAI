import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFlashcard extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  front: string;
  back: string;
  repetitionCount: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema: Schema<IFlashcard> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    front: { type: String, required: [true, 'Front content is required'], trim: true },
    back: { type: String, required: [true, 'Back content is required'], trim: true },
    repetitionCount: { type: Number, default: 0 },
    interval: { type: Number, default: 1 },
    easeFactor: { type: Number, default: 2.5 },
    nextReviewDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Flashcard: Model<IFlashcard> = mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
