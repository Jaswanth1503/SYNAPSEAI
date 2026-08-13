import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Search, X, Video, FileText, Code2, Sparkles, ArrowRight } from 'lucide-react';
import { mockLectures, mockQuickNotes, mockSandboxes } from '../../data/mockData';

export const CommandPaletteModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, setActiveModule } = useWorkspaceStore();
  const { seekTo, setCurrentVideo } = usePlayerStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredLectures = mockLectures.filter(
    (l) => l.title.toLowerCase().includes(query.toLowerCase()) || l.category.toLowerCase().includes(query.toLowerCase())
  );
  const filteredNotes = mockQuickNotes.filter(
    (n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())
  );
  const filteredSandboxes = mockSandboxes.filter(
    (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.language.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900/90 dark:bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden glow-cyan">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-cyan-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, vector search transcripts, or jump to module (Ctrl+K)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none text-base font-medium"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded font-mono mr-2">
            ESC
          </kbd>
          <button
            onClick={() => setSearchOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Quick Jump Shortcuts */}
          {query === '' && (
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quick Module Jump
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveModule('smart-player');
                    setSearchOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left text-sm transition"
                >
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200 font-medium">Smart HLS Player</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModule('coding-playground');
                    setSearchOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left text-sm transition"
                >
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-200 font-medium">Monaco Playground</span>
                </button>
              </div>
            </div>
          )}

          {/* Video Streams */}
          {filteredLectures.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400" /> Lecture Streams & Timestamps
              </div>
              <div className="space-y-1.5">
                {filteredLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    onClick={() => {
                      setCurrentVideo(lecture);
                      setActiveModule('smart-player');
                      setSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/30 cursor-pointer group transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={lecture.thumbnail} alt={lecture.title} className="w-10 h-7 object-cover rounded-md" />
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                          {lecture.title}
                        </div>
                        <div className="text-xs text-slate-400">{lecture.category} • {lecture.duration}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Personal Notes
              </div>
              <div className="space-y-1.5">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveModule('personal-dashboard');
                      setSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/30 cursor-pointer group transition"
                  >
                    <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-300">{note.title}</div>
                    <div className="text-xs text-slate-400 truncate">{note.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sandboxes */}
          {filteredSandboxes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" /> Saved Code Sandboxes
              </div>
              <div className="space-y-1.5">
                {filteredSandboxes.map((sb) => (
                  <div
                    key={sb.id}
                    onClick={() => {
                      setActiveModule('coding-playground');
                      setSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-purple-950/30 border border-transparent hover:border-purple-500/30 cursor-pointer group transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-purple-300">{sb.title}</div>
                      <div className="text-xs text-slate-400 uppercase">{sb.language} • {sb.lastEdited}</div>
                    </div>
                    <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300 font-mono">
                      Run
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
