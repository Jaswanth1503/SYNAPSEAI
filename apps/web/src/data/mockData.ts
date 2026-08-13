import {
  VideoLecture,
  QuickNote,
  PrivateSandbox,
  FlashcardItem,
  TeachingStep,
  QuizQuestion,
  JamRecord,
  CertificateData,
  ResumeXYZ,
  ATSMetrics,
  SkillMetric,
  RoadmapNode,
  ProjectRecommendation,
  NotificationItem,
} from '../types';

export const mockLectures: VideoLecture[] = [
  {
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
  },
  {
    id: 'vid-102',
    title: 'Distributed Systems & WebSockets at Scale',
    description: 'Build real-time collaborative whiteboards and LiveKit streaming rooms with fault-tolerant pub/sub architectures.',
    instructor: 'Alex Rivera, Lead Infra Architect',
    duration: '24:10',
    durationSeconds: 1450,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Backend & Cloud',
    progressPercent: 80,
    chapters: [
      { time: 0, formattedTime: '00:00', title: 'WebSocket Handshakes & Upgrades', summary: 'Connection protocols.' },
      { time: 420, formattedTime: '07:00', title: 'LiveKit Room Routing', summary: 'Media server topology.' },
      { time: 900, formattedTime: '15:00', title: 'CRDT Canvas Syncing', summary: 'Conflict-free data types.' },
    ],
    heatmaps: [10, 40, 60, 80, 95, 90, 85, 75, 60, 50, 70, 85, 90, 95, 80, 60, 40, 30, 20, 10],
  },
  {
    id: 'vid-103',
    title: 'LLM Prompt Engineering & Vector Indexing',
    description: 'Design RAG pipelines, semantic timestamp indexing, and low-latency streaming chat response engines.',
    instructor: 'Dr. Elena Rostova',
    duration: '31:20',
    durationSeconds: 1880,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'AI & Machine Learning',
    progressPercent: 15,
    chapters: [
      { time: 0, formattedTime: '00:00', title: 'Vector Embeddings Demystified', summary: 'Cosine similarity.' },
      { time: 600, formattedTime: '10:00', title: 'Chunking Video Transcripts', summary: 'Temporal boundaries.' },
    ],
    heatmaps: [30, 45, 70, 85, 90, 80, 70, 65, 75, 85, 95, 90, 85, 70, 60, 50, 40, 30, 25, 15],
  },
];

export const mockQuickNotes: QuickNote[] = [
  {
    id: 'note-1',
    title: 'React 18 Concurrent Rendering Notes',
    content: '`useTransition` allows marking non-urgent state updates. `useDeferredValue` defers updating part of the UI for smooth frame rates.',
    tags: ['React', 'Performance', 'Hooks'],
    updatedAt: '10 mins ago',
  },
  {
    id: 'note-2',
    title: 'SuperMemo-2 (SM-2) Spaced Repetition Formula',
    content: 'EF\' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)). Repetitions n=1 -> I=1, n=2 -> I=6, n>2 -> I=I*EF.',
    tags: ['Algorithms', 'Learning', 'Math'],
    updatedAt: '2 hours ago',
  },
  {
    id: 'note-3',
    title: 'Google XYZ Resume Formula Notes',
    content: 'Accomplished [X] as measured by [Y] by doing [Z]. Example: Reduced initial bundle load latency by 45% (Y) by implementing code-splitting & dynamic imports (Z).',
    tags: ['Career', 'Resume', 'ATS'],
    updatedAt: 'Yesterday',
  },
];

export const mockSandboxes: PrivateSandbox[] = [
  {
    id: 'sb-1',
    title: 'Zustand State Pipeline Test',
    language: 'typescript',
    lastEdited: '5 mins ago',
    code: `// High-performance Zustand store with selector optimization
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 42,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

console.log("Store initialized successfully! Current count:", 42);`,
  },
  {
    id: 'sb-2',
    title: 'Vector Cosine Similarity Calculator',
    language: 'python',
    lastEdited: '1 hour ago',
    code: `import math

def cosine_similarity(v1, v2):
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    return dot_product / (magnitude1 * magnitude2)

v_query = [0.8, 0.1, 0.5]
v_doc = [0.75, 0.15, 0.48]

score = cosine_similarity(v_query, v_doc)
print(f"Semantic Match Score: {score * 100:.2f}%")`,
  },
];

