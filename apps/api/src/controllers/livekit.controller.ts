import { Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secretsecretsecretsecretsecretsecret';

export class LiveKitController {
  /**
   * POST /api/v1/study-rooms/token
   * Mint LiveKit access token with video join grants
   */
  static async createToken(req: Request, res: Response): Promise<void> {
    try {
      const { roomName, identity } = req.body;
      const userIdentity = identity || req.user?.id || `user_${Math.floor(Math.random() * 10000)}`;

      if (!roomName) {
        res.status(400).json({
          success: false,
          message: 'roomName is required',
        });
        return;
      }

      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: userIdentity,
      });

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      });

      const token = await at.toJwt();

      res.status(200).json({
        success: true,
        message: 'LiveKit token generated successfully',
        data: {
          token,
          roomName,
          identity: userIdentity,
        },
      });
    } catch (error: any) {
      console.error('[LiveKitController] Error generating token:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mint LiveKit token',
      });
    }
  }
}
