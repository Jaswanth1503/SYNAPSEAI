import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'student' | 'instructor' | 'org_admin';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash?: string;
  firebaseUid?: string;
  role: UserRole;
  personalWorkspaceId?: mongoose.Types.ObjectId;
  currentOrgId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'org_admin'],
      default: 'student',
    },
    personalWorkspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    currentOrgId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