export const mockFlashcards: FlashcardItem[] = [
  {
    id: 'fc-1',
    question: 'What is the primary benefit of React 18 useTransition hook?',
    answer: 'It marks state updates as non-blocking transitions, allowing urgent inputs (like typing) to interrupt high-cost renders.',
    category: 'React Internals',
    interval: 3,
    repetition: 2,
    easeFactor: 2.5,
    dueDate: 'Today',
    status: 'review',
  },
  {
    id: 'fc-2',
    question: 'Define CRDT in collaborative whiteboard applications.',
    answer: 'Conflict-free Replicated Data Type. A data structure that can be replicated across multiple nodes without requiring central locking synchronization.',
    category: 'Distributed Systems',
    interval: 6,
    repetition: 3,
    easeFactor: 2.6,
    dueDate: 'Today',
    status: 'review',
  },
  {
    id: 'fc-3',
    question: 'What does the Google XYZ format stand for?',
    answer: 'Accomplished [X] as measured by [Y] by doing [Z]. It quantify impact clearly for ATS screening algorithms.',
    category: 'Career & System Design',
    interval: 1,
    repetition: 1,
    easeFactor: 2.4,
    dueDate: 'Tomorrow',
    status: 'new',
  },
];

export const mockTeachingSteps: TeachingStep[] = [
  {
    id: 1,
    title: 'Step 1: Initialize Stack Pointer & Push Base Address',
    explanation: 'Memory address 0x7FFF is allocated on the call stack frame.',
    canvasElements: [
      { type: 'rect', x: 50, y: 50, width: 220, height: 40, fill: '#06b6d4', stroke: '#00f2fe', text: 'Stack Frame: main()' },
      { type: 'text', x: 290, y: 60, text: '0x7FFF001', fill: '#94a3b8' },
    ],
  },
  {
    id: 2,
    title: 'Step 2: Push Local Primitive Variables onto Stack',
    explanation: 'Push variable `count = 42` into index 0 of local storage register.',
    canvasElements: [
      { type: 'rect', x: 50, y: 50, width: 220, height: 40, fill: '#06b6d4', stroke: '#00f2fe', text: 'Stack Frame: main()' },
      { type: 'rect', x: 50, y: 100, width: 220, height: 40, fill: '#7928ca', stroke: '#d946ef', text: 'let count = 42' },
      { type: 'text', x: 290, y: 110, text: '0x7FFF002', fill: '#94a3b8' },
      { type: 'arrow', x: 0, y: 0, points: [300, 120, 270, 120], fill: '#10b981', stroke: '#10b981' },
    ],
  },
  {
    id: 3,
    title: 'Step 3: Execute Custom Hook Hook Pipeline Closure',
    explanation: 'Reference is pushed into heap memory register 0x8A10 while pointer is maintained.',
    canvasElements: [
      { type: 'rect', x: 50, y: 50, width: 220, height: 40, fill: '#06b6d4', stroke: '#00f2fe', text: 'Stack Frame: main()' },
      { type: 'rect', x: 50, y: 100, width: 220, height: 40, fill: '#7928ca', stroke: '#d946ef', text: 'let count = 42' },
      { type: 'rect', x: 50, y: 150, width: 220, height: 40, fill: '#10b981', stroke: '#34d399', text: 'useCustomHook() -> ptr 0x8A' },
      { type: 'circle', x: 400, y: 170, radius: 45, fill: 'rgba(0,242,254,0.2)', stroke: '#00f2fe', text: 'Heap Memory' },
    ],
  },
];

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q-1',
    type: 'mcq',
    question: 'Which custom hook in React 18 is specifically designed to defer rendering a part of the UI tree until urgent updates complete?',
    options: ['useTransition', 'useDeferredValue', 'useImperativeHandle', 'useLayoutEffect'],
    correctAnswer: 1,
    explanation: '`useDeferredValue` accepts a value and returns a deferred copy of that value, letting React delay rendering heavy UI parts while keeping input handlers responsive.',
  },
  {
    id: 'q-2',
    type: 'fill_blank',
    question: 'In HLS streaming protocol, the master file containing bandwidth variants has the extension `._______`.',
    correctAnswer: 'm3u8',
    explanation: 'HTTP Live Streaming (HLS) uses `.m3u8` playlist files containing links to `.ts` video media segments.',
  },
  {
    id: 'q-3',
    type: 'code',
    question: 'Complete the Zustand selector to select only the `theme` string from state.',
    codeSnippet: `const theme = useThemeStore((state) => state._______);`,
    correctAnswer: 'theme',
    explanation: 'Passing a granular selector function `(state) => state.theme` prevents re-renders when other non-theme store properties change.',
  },
];

