import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Search, ShieldCheck, Play, Clock, Sparkles } from 'lucide-react';
import { mockLectures } from '../../data/mockData';

export const Module4ZeroAdVideoHub: React.FC = () => {
  const { setActiveModule } = useWorkspaceStore();
  const { setCurrentVideo } = usePlayerStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'System Architecture', 'Backend & Cloud', 'AI & Machine Learning'];

  const filteredLectures = mockLectures.filter((lec) => {
    const matchesCat = selectedCategory === 'All' || lec.category === selectedCategory;
    const matchesSearch =
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glow-cyan">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Zero-Ad Protected Streaming Infrastructure
          </div>
          <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-slate-100">
            High-Bandwidth Media Library
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Distraction-free adaptive HLS stream pipeline with vector timestamp indexing and retention heatmaps.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter lectures by title..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLectures.map((lecture) => (
          <div
            key={lecture.id}
            className="rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition overflow-hidden group flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden aspect-video">
              <img
                src={lecture.thumbnail}
                alt={lecture.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                <button
                  onClick={() => {
                    setCurrentVideo(lecture);
                    setActiveModule('smart-player');
                  }}
                  className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 shadow-lg shadow-cyan-400/40 transition"
                >
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-slate-200 flex items-center gap-1 border border-slate-800">
                <Clock className="w-3 h-3 text-cyan-400" /> {lecture.duration}
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/90 text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Zero Ads
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{lecture.category}</span>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition line-clamp-1 mt-0.5">
                  {lecture.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lecture.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{lecture.instructor}</span>
                  <span className="font-semibold text-cyan-400">{lecture.progressPercent}% Watched</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full" style={{ width: `${lecture.progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
