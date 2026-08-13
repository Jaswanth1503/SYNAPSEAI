import React from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import {
  Building2,
  Users,
  Award,
  Bell,
  PlaySquare,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
} from 'lucide-react';
import { mockLectures } from '../../data/mockData';

export const Module2OrgHub: React.FC = () => {
  const { setActiveModule } = useWorkspaceStore();
  const { setCurrentVideo } = usePlayerStore();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Org Header Banner */}
      <div className="relative p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/30 overflow-hidden glow-purple">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Building2 className="w-3.5 h-3.5" /> Quantum AI Tech Institute • Cohort 2026-A
            </div>
            <h1 className="text-2xl lg:text-4xl font-heading font-extrabold text-slate-100">
              Shared Organizational Learning OS
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Access verified cohort course tracks, collaborative LiveKit study rooms, cryptographic certificates, and team leaderboards.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModule('group-study')}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/30 transition"
            >
              <Users className="w-4 h-4" /> Join Live Study Room
            </button>
            <button
              onClick={() => setActiveModule('certificate')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <Award className="w-4 h-4 text-cyan-400" /> Verify Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Ticker */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-cyan-400 font-semibold shrink-0">
          <Bell className="w-4 h-4 animate-bounce" />
          <span className="uppercase tracking-wider text-[10px]">Announcement</span>
        </div>
        <p className="text-slate-300 truncate">
          🚀 Final Cohort Hackathon Submissions close this Friday at 23:59 UTC. Complete your Google XYZ Resume to qualify!
        </p>
        <button
          onClick={() => setActiveModule('notifications')}
          className="text-slate-400 hover:text-slate-200 text-[11px] shrink-0 underline"
        >
          View All
        </button>
      </div>

      {/* Cohort Progress & Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Course Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-slate-200 flex items-center gap-2">
              <PlaySquare className="w-5 h-5 text-cyan-400" /> Enrolled Cohort Course Tracks
            </h2>
            <button
              onClick={() => setActiveModule('video-hub')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="p-4 rounded-2xl glass-panel space-y-3 hover:border-cyan-500/40 transition group cursor-pointer"
                onClick={() => {
                  setCurrentVideo(lecture);
                  setActiveModule('smart-player');
                }}
              >
                <div className="relative rounded-xl overflow-hidden">
                  <img src={lecture.thumbnail} alt={lecture.title} className="w-full h-36 object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                    {lecture.duration}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{lecture.category}</span>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition line-clamp-1">
                    {lecture.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lecture.description}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{lecture.instructor}</span>
                    <span className="font-semibold text-cyan-400">{lecture.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${lecture.progressPercent}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Cohort Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Cohort Leaderboard
          </h2>

          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <div className="text-xs text-slate-400 flex items-center justify-between pb-2 border-b border-slate-800 font-semibold">
              <span>STUDENT</span>
              <span>XP / STREAK</span>
            </div>

            {[
              { rank: 1, name: 'Elena Rostova', xp: '4,920 XP', streak: '28 Days', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
              { rank: 2, name: 'Alex Vance (You)', xp: '3,450 XP', streak: '14 Days', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
              { rank: 3, name: 'Marcus Chen', xp: '3,120 XP', streak: '11 Days', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
              { rank: 4, name: 'Sophia Miller', xp: '2,890 XP', streak: '9 Days', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
            ].map((st) => (
              <div
                key={st.rank}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                  st.name.includes('You')
                    ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-900/40 border border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    st.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{st.rank}
                  </span>
                  <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="font-semibold">{st.name}</span>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div className="text-cyan-400">{st.xp}</div>
                  <div className="text-slate-400">{st.streak}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
