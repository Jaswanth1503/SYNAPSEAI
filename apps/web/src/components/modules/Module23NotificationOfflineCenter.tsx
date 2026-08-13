import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Bell, Wifi, WifiOff, CheckCircle2, Sparkles, AlertCircle, Database, HardDriveDownload } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

export const Module23NotificationOfflineCenter: React.FC = () => {
  const { isOfflineMode, setOfflineMode } = useWorkspaceStore();
  const [filter, setFilter] = useState<'All' | 'Deadlines' | 'AI Alerts'>('All');

  const filteredNotifs = mockNotifications.filter(
    (n) => filter === 'All' || n.category === filter
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Real-time Dispatch & Progressive Offline Storage
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Notification Center & Offline Sync Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Toggle offline sync state to access cached notes, transcripts, and SM-2 flashcard decks without live media streaming.
          </p>
        </div>

        {/* Global Offline Status Toggle Button */}
        <button
          onClick={() => setOfflineMode(!isOfflineMode)}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition border shadow-lg ${
            isOfflineMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
              : 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20'
          }`}
        >
          {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          <span>{isOfflineMode ? 'Offline Mode Active' : 'Live Stream Sync Active'}</span>
        </button>
      </div>

      {/* Grid: Offline Cached Storage Status + Notifications List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Offline Storage Status Card */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" /> Offline Storage Cache
          </h2>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-300">Quick Notes & Sandboxes</span>
              <span className="text-emerald-400 font-mono font-bold">Cached (100%)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-300">SM-2 Flashcard Decks</span>
              <span className="text-emerald-400 font-mono font-bold">Cached (100%)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-300">Speech Transcripts</span>
              <span className="text-emerald-400 font-mono font-bold">Cached (100%)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-300">HLS Video Streams</span>
              <span className="text-amber-400 font-mono font-bold">Requires Network</span>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition">
            <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" /> Sync All Local Cache
          </button>
        </div>

        {/* Right Tabbed Notifications Dispatch List */}
        <div className="md:col-span-2 p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" /> Dispatch Feed
            </h2>

            {/* Filter Pills */}
            <div className="flex gap-1.5">
              {(['All', 'Deadlines', 'AI Alerts'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                    filter === cat
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotifs.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