export const mockJamRecords: JamRecord[] = [
  {
    id: 'jam-1',
    topic: 'Explain Event Loop Microtasks vs Macrotasks in JavaScript',
    date: '2 hours ago',
    durationSeconds: 60,
    wpm: 142,
    fillerWordsCount: 2,
    fillerBreakdown: [
      { word: 'um', count: 1 },
      { word: 'like', count: 1 },
    ],
    feedbackScore: 92,
    aiSummary: 'Clear articulation of Promise microtask queue vs setTimeout macrotask callback execution order. Strong pace.',
  },
  {
    id: 'jam-2',
    topic: 'Describe How Virtual DOM Diffing Works in React',
    date: 'Yesterday',
    durationSeconds: 60,
    wpm: 128,
    fillerWordsCount: 5,
    fillerBreakdown: [
      { word: 'um', count: 3 },
      { word: 'ah', count: 2 },
    ],
    feedbackScore: 84,
    aiSummary: 'Good mention of Fiber nodes and reconciliation algorithms. Recommend reducing hesitation before technical definitions.',
  },
];

export const mockCertificates: CertificateData[] = [
  {
    id: 'CERT-SYN-98214',
    studentName: 'Alex Vance',
    courseTitle: 'Full-Stack Smart Learning & AI Media OS Engineering',
    issueDate: 'August 12, 2026',
    verificationHash: '0x8f9a2b1c4e7d3e6f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
    issuer: 'Synapse AI Global Academy',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://synapse.ai/verify/CERT-SYN-98214',
  },
];

export const mockResumesXYZ: ResumeXYZ[] = [
  {
    id: 'xyz-1',
    company: 'Tech Giant (e.g. Amazon)',
    role: 'Senior Frontend Architect',
    rawPoint: 'Built video streaming player and added bookmarks feature for students.',
    formattedXYZ: 'Engineered high-throughput HLS custom video streaming player (Z), reducing buffering latency by 38% (Y) and elevating lecture retention across 14,000+ active learners (X).',
    atsImpactScore: 94,
  },
  {
    id: 'xyz-2',
    company: 'AI Startup (e.g. Anthropic/OpenAI partner)',
    role: 'Full Stack Engineer',
    rawPoint: 'Made an AI chat bot that answers questions in video timestamps.',
    formattedXYZ: 'Designed RAG vector transcript search engine (Z), achieving 91% semantic accuracy (Y) and enabling instant sub-second timestamp jump citations for student queries (X).',
    atsImpactScore: 91,
  },
];

export const mockATSMetrics: ATSMetrics = {
  score: 88,
  matchedKeywords: ['React 18', 'TypeScript', 'Zustand', 'HLS.js', 'System Design', 'Monaco Editor', 'WebSockets', 'Tailwind CSS'],
  missingKeywords: ['Docker', 'Kubernetes', 'GraphQL', 'CI/CD Pipeline'],
  suggestions: [
    'Add quantitative metric for state management refactoring in Amazon XYZ point.',
    'Mention micro-frontend deployment experience to target Staff Engineer benchmark.',
  ],
};

