import { apiClient } from './api.client';

export type VideoStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface VideoChapter {
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
}

export interface VideoRecord {
  _id: string;
  title: string;
  videoUrl: string;
  audioUrl?: string;
  status: VideoStatus;
  notesMarkdown?: string;
  chapters: VideoChapter[];
  ownerId: string;
  workspaceId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const videoApi = {
  async listVideos(): Promise<VideoRecord[]> {
    const res = await apiClient.get('/videos');
    return res.data.data.videos;
  },

  async getVideoById(id: string): Promise<VideoRecord> {
    const res = await apiClient.get(`/videos/${id}`);
    return res.data.data.video;
  },

  async uploadVideo(formData: FormData): Promise<VideoRecord> {
    const res = await apiClient.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.video;
  },
};
