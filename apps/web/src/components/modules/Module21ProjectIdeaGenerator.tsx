import React, { useState } from 'react';
import { Lightbulb, Github, CheckCircle2, Plus, Sparkles, Star } from 'lucide-react';
import { mockProjects } from '../../data/mockData';

export const Module21ProjectIdeaGenerator: React.FC = () => {
  const [projects, setProjects] = useState(mockProjects);

  const togglePortfolioStatus = (id: string) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, inPortfolio: !p.inPortfolio } : p))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 flex items-center justify-between glow-purple">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> AI Portfolio Project Recommendation Engine
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Tailored Hands-On Portfolio Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Custom project specifications targeted at bridging missing competency gaps for Staff Engineer roles.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/30 transition">
          <Lightbulb className="w-4 h-4" /> Generate New Spec
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-3xl glass-panel border border-slate-800 hover:border-purple-500/40 transition space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                  {proj.difficulty} • {proj.matchScore}% Match
                </span>
                <button
                  onClick={() => togglePortfolioStatus(proj.id)}
                  className={`p-1.5 rounded-xl text-xs transition ${
                    proj.inPortfolio
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={proj.inPortfolio ? 'In Portfolio' : 'Add to Portfolio'}
                >
                  <Star className={`w-4 h-4 ${proj.inPortfolio ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              <h2 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition">
                {proj.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {proj.techStack.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 text-[10px] font-mono border border-slate-800">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <a
                href={proj.githubTemplateUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <Github className="w-4 h-4 text-slate-200" /> Clone GitHub Starter Template
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
