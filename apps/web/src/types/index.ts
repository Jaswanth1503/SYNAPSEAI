export type ThemeMode = 'dark' | 'light';
export type UserRole = 'Student' | 'Instructor' | 'Admin';
export type WorkspaceScope = 'personal' | 'org';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  orgName: string;
  title: string;
  streakDays: number;
  xpPoints: number;
}

export type ModuleId =
  | 'personal-dashboard'
  | 'org-dashboard'
  | 'video-hub'
  | 'smart-player'
  | 'timestamp-search'
  | 'ai-summarizer'
  | 'ai-doubt-assistant'
  | 'mind-map'
  | 'flashcards'
  | 'teaching-engine'
  | 'coding-playground'
  | 'ai-quiz'
  | 'jam-studio'
  | 'group-study'
  | 'certificate'
  | 'resume-builder'
  | 'mock-interview'
  | 'skill-gap'
  | 'roadmap'
  | 'project-generator'
  | 'analytics'
  | 'notifications'
  | 'auth';

export interface ChapterMarker {
  time: number; // in seconds
  formattedTime: string;
  title: string;
  summary: string;
}

export interface BookmarkPin {
  id: string;
  time: number;
  note: string;
  createdAt: string;
}

export interface TranscriptSnippet {
  id: string;
  time: number;
  formattedTime: string;
  text: string;
  matchScore: number;
}

export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
  hlsUrl: string;
  category: string;
  progressPercent: number;
  chapters: ChapterMarker[];
  heatmaps: number[]; // values 0-100 across 20 segments
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface PrivateSandbox {
  id: string;
  title: string;
  language: 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';
  lastEdited: string;
  code: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: string;
  status: 'new' | 'review' | 'mastered';
}

export interface TeachingStep {
  id: number;
  title: string;
  explanation: string;
  canvasElements: {
    type: 'rect' | 'circle' | 'arrow' | 'text';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill: string;
    stroke?: string;
    text?: string;
    points?: number[];
  }[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill_blank' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  codeSnippet?: string;
}

export interface JamRecord {
  id: string;
  topic: string;
  date: string;
  durationSeconds: number;
  wpm: number;
  fillerWordsCount: number;
  fillerBreakdown: { word: string; count: number }[];
  feedbackScore: number;
  aiSummary: string;
  audioBlobUrl?: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'brush' | 'rect' | 'arrow' | 'text' | 'eraser';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  text?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  isAi?: boolean;
  citationTime?: string;
}

export interface CertificateData {
  id: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  verificationHash: string;
  issuer: string;
  qrUrl: string;
}

export interface ResumeXYZ {
  id: string;
  company: string;
  role: string;
  rawPoint: string;
  formattedXYZ: string;
  atsImpactScore: number;
}

export interface ATSMetrics {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  expectedTopic: string;
  hints: string[];
}

export interface SkillMetric {
  skillName: string;
  currentLevel: number; // 0 - 100
  targetLevel: number; // 0 - 100
  category: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Locked';
  estimatedHours: number;
  prerequisites: string[];
  description: string;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  matchScore: number;
  githubTemplateUrl: string;
  inPortfolio: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'All' | 'Deadlines' | 'AI Alerts';
  timestamp: string;
  read: boolean;
}
