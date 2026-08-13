import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Video } from '../models/Video';
import { TranscriptSegment } from '../models/TranscriptSegment';
import { videoQueue } from '../workers/videoWorker';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'synapseai',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

export class VideoController {
  /**
   * POST /api/v1/videos/presign
   * Client-Direct Cloudinary Presigned Upload Signature
   * Allows frontend to upload video files directly to Cloudinary cloud storage
   * without routing binary streams through the Express server (preventing timeouts & memory spikes).
   */
  static async generatePresignedUploadUrl(_req: Request, res: Response): Promise<void> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'synapseai_lectures';

      const paramsToSign = {
        timestamp,
        folder,
      };

      const apiSecret = process.env.CLOUDINARY_API_SECRET || 'secret';
      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

      res.status(200).json({
        success: true,
        message: 'Presigned upload signature generated successfully',
        data: {
          signature,
          timestamp,
          folder,
          apiKey: process.env.CLOUDINARY_API_KEY || '1234567890',
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'synapseai',
          uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME || 'synapseai'}/video/upload`,
        },
      });
    } catch (error: any) {
      console.error('[VideoController] Error generating presigned signature:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate presigned upload signature',
      });
    }
  }

  /**
   * POST /api/v1/videos
   * Register video metadata, create Video record with status "pending", and enqueue BullMQ processing job.
   */
  static async createVideo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const workspaceId = req.user?.workspaceId || req.body.workspaceId;
      const { title, videoUrl, audioUrl } = req.body;

      if (!userId || !title || !videoUrl) {
        res.status(400).json({
          success: false,
          message: 'title and videoUrl (Cloudinary URL) are required',
        });
        return;
      }

      // Step 1: Create Video record with status "pending"
      const video = await Video.create({
        title,
        videoUrl,
        audioUrl,
        ownerId: new mongoose.Types.ObjectId(userId),
        workspaceId: workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)
          ? new mongoose.Types.ObjectId(workspaceId)
          : undefined,
        status: 'pending',
      });

      // Step 2: Enqueue job to BullMQ video-processing queue
      await videoQueue.add('processVideo', {
        videoId: (video._id as any).toString(),
        videoUrl: video.videoUrl,
        audioUrl: video.audioUrl,
      });

      res.status(201).json({
        success: true,
        message: 'Video registered and processing queued successfully',
        data: {
          video,
          status: 'pending',
        },
      });
    } catch (error: any) {
      console.error('[VideoController] Error creating video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create video',
      });
    }
  }

  /**
   * GET /api/v1/videos/:id
   * Fetch video record status (pending -> processing -> ready), notes, chapters, and segments.
   */
  static async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        res.status(400).json({ success: false, message: 'Invalid videoId format' });
        return;
      }

      const video = await Video.findById(videoId);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      const transcriptSegments = await TranscriptSegment.find({
        videoId: new mongoose.Types.ObjectId(videoId),
      })
        .sort({ startTime: 1 })
        .select('startTime endTime text');

      res.status(200).json({
        success: true,
        data: {
          video,
          status: video.status,
          transcriptSegments,
        },
      });
    } catch (error: any) {
      console.error('[VideoController] Error fetching video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch video details',
      });
    }
  }

  /**
   * GET /api/v1/videos
   * List all videos for current user / workspace
   */
  static async listVideos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const workspaceId = req.user?.workspaceId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const filter: any = {};
      if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
        filter.workspaceId = new mongoose.Types.ObjectId(workspaceId);
      } else {
        filter.ownerId = new mongoose.Types.ObjectId(userId);
      }

      const videos = await Video.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: {
          count: videos.length,
          videos,
        },
      });
    } catch (error: any) {
      console.error('[VideoController] Error listing videos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list videos',
      });
    }
  }

  /**
   * DELETE /api/v1/videos/:id
   * Delete video and associated transcript segments
   */
  static async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        res.status(400).json({ success: false, message: 'Invalid videoId format' });
        return;
      }

      const video = await Video.findByIdAndDelete(videoId);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }

      await TranscriptSegment.deleteMany({ videoId: new mongoose.Types.ObjectId(videoId) });

      res.status(200).json({
        success: true,
        message: 'Video and transcript segments deleted successfully',
      });
    } catch (error: any) {
      console.error('[VideoController] Error deleting video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete video',
      });
    }
  }
}
