import mongoose, { Schema, Document, Model } from 'mongoose';

export type VideoStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface IChapter {
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
}

export interface IVideo extends Document {
  title: string;
  videoUrl: string;
  audioUrl?: string;
  status: VideoStatus;
  notesMarkdown?: string;
  chapters: IChapter[];
  ownerId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    title: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    summary: { type: String, required: true },
  },
  { _id: false }
);

const VideoSchema: Schema<IVideo> = new Schema(
  {
    title: { type: String, required: [true, 'Video title is required'], trim: true },
    videoUrl: { type: String, required: [true, 'Video URL is required'] },
    audioUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    notesMarkdown: { type: String },
    chapters: { type: [ChapterSchema], default: [] },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Video: Model<IVideo> = mongoose.model<IVideo>('Video', VideoSchema);
