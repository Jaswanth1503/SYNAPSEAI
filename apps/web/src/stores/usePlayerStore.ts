import { create } from 'zustand';
import { VideoLecture, BookmarkPin } from '../types';

interface PlayerState {
  currentVideo: VideoLecture | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  quality: '1080p' | '720p' | 'Auto';
  bookmarks: BookmarkPin[];
  
  setCurrentVideo: (video: VideoLecture) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setQuality: (quality: '1080p' | '720p' | 'Auto') => void;
  addBookmark: (note: string) => void;
  removeBookmark: (id: string) => void;
  seekTo: (seconds: number) => void;
}

const defaultVideo: VideoLecture = {
  id: 'vid-101',
  title: 'Advanced React 18 Architecture & System Design',
  description: 'Master concurrent rendering, custom hooks state pipelines, and high-frequency UI updates with Zustand and Monaco editor integration.',
  instructor: 'Dr. Sarah Connor',
  duration: '18:45',
  durationSeconds: 1125,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  category: 'System Architecture',
  progressPercent: 42,
  chapters: [
    { time: 0, formattedTime: '00:00', title: 'Introduction & System Overview', summary: 'Architectural overview of modern React 18 SPA stack.' },
    { time: 262, formattedTime: '04:22', title: 'State Pipeline & Hydration', summary: 'Understanding store selectors and zero-cost re-renders.' },
    { time: 540, formattedTime: '09:00', title: 'Monaco & React Flow Integration', summary: 'Connecting web worker compilers with visual diagram graphs.' },
    { time: 870, formattedTime: '14:30', title: 'HLS Video Engine Retention Optimization', summary: 'Streaming custom events and real-time retention heatmap calculation.' },
  ],
  heatmaps: [20, 35, 50, 75, 90, 85, 95, 60, 45, 80, 88, 92, 70, 65, 85, 90, 75, 60, 40, 30],
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentVideo: defaultVideo,
  currentTime: 262,
  isPlaying: false,
  playbackSpeed: 1,
  quality: '1080p',
  bookmarks: [
    { id: 'bm-1', time: 262, note: 'State selector memoization strategy', createdAt: '2 mins ago' },
    { id: 'bm-2', time: 540, note: 'Monaco worker setup', createdAt: 'Yesterday' },
  ],

  setCurrentVideo: (currentVideo) => set({ currentVideo, currentTime: 0, isPlaying: true }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setQuality: (quality) => set({ quality }),
  
  addBookmark: (note) => {
    const { currentTime, bookmarks } = get();
    const newBookmark: BookmarkPin = {
      id: `bm-${Date.now()}`,
      time: Math.floor(currentTime),
      note,
      createdAt: 'Just now',
    };
    set({ bookmarks: [...bookmarks, newBookmark] });
  },

  removeBookmark: (id) => set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
  
  seekTo: (seconds) => set({ currentTime: seconds, isPlaying: true }),
}));
