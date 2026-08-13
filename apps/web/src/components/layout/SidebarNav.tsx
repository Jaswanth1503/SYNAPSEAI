import React from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { ModuleId } from '../../types';
import {
  LayoutDashboard,
  Video,
  PlaySquare,
  Search,
  FileCode2,
  GitFork,
  Layers,
  Sparkles,
  Mic,
  FileText,
  MessageSquareCode,
  Target,
  Route,
  Lightbulb,
  BarChart3,
  Users,
  Award,
  Bell,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const SidebarNav: React.FC = () => {
  const { scope, activeModule, setActiveModule } = useWorkspaceStore();

  const personalNavItems: NavItem[] = [
    { id: 'personal-dashboard', label: 'Personal Hub', icon: LayoutDashboard },
    { id: 'video-hub', label: 'Zero-Ad Video Hub', icon: Video },
    { id: 'smart-player', label: 'Smart HLS Player', icon: PlaySquare, badge: 'Live' },
    { id: 'timestamp-search', label: 'Semantic Timestamp Search', icon: Search },
    { id: 'ai-summarizer', label: 'AI Summarizer & Notes', icon: Sparkles },
    { id: 'ai-doubt-assistant', label: 'In-Video Doubt Assistant', icon: HelpCircle },
    { id: 'mind-map', label: 'Mind Map & Diagram Canvas', icon: GitFork },
    { id: 'flashcards', label: 'AI Flashcards Deck', icon: Layers, badge: 'SM-2' },
    { id: 'teaching-engine', label: 'Animated Teaching Engine', icon: Sparkles },
    { id: 'coding-playground', label: 'Dual-Pane Playground', icon: FileCode2 },
    { id: 'ai-quiz', label: 'AI Quiz & Challenges', icon: Target },
    { id: 'jam-studio', label: 'JAM Session Studio', icon: Mic, badge: 'Speech' },
    { id: 'resume-builder', label: 'Google XYZ Resume Builder', icon: FileText },
    { id: 'mock-interview', label: 'AI Technical Mock Interview', icon: MessageSquareCode },
    { id: 'roadmap', label: 'Personalized Learning Roadmap', icon: Route },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
  ];

  const orgNavItems: NavItem[] = [
    { id: 'org-dashboard', label: 'Cohort Workspace', icon: LayoutDashboard },
    { id: 'video-hub', label: 'Course Catalog & Hub', icon: Video },
    { id: 'group-study', label: 'Group Study Room', icon: Users, badge: 'LiveKit' },
    { id: 'certificate', label: 'Certificate Verification', icon: Award },
    { id: 'skill-gap', label: 'Skill Gap Visualizer', icon: Target },
    { id: 'project-generator', label: 'Portfolio Project Generator', icon: Lightbulb },
    { id: 'notifications', label: 'Notification Center', icon: Bell },
  ];

  const currentNavItems = scope === 'personal' ? personalNavItems : orgNavItems;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 dark:bg-[#070a11]/80 backdrop-blur-md flex flex-col shrink-0 hidden md:flex">
      {/* Header Label */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {scope === 'personal' ? 'Personal Scope' : 'Organizational Scope'}
        </span>
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10 glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                    isActive
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-slate-800/60 m-3 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-cyan-500/20">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
          <span>AI Assistant Pipeline</span>
          <span className="text-[10px] text-cyan-400 font-mono">v4.2 Ready</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full w-[88%]" />
        </div>
      </div>
    </aside>
  );
};
