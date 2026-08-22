import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'Eligible' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface IJobApplication extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  applicationDeadline?: Date;
  appliedDate?: Date;
  matchScore: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true },
    roleTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ['Eligible', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
      default: 'Eligible',
    },
    applicationDeadline: { type: Date },
    appliedDate: { type: Date },
    matchScore: { type: Number, default: 80 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
