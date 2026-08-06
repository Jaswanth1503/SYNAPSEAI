import { UserRole } from '../models/User';

export interface JwtPayloadUser {
  id: string;
  email: string;
  role: UserRole;
  personalWorkspaceId?: string;
  currentOrgId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}
