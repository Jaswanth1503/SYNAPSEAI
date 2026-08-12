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
  private static generateTokens(userPayload: { id: string; email: string; role: UserRole; personalWorkspaceId?: string; currentOrgId?: string }): AuthTokens {
    const payload: JwtPayloadUser = {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
      personalWorkspaceId: userPayload.personalWorkspaceId,
      currentOrgId: userPayload.currentOrgId,
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
    const { fullName, email, password, role } = input;
    const lowerEmail = email.toLowerCase();

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
      });

      await user.save();

      const personalWorkspace = await Workspace.create({
        name: `${fullName}'s Personal Workspace`,
        type: 'PERSONAL',
        ownerId: user._id,
        members: [{ userId: user._id, role: 'owner' }],
      });

      user.personalWorkspaceId = personalWorkspace._id as any;
      user.currentOrgId = personalWorkspace._id as any;
      await user.save();

      const { accessToken, refreshToken } = this.generateTokens({
        id: (user._id as any).toString(),
        email: user.email,
        role: user.role,
        personalWorkspaceId: user.personalWorkspaceId?.toString(),
        currentOrgId: user.currentOrgId?.toString(),
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
    const mockWorkspaceId = new mongoose.Types.ObjectId().toString();
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
    });

    const { passwordHash: _ph, ...userWithoutPassword } = mockUser;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Login user with credentials
   */
  static async login(input: LoginInput) {
    const { email, password } = input;
    const lowerEmail = email.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: lowerEmail }).select('+passwordHash');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordMatch) {
        throw new Error('Invalid email or password');
      }

      const { accessToken, refreshToken } = this.generateTokens({
        id: (user._id as any).toString(),
        email: user.email,
        role: user.role,
        personalWorkspaceId: user.personalWorkspaceId?.toString(),
        currentOrgId: user.currentOrgId?.toString(),
      });

      const userObj = user.toObject();
      const { passwordHash: _ph, ...userWithoutPassword } = userObj;

      return { user: userWithoutPassword, accessToken, refreshToken };
    }

    // In-memory fallback
    const user = inMemoryUsers.get(lowerEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens({
      id: user._id,
      email: user.email,
      role: user.role,
      personalWorkspaceId: user.personalWorkspaceId,
      currentOrgId: user.currentOrgId,
    });

    const { passwordHash: _ph, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Refresh Access Token using Refresh Token
   */
  static async refreshToken(refreshTokenString: string) {
    if (!refreshTokenString) {
      throw new Error('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshTokenString, REFRESH_TOKEN_SECRET) as JwtPayloadUser;

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id);
        if (!user) {
          throw new Error('User not found');
        }

        const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({
          id: (user._id as any).toString(),
          email: user.email,
          role: user.role,
          personalWorkspaceId: user.personalWorkspaceId?.toString(),
          currentOrgId: user.currentOrgId?.toString(),
        });

        const userObj = user.toObject();
        const { passwordHash: _ph, ...userWithoutPassword } = userObj;

        return { user: userWithoutPassword, accessToken, refreshToken: newRefreshToken };
      }

      // In-memory fallback
      const user = Array.from(inMemoryUsers.values()).find((u) => u._id === decoded.id);
      if (!user) {
        const mockUserPayload = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'student',
          personalWorkspaceId: decoded.personalWorkspaceId || 'mock_ws_id',
          currentOrgId: decoded.currentOrgId || 'mock_ws_id',
        };
        const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(mockUserPayload);
        const mockUserObj = {
          _id: decoded.id,
          fullName: 'QA Student',
          email: decoded.email,
          role: decoded.role || 'student',
          personalWorkspaceId: decoded.personalWorkspaceId || 'mock_ws_id',
          currentOrgId: decoded.currentOrgId || 'mock_ws_id',
        };
        return { user: mockUserObj, accessToken, refreshToken: newRefreshToken };
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({
        id: user._id,
        email: user.email,
        role: user.role,
        personalWorkspaceId: user.personalWorkspaceId,
        currentOrgId: user.currentOrgId,
      });
      const { passwordHash: _ph, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, accessToken, refreshToken: newRefreshToken };
    } catch (err: any) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
