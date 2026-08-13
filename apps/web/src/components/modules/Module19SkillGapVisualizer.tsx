import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Target, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { mockSkillMetrics } from '../../data/mockData';

export const Module19SkillGapVisualizer: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Recharts Competency Benchmark Visualizer
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Skill Gap Analytics & Competency Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compares current assessed skill level vs Staff Engineer target job profile requirements.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
          Target Role: Senior Frontend Architect
        </span>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" /> Multi-Dimensional Radar Comparison
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={mockSkillMetrics}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="skillName" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Current Baseline" dataKey="currentLevel" stroke="#00f2fe" fill="#00f2fe" fillOpacity={0.4} />
                <Radar name="Target Requirement" dataKey="targetLevel" stroke="#d946ef" fill="#d946ef" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Competency Gap Breakdown (% Score)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={mockSkillMetrics} margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#475569" />
                <YAxis dataKey="skillName" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="currentLevel" name="Current Level" fill="#00f2fe" radius={[0, 4, 4, 0]} />
                <Bar dataKey="targetLevel" name="Target Level" fill="#7928ca" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
