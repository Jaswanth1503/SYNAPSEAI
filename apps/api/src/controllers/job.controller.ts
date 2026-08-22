import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { JobApplication, ApplicationStatus } from '../models/JobApplication';

const inMemoryApplications: Map<string, any[]> = new Map();

export const createJobAppSchema = z.object({
  companyName: z.string().min(2, 'companyName is required'),
  roleTitle: z.string().min(2, 'roleTitle is required'),
  status: z.enum(['Eligible', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected']).optional().default('Eligible'),
  applicationDeadline: z.string().optional(),
  matchScore: z.number().optional().default(85),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['Eligible', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected']),
});

export class JobController {
  /**
   * GET /api/v1/jobs/applications
   * Fetch all job applications and placement readiness metrics for authenticated user
   */
  static async getJobApplications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      let applications: any[] = [];
      if (mongoose.connection.readyState === 1) {
        applications = await JobApplication.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ updatedAt: -1 });
      } else {
        applications = inMemoryApplications.get(userId) || [];
      }

      // Seed initial sample applications if empty
      if (applications.length === 0) {
        const seedApps = [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            companyName: 'Google',
            roleTitle: 'Full Stack AI Engineer',
            status: 'Interview' as ApplicationStatus,
            applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            matchScore: 92,
            notes: 'Round 2 Technical System Design scheduled for Friday.',
          },
          {
            _id: new mongoose.Types.ObjectId().toString(),
            companyName: 'Anthropic',
            roleTitle: 'AI / RAG Specialist',
            status: 'Applied' as ApplicationStatus,
            applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            matchScore: 88,
            notes: 'Submitted tailored Google XYZ format resume.',
          },
          {
            _id: new mongoose.Types.ObjectId().toString(),
            companyName: 'OpenAI',
            roleTitle: 'Backend Queues Architect',
            status: 'Eligible' as ApplicationStatus,
            applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            matchScore: 85,
            notes: 'Recommended based on BullMQ & Systems skill gap score.',
          },
        ];

        if (mongoose.connection.readyState === 1) {
          const docs = await JobApplication.insertMany(
            seedApps.map((a) => ({ ...a, userId: new mongoose.Types.ObjectId(userId) }))
          );
          applications = docs;
        } else {
          applications = seedApps;
          inMemoryApplications.set(userId, seedApps);
        }
      }

      // Calculate summary metrics
      const totalTracked = applications.length;
      const totalEligible = applications.filter((a) => a.status === 'Eligible').length;
      const totalApplied = applications.filter((a) => a.status === 'Applied' || a.status === 'Screening').length;
      const totalInterview = applications.filter((a) => a.status === 'Interview').length;
      const totalOffers = applications.filter((a) => a.status === 'Offer').length;

      res.status(200).json({
        success: true,
        message: 'Job applications retrieved successfully',
        data: {
          metrics: {
            totalTracked,
            totalEligible,
            totalApplied,
            totalInterview,
            totalOffers,
          },
          applications,
        },
      });
    } catch (error: any) {
      console.error('[JobController] Error fetching applications:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch job applications' });
    }
  }

  /**
   * POST /api/v1/jobs/applications
   * Create a new placement job application entry
   */
  static async createJobApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validation = createJobAppSchema.safeParse(req.body);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid request body',
          errors: validation.error.format(),
        });
        return;
      }

      const { companyName, roleTitle, status, applicationDeadline, matchScore, notes } = validation.data;

      const deadlineDate = applicationDeadline ? new Date(applicationDeadline) : undefined;
      const appliedDate = status === 'Applied' ? new Date() : undefined;

      let newApp: any = null;
      if (mongoose.connection.readyState === 1) {
        newApp = await JobApplication.create({
          userId: new mongoose.Types.ObjectId(userId),
          companyName,
          roleTitle,
          status,
          applicationDeadline: deadlineDate,
          appliedDate,
          matchScore,
          notes,
        });
      } else {
        const id = new mongoose.Types.ObjectId().toString();
        newApp = {
          _id: id,
          userId,
          companyName,
          roleTitle,
          status,
          applicationDeadline: deadlineDate,
          appliedDate,
          matchScore,
          notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const existing = inMemoryApplications.get(userId) || [];
        existing.unshift(newApp);
        inMemoryApplications.set(userId, existing);
      }

      res.status(201).json({
        success: true,
        message: 'Job application created successfully',
        data: newApp,
      });
    } catch (error: any) {
      console.error('[JobController] Error creating application:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create job application' });
    }
  }

  /**
   * PATCH /api/v1/jobs/applications/:id/status
   * Update status of an existing job application
   */
  static async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const validation = updateStatusSchema.safeParse(req.body);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!validation.success) {
        res.status(400).json({ success: false, message: 'Invalid status payload' });
        return;
      }

      const { status } = validation.data;
      const appId = Array.isArray(id) ? id[0] : id;

      let updatedApp: any = null;
      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(appId)) {
          updatedApp = await JobApplication.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(appId), userId: new mongoose.Types.ObjectId(userId) },
            { status, appliedDate: status === 'Applied' ? new Date() : undefined },
            { new: true }
          );
        }
      } else {
        const userApps = inMemoryApplications.get(userId) || [];
        const app = userApps.find((a) => a._id === appId);
        if (app) {
          app.status = status;
          if (status === 'Applied') app.appliedDate = new Date();
          updatedApp = app;
        }
      }

      if (!updatedApp) {
        res.status(404).json({ success: false, message: 'Job application not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApp,
      });
    } catch (error: any) {
      console.error('[JobController] Error updating application status:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to update application status' });
    }
  }
}