export const mockSkillMetrics: SkillMetric[] = [
  { skillName: 'React 18 Architecture', currentLevel: 92, targetLevel: 95, category: 'Frontend' },
  { skillName: 'TypeScript Strict', currentLevel: 88, targetLevel: 90, category: 'Frontend' },
  { skillName: 'Zustand & State Design', currentLevel: 95, targetLevel: 90, category: 'Frontend' },
  { skillName: 'HLS Media Streaming', currentLevel: 75, targetLevel: 85, category: 'Media' },
  { skillName: 'System Architecture', currentLevel: 70, targetLevel: 90, category: 'System' },
  { skillName: 'Vector Search / RAG', currentLevel: 65, targetLevel: 85, category: 'AI' },
];

export const mockRoadmapNodes: RoadmapNode[] = [
  {
    id: 'rm-1',
    title: 'Core React 18 & Concurrent Features',
    status: 'Completed',
    estimatedHours: 12,
    prerequisites: [],
    description: 'Master automatic batching, transitions, deferred values, and suspense boundaries.',
  },
  {
    id: 'rm-2',
    title: 'High-Performance State Management with Zustand',
    status: 'Completed',
    estimatedHours: 8,
    prerequisites: ['rm-1'],
    description: 'Build atomic slice stores, custom middleware, and devtools bindings.',
  },
  {
    id: 'rm-3',
    title: 'Interactive Canvas & Visual Graph Engine (Konva + React Flow)',
    status: 'In Progress',
    estimatedHours: 16,
    prerequisites: ['rm-2'],
    description: 'Construct interactive node maps, animated stack frame tracers, and whiteboards.',
  },
  {
    id: 'rm-4',
    title: 'Production HLS Streaming & Retention Analytics',
    status: 'In Progress',
    estimatedHours: 14,
    prerequisites: ['rm-2'],
    description: 'Build zero-ad adaptive stream player with real-time retention heatmaps.',
  },
  {
    id: 'rm-5',
    title: 'AI RAG Video Vector Search & Streaming Doubt Assistant',
    status: 'Locked',
    estimatedHours: 20,
    prerequisites: ['rm-3', 'rm-4'],
    description: 'Integrate vector transcript indexing with typewriter streaming responses.',
  },
];

export const mockProjects: ProjectRecommendation[] = [
  {
    id: 'proj-1',
    title: 'Smart AI Video OS & Interactive Code Studio',
    description: 'Production React 18 Single Page App featuring dual-pane Monaco editor, React Flow concept visualizers, and HLS streaming player.',
    techStack: ['React 18', 'TypeScript', 'Zustand', 'Monaco', 'React Flow', 'HLS.js'],
    difficulty: 'Advanced',
    matchScore: 98,
    githubTemplateUrl: 'https://github.com/synapseai/smart-learning-os-template',
    inPortfolio: true,
  },
  {
    id: 'proj-2',
    title: 'Real-time WebRTC Collaborative Whiteboard Room',
    description: 'Multi-user vector drawing canvas synced via CRDT data types with LiveKit audio/video participant grid.',
    techStack: ['React', 'Konva', 'LiveKit', 'Socket.io', 'CRDT'],
    difficulty: 'Intermediate',
    matchScore: 92,
    githubTemplateUrl: 'https://github.com/synapseai/webrtc-whiteboard-template',
    inPortfolio: false,
  },
  {
    id: 'proj-3',
    title: 'Automated Speech JAM Analyzer & WPM Meter',
    description: 'Browser MediaRecorder studio evaluating 60s speech topics for WPM rate, filler word count, and AI feedback score.',
    techStack: ['Web Audio API', 'MediaRecorder', 'Tailwind v4', 'Recharts'],
    difficulty: 'Beginner',
    matchScore: 88,
    githubTemplateUrl: 'https://github.com/synapseai/jam-studio-template',
    inPortfolio: false,
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Cohort Live Challenge',
    message: 'System Architecture Quiz on React 18 Concurrent Rendering begins in 30 minutes.',
    category: 'Deadlines',
    timestamp: '10 mins ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'AI Flashcard SM-2 Queue Ready',
    message: 'You have 3 flashcards due for spaced repetition review today.',
    category: 'AI Alerts',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'New Certificate Issued',
    message: 'Congratulations! Your certificate CERT-SYN-98214 is now verified and available on blockchain registry.',
    category: 'All',
    timestamp: 'Yesterday',
    read: true,
  },
];
