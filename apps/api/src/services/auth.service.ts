import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser, UserRole } from '../models/User';
import { Workspace } from '../models/Workspace';
import { JwtPayloadUser } from '../types/express';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_in_production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// In-memory user fallback store when local MongoDB service is offline
const inMemoryUsers: Map<string, any> = new Map();

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  organizationId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Helper to generate JWT Access and Refresh tokens
   */
  private static generateTokens(userPayload: { id: string; email: string; role: UserRole; personalWorkspaceId?: string; currentOrgId?: string; organizationId?: string }): AuthTokens {
    const payload: JwtPayloadUser = {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
      personalWorkspaceId: userPayload.personalWorkspaceId,
      currentOrgId: userPayload.currentOrgId,
      organizationId: userPayload.organizationId || userPayload.currentOrgId,
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user and auto-create their Personal Workspace
   */
  static async register(input: RegisterInput) {
    const { fullName, email, password, role, organizationId } = input;
    const lowerEmail = email.toLowerCase();

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // If MongoDB is connected, execute Mongoose queries
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: lowerEmail });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        fullName,
        email: lowerEmail,
        passwordHash,
        role: role || 'student',
        currentOrgId: organizationId && mongoose.Types.ObjectId.isValid(organizationId) ? new mongoose.Types.ObjectId(organizationId) : undefined,
      });

      await user.save();

      const personalWorkspace = await Workspace.create({
        name: `${fullName}'s Personal Workspace`,
        type: 'PERSONAL',
        ownerId: user._id,
        members: [{ userId: user._id, role: 'owner' }],
      });

      user.personalWorkspaceId = personalWorkspace._id as any;
      if (!user.currentOrgId) {
        user.currentOrgId = personalWorkspace._id as any;
      }
      await user.save();

      const { accessToken, refreshToken } = this.generateTokens({
        id: (user._id as any).toString(),
        email: user.email,
        role: user.role,
        personalWorkspaceId: user.personalWorkspaceId?.toString(),
        currentOrgId: user.currentOrgId?.toString(),
        organizationId: organizationId || user.currentOrgId?.toString(),
      });

      const userObj = user.toObject();
      const { passwordHash: _ph, ...userWithoutPassword } = userObj;

      return { user: userWithoutPassword, accessToken, refreshToken };
    }

    // In-memory fallback for local development when MongoDB is offline
    console.warn('[AuthService] MongoDB disconnected. Using in-memory user store for dev/testing.');
    if (inMemoryUsers.has(lowerEmail)) {
      throw new Error('User with this email already exists');
    }

    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockWorkspaceId = organizationId || new mongoose.Types.ObjectId().toString();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const mockUser = {
      _id: mockUserId,
      fullName,
      email: lowerEmail,
      passwordHash,
      role: role || 'student',
      personalWorkspaceId: mockWorkspaceId,
      currentOrgId: mockWorkspaceId,
      organizationId: mockWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryUsers.set(lowerEmail, mockUser);

    const { accessToken, refreshToken } = this.generateTokens({
      id: mockUserId,
      email: lowerEmail,
      role: role || 'student',
      personalWorkspaceId: mockWorkspaceId,
      currentOrgId: mockWorkspaceId,
      organizationId: mockWorkspaceId,
    });

    const { passwordHash: _ph, ...userWithoutPassword } = mockUser;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Login user with email and password
   */
  static async login(input: LoginInput) {
    const { email, password } = input;
    const lowerEmail = email.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: lowerEmail });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const { accessToken, refreshToken } = this.generateTokens({
        id: (user._id as any).toString(),
        email: user.email,
        role: user.role,
        personalWorkspaceId: user.personalWorkspaceId?.toString(),
        currentOrgId: user.currentOrgId?.toString(),
        organizationId: user.currentOrgId?.toString(),
      });

      const userObj = user.toObject();
      const { passwordHash: _ph, ...userWithoutPassword } = userObj;

      return { user: userWithoutPassword, accessToken, refreshToken };
    }

    // In-memory login fallback
    const user = inMemoryUsers.get(lowerEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens({
      id: user._id,
      email: user.email,
      role: user.role,
      personalWorkspaceId: user.personalWorkspaceId,
      currentOrgId: user.currentOrgId,
      organizationId: user.organizationId || user.currentOrgId,
    });

    const { passwordHash: _ph, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayloadUser;

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        personalWorkspaceId: decoded.personalWorkspaceId,
        currentOrgId: decoded.currentOrgId,
        organizationId: decoded.organizationId,
      });

      let userObj: any = {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        personalWorkspaceId: decoded.personalWorkspaceId,
        currentOrgId: decoded.currentOrgId,
      };

      if (mongoose.connection.readyState === 1) {
        const found = await User.findById(decoded.id).select('-passwordHash');
        if (found) userObj = found.toObject();
      }

      return { user: userObj, accessToken, refreshToken: newRefreshToken };
    } catch (_error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
