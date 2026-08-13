import React, { useState } from 'react';
import { FileText, Sparkles, Target, CheckCircle2, AlertTriangle, ArrowRight, Gauge } from 'lucide-react';
import { mockResumesXYZ, mockATSMetrics } from '../../data/mockData';

export const Module17ResumeBuilder: React.FC = () => {
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [targetRole, setTargetRole] = useState('Senior Frontend Architect');
  const [rawInput, setRawInput] = useState('Built video streaming player and added bookmarks feature for students.');

  const [formattedPoints, setFormattedPoints] = useState(mockResumesXYZ);
  const [atsScore, setAtsScore] = useState(mockATSMetrics.score);

  const handleGenerateXYZ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    const newXYZ = {
      id: `xyz-${Date.now()}`,
      company: targetCompany,
      role: targetRole,
      rawPoint: rawInput,
      formattedXYZ: `Engineered ${rawInput.toLowerCase()} (Z), improving performance metrics by 42% (Y) and driving key outcomes for ${targetCompany} users (X).`,
      atsImpactScore: 92,
    };

    setFormattedPoints([newXYZ, ...formattedPoints]);
    setAtsScore(Math.min(98, atsScore + 2));
    setRawInput('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Company & Role-Specific Google XYZ AI Resume Engine
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Categorized ATS Resume Formatter
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Converts raw bullet points into Google XYZ format: Accomplished [X] as measured by [Y] by doing [Z].
          </p>
        </div>

        {/* Floating ATS Score Gauge */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center gap-4 shrink-0 shadow-xl">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-mono uppercase">ATS Optimization</div>
            <div className="text-3xl font-mono font-extrabold text-cyan-400">{atsScore} / 100</div>
          </div>
          <Gauge className="w-8 h-8 text-cyan-400" />
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input Form */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Target Parameters & Experience Input
          </h2>

          <form onSubmit={handleGenerateXYZ} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                >
                  <option>Amazon</option>
                  <option>Google</option>
                  <option>Meta</option>
                  <option>AI Startup</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                >
                  <option>Senior Frontend Architect</option>
                  <option>Full Stack Engineer</option>
                  <option>SDE-1 / SDE-2</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Raw Experience Bullet Point</label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Enter raw bullet (e.g. Built streaming player and added bookmarks)..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 transition"
            >
              <Sparkles className="w-4 h-4" /> Convert to Google XYZ Format
            </button>
          </form>

          {/* Missing Keywords Recommendation Chips */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Keyword Recommendations</span>
            <div className="flex flex-wrap gap-1.5">
              {mockATSMetrics.matchedKeywords.map((kw) => (
                <span key={kw} className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {kw}
                </span>
              ))}
              {mockATSMetrics.missingKeywords.map((kw) => (
                <span key={kw} className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 text-[10px] font-mono border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> + Add {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Formatted Preview */}
        <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Google XYZ Formatted Points Preview
          </h2>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {formattedPoints.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">{item.company} • {item.role}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                    Impact: {item.atsImpactScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {item.formattedXYZ}
                </p>
                <div className="text-[10px] text-slate-500 italic">Raw input: "{item.rawPoint}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
