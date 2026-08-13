import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Search, Sparkles, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TranscriptSnippet } from '../../types';

export const Module6SemanticTimestampSearch: React.FC = () => {
  const { setActiveModule } = useWorkspaceStore();
  const { seekTo } = usePlayerStore();
  const [query, setQuery] = useState('state pipeline hydration');

  const mockTranscripts: TranscriptSnippet[] = [
    {
      id: 'ts-1',
      time: 262,
      formattedTime: '04:22',
      text: 'State pipeline hydration in React 18 ensures zero-cost re-renders by executing store selectors before committing atomic updates to the fiber tree.',
      matchScore: 96,
    },
    {
      id: 'ts-2',
      time: 540,
      formattedTime: '09:00',
      text: 'Integrating Monaco Editor with web worker compilers allows instantaneous background compilation without blocking the main event looper thread.',
      matchScore: 88,
    },
    {
      id: 'ts-3',
      time: 870,
      formattedTime: '14:30',
      text: 'Retention heatmaps calculate student cursor focus density over 20 temporal segments to pinpoint concept comprehension bottlenecks.',
      matchScore: 82,
    },
  ];

  const filteredTranscripts = mockTranscripts.filter(
    (t) => t.text.toLowerCase().includes(query.toLowerCase()) || query === ''
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 glow-cyan">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Vector Embedding Transcript Search
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-slate-100">
          Semantic Timestamp Search Engine
        </h1>
        <p className="text-sm text-slate-400">
          Query speech transcripts semantically to jump directly to exact video frames with vector similarity matching scores.
        </p>

        {/* Big Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any spoken phrase or concept (e.g. state pipeline hydration)..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-cyan-500/40 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Matching Vector Snippets ({filteredTranscripts.length})</span>
          <span className="text-cyan-400">Cosine Similarity Indexed</span>
        </div>

        {filteredTranscripts.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> {item.formattedTime}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  {item.matchScore}% Match Score
                </span>
              </div>
              <p className="text-sm text-slate-200 font-medium group-hover:text-cyan-200 transition">
                "{item.text}"
              </p>
            </div>

            <button
              onClick={() => {
                seekTo(item.time);
                setActiveModule('smart-player');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-400/20 transition"
            >
              Jump to {item.formattedTime} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
