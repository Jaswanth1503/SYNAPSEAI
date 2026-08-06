import { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspace.service';

export class WorkspaceController {
  /**
   * POST /api/v1/workspaces/switch
   * Accepts { workspaceId } and updates req.user.currentOrgId accordingly.
   */
  static async switchWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { workspaceId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!workspaceId) {
        res.status(400).json({
          success: false,
          message: 'workspaceId is required in request body',
        });
        return;
      }

      const result = await WorkspaceService.switchWorkspace(userId, workspaceId);

      res.status(200).json({
        success: true,
        message: 'Workspace switched successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to switch workspace',
      });
    }
  }

  /**
   * POST /api/v1/workspaces
   * Create a new workspace
   */
  static async createWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { name, type, organizationDomain } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!name || !type) {
        res.status(400).json({
          success: false,
          message: 'name and type are required',
        });
        return;
      }

      const workspace = await WorkspaceService.createWorkspace({
        name,
        type,
        ownerId: userId,
        organizationDomain,
      });

      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        data: { workspace },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create workspace',
      });
    }
  }

  /**
   * GET /api/v1/workspaces
   * Get all workspaces accessible by the current user
   */
  static async listWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const workspaces = await WorkspaceService.getUserWorkspaces(userId);

      res.status(200).json({
        success: true,
        data: { workspaces },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch workspaces',
      });
    }
  }
}
