import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import {
  Sparkles,
  BookOpen,
  Code2,
  Mic,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Flame,
  Zap,
} from 'lucide-react';
import { mockQuickNotes, mockSandboxes, mockJamRecords, mockLectures } from '../../data/mockData';

export const Module1PersonalHub: React.FC = () => {
  const { setActiveModule } = useWorkspaceStore();
  const { setCurrentVideo } = usePlayerStore();
  const [notes, setNotes] = useState(mockQuickNotes);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent || 'Quick capture...',
      tags: ['Personal', 'QuickNote'],
      updatedAt: 'Just now',
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/30 glow-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Personal Workspace Dashboard
          </div>
          <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-slate-100">
            Welcome Back, <span className="text-cyan-400">Alex</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Track your personal revision queues, code sandboxes, 60-second speech practice records, and saved lecture notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span>14 Day Streak</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>3,450 XP</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Revision Flashcards Due</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">3 Deck Cards</div>
            <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> SM-2 Spaced Repetition
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-purple-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Saved Code Sandboxes</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">2 Active</div>
            <div className="text-[10px] text-purple-400 mt-1">Monaco Multi-Language</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Code2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Speech JAM Score</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">92 / 100</div>
            <div className="text-[10px] text-emerald-400 mt-1">142 WPM Pace</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Mic className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Video Hours Watched</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">18.4 Hrs</div>
            <div className="text-[10px] text-amber-400 mt-1">88% Retention Score</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Notes & Sandboxes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick NotePad */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Quick NotePad
              </h2>
              <span className="text-xs text-slate-400">Auto-saved to Local Storage</span>
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title (e.g. React 18 Concurrent Rendering)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Type key takeaways, formulas, or syntax notes..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Save Note
              </button>
            </form>

            <div className="space-y-2.5 mt-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{note.title}</span>
                    <span className="text-[10px] text-slate-400">{note.updatedAt}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{note.content}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {note.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Private Sandboxes List */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" /> Private Code Sandboxes
              </h2>
              <button
                onClick={() => setActiveModule('coding-playground')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Open Playground <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockSandboxes.map((sb) => (
                <div
                  key={sb.id}
                  onClick={() => setActiveModule('coding-playground')}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer group transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">{sb.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {sb.language}
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-400 mt-2 line-clamp-3 bg-slate-950 p-2 rounded-lg">
                    {sb.code}
                  </pre>
                  <div className="text-[10px] text-slate-400 mt-2">Edited {sb.lastEdited}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: JAM Recordings & Recommended Next Lecture */}
        <div className="space-y-6">
          {/* Continue Watching Card */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Continue Watching</h2>
            <div className="relative rounded-xl overflow-hidden group border border-slate-800">
              <img src={mockLectures[0].thumbnail} alt="Lecture" className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => {
                    setCurrentVideo(mockLectures[0]);
                    setActiveModule('smart-player');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-400/30"
                >
                  Resume Lecture
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">{mockLectures[0].title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{mockLectures[0].duration} • 42% Completed</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-cyan-400 h-full w-[42%]" />
              </div>
            </div>
          </div>

          {/* Recent JAM Recordings */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" /> JAM Speech History
              </h2>
              <button
                onClick={() => setActiveModule('jam-studio')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                New 60s Test <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {mockJamRecords.map((jam) => (
                <div key={jam.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span className="truncate max-w-[180px]">{jam.topic}</span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {jam.feedbackScore}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{jam.wpm} WPM</span>
                    <span>{jam.fillerWordsCount} Filler Words</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 italic bg-slate-950/60 p-2 rounded-lg">
                    "{jam.aiSummary}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
