import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  userId: mongoose.Types.ObjectId;
  courseId: string;
  courseTitle: string;
  studentName: string;
  issueDate: Date;
  pdfUrl?: string;
  verificationUrl: string;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema<ICertificate> = new Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: {
      type: String,
    },
    verificationUrl: {
      type: String,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Certificate: Model<ICertificate> = mongoose.model<ICertificate>(
  'Certificate',
  CertificateSchema
);
