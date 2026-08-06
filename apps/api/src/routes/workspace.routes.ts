import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All workspace routes require authentication
router.use(requireAuth);

// Workspace switch route
router.post('/switch', WorkspaceController.switchWorkspace);

// Additional workspace management routes
router.post('/', WorkspaceController.createWorkspace);
router.get('/', WorkspaceController.listWorkspaces);

export default router;
