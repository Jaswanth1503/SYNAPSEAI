import mongoose, { Schema, Document, Model } from 'mongoose';

export type WorkspaceType = 'PERSONAL' | 'ORGANIZATIONAL';
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member';

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId;
  role: WorkspaceMemberRole;
}

export interface IWorkspace extends Document {
  name: string;
  type: WorkspaceType;
  ownerId: mongoose.Types.ObjectId;
  organizationDomain?: string;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
  },
  { _id: false }
);

const WorkspaceSchema: Schema<IWorkspace> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['PERSONAL', 'ORGANIZATIONAL'],
      required: [true, 'Workspace type is required'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    organizationDomain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    members: {
      type: [WorkspaceMemberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace: Model<IWorkspace> = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
