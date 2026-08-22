import { apiClient } from './api.client';

export interface TailorResumePayload {
  rawResumeText: string;
  targetCompany: string;
  targetRole: string;
}

export interface TailoredResumeResponseData {
  targetCompany: string;
  targetRole: string;
  atsScore: number;
  missingKeywords: string[];
  tailoredBullets: string[];
  summaryMarkdown: string;
}

export const resumeApi = {
  async tailorResume(payload: TailorResumePayload): Promise<TailoredResumeResponseData> {
    const res = await apiClient.post('/resumes/tailor', payload);
    return res.data.data;
  },
};
