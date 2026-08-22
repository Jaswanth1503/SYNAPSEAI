import { apiClient } from './api.client';

export type ApplicationStatus = 'Eligible' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplicationItem {
  _id: string;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  applicationDeadline?: string;
  appliedDate?: string;
  matchScore: number;
  notes?: string;
}

export interface JobMetrics {
  totalTracked: number;
  totalEligible: number;
  totalApplied: number;
  totalInterview: number;
  totalOffers: number;
}

export interface JobApplicationsResponse {
  metrics: JobMetrics;
  applications: JobApplicationItem[];
}

export interface CreateJobAppPayload {
  companyName: string;
  roleTitle: string;
  status?: ApplicationStatus;
  applicationDeadline?: string;
  matchScore?: number;
  notes?: string;
}

export const jobApi = {
  async getJobApplications(): Promise<JobApplicationsResponse> {
    const res = await apiClient.get('/jobs/applications');
    return res.data.data;
  },

  async createJobApplication(payload: CreateJobAppPayload): Promise<JobApplicationItem> {
    const res = await apiClient.post('/jobs/applications', payload);
    return res.data.data;
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<JobApplicationItem> {
    const res = await apiClient.patch(`/jobs/applications/${id}/status`, { status });
    return res.data.data;
  },
};
