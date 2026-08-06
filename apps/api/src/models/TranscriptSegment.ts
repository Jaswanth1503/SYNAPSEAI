import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITranscriptSegment extends Document {
  videoId: mongoose.Types.ObjectId;
  startTime: number;
  endTime: number;
  text: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSegmentSchema: Schema<ITranscriptSegment> = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
      index: true,
    },
    startTime: {
      type: Number,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Number,
      required: [true, 'End time is required'],
    },
    text: {
      type: String,
      required: [true, 'Segment text is required'],
    },
    embedding: {
      type: [Number],
      required: [true, 'Embedding vector is required'],
      validate: [
        (val: number[]) => val.length === 1536,
        'Embedding vector must have exactly 1536 dimensions',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Optional compound index for vector search filtering
TranscriptSegmentSchema.index({ videoId: 1, startTime: 1 });

export const TranscriptSegment: Model<ITranscriptSegment> = mongoose.model<ITranscriptSegment>(
  'TranscriptSegment',
  TranscriptSegmentSchema
);
