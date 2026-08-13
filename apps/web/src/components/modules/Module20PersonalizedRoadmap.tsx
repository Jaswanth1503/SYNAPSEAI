import React from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Route, CheckCircle2, Clock, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { mockRoadmapNodes } from '../../data/mockData';

export const Module20PersonalizedRoadmap: React.FC = () => {
  const { setActiveModule } = useWorkspaceStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> AI-Generated Career Roadmap
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Senior Frontend Architect Learning Path
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adaptive curriculum node graph updated automatically based on your skill gap evaluation scores.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
          Curriculum Progress: 40%
        </div>
      </div>

      {/* Interactive Node Path Tree */}
      <div className="space-y-4 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-800">
        {mockRoadmapNodes.map((node, idx) => {
          const isCompleted = node.status === 'Completed';
          const isInProgress = node.status === 'In Progress';
          const isLocked = node.status === 'Locked';

          return (
            <div key={node.id} className="relative pl-14 group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute left-4 top-5 -translate-x-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/40'
                    : isInProgress
                    ? 'bg-cyan-500 border-cyan-400 animate-pulse shadow-lg shadow-cyan-500/40'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
              </div>

              {/* Card Content */}
              <div
                className={`p-5 rounded-2xl glass-panel border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isInProgress ? 'border-cyan-500/40 glow-cyan' : 'border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {node.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {node.estimatedHours} Hours
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{node.title}</h3>
                  <p className="text-xs text-slate-400 max-w-xl">{node.description}</p>
                </div>

                {!isLocked ? (
                  <button
                    onClick={() => setActiveModule('smart-player')}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-400/20 transition"
                  >
                    Start Lecture <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button disabled className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs shrink-0 cursor-not-allowed">
                    Locked Node
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
