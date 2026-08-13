import React, { useState } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Sparkles, FileText, CheckCircle2, ListFilter, ArrowRight, Bookmark } from 'lucide-react';

export const Module7AIVideoSummarizer: React.FC = () => {
  const { currentVideo, seekTo } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'markdown' | 'executive' | 'chapters'>('markdown');

  if (!currentVideo) return null;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-2 glow-cyan">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Automated AI Video Summarizer Panel
        </div>
        <h2 className="text-lg font-heading font-extrabold text-slate-100">
          {currentVideo.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Instructor: {currentVideo.instructor}</span> • <span>Duration: {currentVideo.duration}</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('markdown')}
          className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'markdown' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Markdown Notes
        </button>
        <button
          onClick={() => setActiveTab('executive')}
          className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'executive' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Key Takeaways
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'chapters' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" /> Chapters & Links
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        {activeTab === 'markdown' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <h3 className="text-sm font-bold text-cyan-400 font-heading"># Lecture Architecture Summary</h3>
            <p>
              React 18 introduces concurrent rendering primitives designed to optimize complex SPA rendering workloads. By decoupling store state hydration from UI paint updates, applications achieve consistent 60FPS frame rates under heavy compute tasks.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
              {`// State Selector Optimization Pipeline
const selector = (state) => state.activeModule;
const activeModule = useWorkspaceStore(selector);`}
            </div>
            <p>
              Key features emphasized include atomic slice isolation, zero re-render overhead with custom memo selectors, and worker thread compilation.
            </p>
          </div>
        )}

        {activeTab === 'executive' && (
          <div className="space-y-3">
            {[
              'Concurrent rendering decouples high-priority user input handlers from heavy component re-renders.',
              'SM-2 spaced repetition algorithms schedule optimal flashcard review queues for memory retention.',
              'Monaco code editor instances compile language code inside web workers, keeping main looper thread smooth.',
              'Vector embeddings enable sub-second semantic search across video lecture transcripts.',
            ].map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-2.5">
            {currentVideo.chapters.map((ch, idx) => (
              <div
                key={idx}
                onClick={() => seekTo(ch.time)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer group transition"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center gap-2">
                    <span className="font-mono text-cyan-400">{ch.formattedTime}</span>
                    <span>{ch.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{ch.summary}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
