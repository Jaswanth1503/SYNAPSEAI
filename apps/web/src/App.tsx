import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkspaceStore } from './stores/useWorkspaceStore';
import { useThemeStore } from './stores/useThemeStore';
import { TopNavbar } from './components/layout/TopNavbar';
import { SidebarNav } from './components/layout/SidebarNav';
import { CommandPaletteModal } from './components/layout/CommandPaletteModal';

import { Module1PersonalHub } from './components/modules/Module1PersonalHub';
import { Module2OrgHub } from './components/modules/Module2OrgHub';
import { Module3AuthSSOModal } from './components/modules/Module3AuthSSOModal';
import { Module4ZeroAdVideoHub } from './components/modules/Module4ZeroAdVideoHub';
import { Module5SmartVideoPlayer } from './components/modules/Module5SmartVideoPlayer';
import { Module6SemanticTimestampSearch } from './components/modules/Module6SemanticTimestampSearch';
import { Module7AIVideoSummarizer } from './components/modules/Module7AIVideoSummarizer';
import { Module8AIDoubtAssistant } from './components/modules/Module8AIDoubtAssistant';
import { Module9MindMapCanvas } from './components/modules/Module9MindMapCanvas';
import { Module10AIFlashcards } from './components/modules/Module10AIFlashcards';
import { Module11AITeachingEngine } from './components/modules/Module11AITeachingEngine';
import { Module12CodingPlayground } from './components/modules/Module12CodingPlayground';
import { Module13AIQuizChallenge } from './components/modules/Module13AIQuizChallenge';
import { Module14JAMStudio } from './components/modules/Module14JAMStudio';
import { Module15GroupStudyRoom } from './components/modules/Module15GroupStudyRoom';
import { Module16CertificateVerification } from './components/modules/Module16CertificateVerification';
import { Module17ResumeBuilder } from './components/modules/Module17ResumeBuilder';
import { Module18AIMockInterview } from './components/modules/Module18AIMockInterview';
import { Module19SkillGapVisualizer } from './components/modules/Module19SkillGapVisualizer';
import { Module20PersonalizedRoadmap } from './components/modules/Module20PersonalizedRoadmap';
import { Module21ProjectIdeaGenerator } from './components/modules/Module21ProjectIdeaGenerator';
import { Module22ProgressAnalytics } from './components/modules/Module22ProgressAnalytics';
import { Module23NotificationOfflineCenter } from './components/modules/Module23NotificationOfflineCenter';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const { activeModule, isOfflineMode } = useWorkspaceStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'personal-dashboard':
        return <Module1PersonalHub />;
      case 'org-dashboard':
        return <Module2OrgHub />;
      case 'auth':
        return <Module3AuthSSOModal />;
      case 'video-hub':
        return <Module4ZeroAdVideoHub />;
      case 'smart-player':
        return <Module5SmartVideoPlayer />;
      case 'timestamp-search':
        return <Module6SemanticTimestampSearch />;
      case 'ai-summarizer':
        return <Module7AIVideoSummarizer />;
      case 'ai-doubt-assistant':
        return <Module8AIDoubtAssistant />;
      case 'mind-map':
        return <Module9MindMapCanvas />;
      case 'flashcards':
        return <Module10AIFlashcards />;
      case 'teaching-engine':
        return <Module11AITeachingEngine />;
      case 'coding-playground':
        return <Module12CodingPlayground />;
      case 'ai-quiz':
        return <Module13AIQuizChallenge />;
      case 'jam-studio':
        return <Module14JAMStudio />;
      case 'group-study':
        return <Module15GroupStudyRoom />;
      case 'certificate':
        return <Module16CertificateVerification />;
      case 'resume-builder':
        return <Module17ResumeBuilder />;
      case 'mock-interview':
        return <Module18AIMockInterview />;
      case 'skill-gap':
        return <Module19SkillGapVisualizer />;
      case 'roadmap':
        return <Module20PersonalizedRoadmap />;
      case 'project-generator':
        return <Module21ProjectIdeaGenerator />;
      case 'analytics':
        return <Module22ProgressAnalytics />;
      case 'notifications':
        return <Module23NotificationOfflineCenter />;
      default:
        return <Module1PersonalHub />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070a11] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Global Offline Status Alert Banner */}
        {isOfflineMode && (
          <div className="bg-amber-500 text-slate-950 px-4 py-1 text-center text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2">
            <span>OFFLINE SYNC MODE ACTIVE • Cached Notes, Transcripts & SM-2 Decks Available</span>
          </div>
        )}

        {/* Main Content Shell with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <SidebarNav />
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {renderActiveModule()}
          </main>
        </div>

        {/* Ctrl + K Command Palette Modal */}
        <CommandPaletteModal />
      </div>
    </QueryClientProvider>
  );
};

export default App;
