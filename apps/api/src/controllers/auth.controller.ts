import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, password, role } = req.body;

      if (!fullName || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'fullName, email, and password are required',
        });
        return;
      }

      const result = await AuthService.register({ fullName, email, password, role });

      // Set httpOnly cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await AuthService.login({ email, password });

      // Set httpOnly cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie or body fallback
      const token = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Refresh token cookie or body parameter required',
        });
        return;
      }

      const result = await AuthService.refreshToken(token);

      // Set updated httpOnly refresh cookie
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Access token refreshed successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  /**
   * GET /api/v1/auth/me
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
          res.status(404).json({ success: false, message: 'User not found' });
          return;
        }

        res.status(200).json({
          success: true,
          data: { user },
        });
        return;
      }

      // Offline dev fallback
      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: userId,
            fullName: 'QA Student',
            email: req.user?.email || 'qa_student@synapseai.io',
            role: req.user?.role || 'student',
            personalWorkspaceId: req.user?.personalWorkspaceId || 'ws_dev_123',
            currentOrgId: req.user?.currentOrgId || 'ws_dev_123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user profile',
      });
    }
  }
}
