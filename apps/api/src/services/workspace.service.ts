import mongoose from 'mongoose';
import { Workspace, IWorkspace, WorkspaceType } from '../models/Workspace';
import { User } from '../models/User';

export interface CreateWorkspaceInput {
  name: string;
  type: WorkspaceType;
  ownerId: string;
  organizationDomain?: string;
}

export class WorkspaceService {
  /**
   * Switch the active workspace for a user
   */
  static async switchWorkspace(userId: string, workspaceId: string) {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      throw new Error('Invalid workspaceId provided');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Verify user is owner OR a member of this workspace
    const isOwner = workspace.ownerId.toString() === userId;
    const isMember = workspace.members.some((m) => m.userId.toString() === userId);

    if (!isOwner && !isMember) {
      throw new Error('Access denied. You are not a member of this workspace.');
    }

    // Update user's currentOrgId to the target workspaceId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { currentOrgId: new mongoose.Types.ObjectId(workspaceId) },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      user: updatedUser,
      currentWorkspace: workspace,
    };
  }

  /**
   * Create a new workspace
   */
  static async createWorkspace(input: CreateWorkspaceInput) {
    const { name, type, ownerId, organizationDomain } = input;

    const workspace = await Workspace.create({
      name,
      type,
      ownerId: new mongoose.Types.ObjectId(ownerId),
      organizationDomain,
      members: [{ userId: new mongoose.Types.ObjectId(ownerId), role: 'owner' }],
    });

    return workspace;
  }

  /**
   * Get all workspaces accessible by user
   */
  static async getUserWorkspaces(userId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const workspaces = await Workspace.find({
      $or: [{ ownerId: userObjId }, { 'members.userId': userObjId }],
    });

    return workspaces;
  }
}
