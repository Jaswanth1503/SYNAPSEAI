import { UserRole } from '../models/User';

export interface JwtPayloadUser {
  id: string;
  email: string;
  role: UserRole;
  personalWorkspaceId?: string;
  currentOrgId?: string;
  workspaceId?: string; // Stateless active workspace from X-Workspace-ID header or fallback
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}
