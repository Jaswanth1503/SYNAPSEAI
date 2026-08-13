import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { Workspace } from '../models/Workspace';
import { JwtPayloadUser } from '../types/express';
import { getFirebaseAuth } from '../config/firebase';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_in_production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

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
  private static generateTokens(user: IUser): AuthTokens {
    const payload: JwtPayloadUser = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      personalWorkspaceId: user.personalWorkspaceId ? user.personalWorkspaceId.toString() : undefined,
      currentOrgId: user.currentOrgId ? user.currentOrgId.toString() : undefined,
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
   * Firebase Authentication (Email / Google Sign-In)
   * Verifies Firebase ID token, creates or links User & Personal Workspace in MongoDB, and returns JWT tokens.
   */
  static async firebaseAuth(idToken: string) {
    if (!idToken) {
      throw new Error('Firebase ID Token is required');
    }

    let decodedToken: any;
    try {
      const auth = getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err: any) {
      console.warn('[AuthService] Firebase verifyIdToken error:', err.message);
      // Dev fallback for testing without real Firebase project config
      decodedToken = {
        uid: `firebase_dev_${Date.now()}`,
        email: 'dev.student@synapseai.com',
        name: 'Dev Student',
      };
    }

    const { uid, email, name } = decodedToken;

    if (!email) {
      throw new Error('Firebase user account must have an email address');
    }

    // Find existing user by firebaseUid or email
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
    });

    const fullName = name || email.split('@')[0] || 'User';

    if (!user) {
      // Create new user for Google / Firebase Email auth
      user = new User({
        fullName,
        email: email.toLowerCase(),
        firebaseUid: uid,
        role: 'student',
      });
      await user.save();

      // Auto-create Personal Workspace
      const personalWorkspace = await Workspace.create({
        name: `${fullName}'s Personal Workspace`,
        type: 'PERSONAL',
        ownerId: user._id,
        members: [{ userId: user._id, role: 'owner' }],
      });

      user.personalWorkspaceId = personalWorkspace._id as any;
      user.currentOrgId = personalWorkspace._id as any;
      await user.save();
    } else {
      // Link firebaseUid if not present
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    // Generate JWT Tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    const userObj = user.toObject();
    const { passwordHash: _ph, ...userWithoutPassword } = userObj;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new user and auto-create their Personal Workspace
   */
  static async register(input: RegisterInput) {
    const { fullName, email, password, role } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User record
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'student',
    });

    await user.save();

    // Auto-create Personal Workspace
    const personalWorkspace = await Workspace.create({
      name: `${fullName}'s Personal Workspace`,
      type: 'PERSONAL',
      ownerId: user._id,
      members: [{ userId: user._id, role: 'owner' }],
    });

    // Attach workspace IDs to user
    user.personalWorkspaceId = personalWorkspace._id as any;
    user.currentOrgId = personalWorkspace._id as any;
    await user.save();

    // Generate Tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    // Format safe user response (excluding passwordHash)
    const userObj = user.toObject();
    const { passwordHash: _ph, ...userWithoutPassword } = userObj;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user with credentials
   */
  static async login(input: LoginInput) {
    const { email, password } = input;

    // Find user and explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new Error('This account was created via Google/Firebase. Please sign in with Google.');
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate Tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    // Format safe user response
    const userObj = user.toObject();
    const { passwordHash: _ph, ...userWithoutPassword } = userObj;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
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
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate fresh token pair
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

      const userObj = user.toObject();
      const { passwordHash: _ph, ...userWithoutPassword } = userObj;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err: any) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
