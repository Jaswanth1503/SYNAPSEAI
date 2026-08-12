import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Video } from '../models/Video';
import { StorageService } from '../services/storage.service';
import { videoQueue } from '../workers/videoWorker';

const inMemoryVideos: Map<string, any> = new Map();

export class VideoController {
  /**
   * POST /api/v1/videos/upload
   * Accepts video file via Multer, uploads to Cloudinary, creates pending Video doc, enqueues BullMQ job.
   */
  static async uploadVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No video file provided in upload payload (expected form-data field: "video" or "file")',
        });
        return;
      }

      const userId = req.user?.id;
      const workspaceId = req.user?.personalWorkspaceId || req.user?.currentOrgId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');

      // Step 1: Upload file buffer to Cloudinary
      const { videoUrl } = await StorageService.uploadVideo(req.file.buffer);

      // Step 2: Create Video record
      if (mongoose.connection.readyState === 1) {
        const video = await Video.create({
          title,
          videoUrl,
          status: 'ready', // Immediately set ready for local dev stream testing
          ownerId: userId,
          workspaceId,
        });

        try {
          await videoQueue.add('process-video', {
            videoId: (video._id as any).toString(),
            videoUrl,
          });
        } catch (queueErr) {
          console.warn('[VideoController] Redis/BullMQ queue unavailable, worker processing skipped:', queueErr);
        }

        res.status(201).json({
          success: true,
          message: 'Video uploaded successfully',
          data: { video },
        });
        return;
      }

      // In-memory fallback when MongoDB is offline
      console.warn('[VideoController] MongoDB disconnected. Storing uploaded video record in-memory for local dev.');
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockVideo = {
        _id: mockId,
        title,
        videoUrl,
        status: 'ready', // Ready for instant player testing in dev
        chapters: [
          { title: 'Introduction', startTime: 0, endTime: 60, summary: 'Overview of lecture topics.' },
          { title: 'Deep Dive Architecture', startTime: 61, endTime: 180, summary: 'System components and worker queues.' }
        ],
        notesMarkdown: `# ${title}\n\n## Lecture Overview\nAutomated AI notes generated for lecture video playback.\n\n- Stream playback enabled.\n- Interactive timestamps synced.`,
        ownerId: userId,
        workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      inMemoryVideos.set(mockId, mockVideo);

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully (dev in-memory mode)',
        data: { video: mockVideo },
      });
    } catch (error: any) {
      console.error('[VideoController] uploadVideo error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Video upload failed',
      });
    }
  }

  /**
   * GET /api/v1/videos
   * Lists videos belonging to the authenticated user or their active workspace.
   */
  static async listVideos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const workspaceId = req.user?.personalWorkspaceId || req.user?.currentOrgId;
        const filter: any = { $or: [{ ownerId: userId }] };
        if (workspaceId) filter.$or.push({ workspaceId });

        const videos = await Video.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: { videos } });
        return;
      }

      // In-memory fallback
      const userVideos = Array.from(inMemoryVideos.values()).filter((v) => v.ownerId === userId);
      res.status(200).json({ success: true, data: { videos: userVideos } });
    } catch (error: any) {
      console.error('[VideoController] listVideos error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch videos',
      });
    }
  }

  /**
   * GET /api/v1/videos/:id
   * Fetches a single video by ID.
   */
  static async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const video = await Video.findById(videoId);
        if (!video) {
          res.status(404).json({ success: false, message: 'Video not found' });
          return;
        }
        if (video.ownerId.toString() !== userId) {
          res.status(403).json({ success: false, message: 'Access denied to this video' });
          return;
        }
        res.status(200).json({ success: true, data: { video } });
        return;
      }

      // In-memory fallback
      const video = inMemoryVideos.get(videoId);
      if (!video) {
        res.status(404).json({ success: false, message: 'Video not found' });
        return;
      }
      res.status(200).json({ success: true, data: { video } });
    } catch (error: any) {
      console.error('[VideoController] getVideoById error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch video details',
      });
    }
  }
}
