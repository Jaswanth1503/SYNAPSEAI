import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { BarChart3, Flame, Clock, Zap, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

const velocityData = [
  { day: 'Mon', hours: 2.5, quizzes: 4 },
  { day: 'Tue', hours: 3.2, quizzes: 6 },
  { day: 'Wed', hours: 1.8, quizzes: 3 },
  { day: 'Thu', hours: 4.0, quizzes: 8 },
  { day: 'Fri', hours: 2.9, quizzes: 5 },
  { day: 'Sat', hours: 5.1, quizzes: 10 },
  { day: 'Sun', hours: 3.8, quizzes: 7 },
];

export const Module22ProgressAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Learner Analytics & Velocity OS
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Comprehensive Progress Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track video retention heatmaps, weekly learning velocity, and quiz execution accuracy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>14 Day Streak</span>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20">
          <div className="text-xs text-slate-400 font-medium">Weekly Learning Velocity</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">23.3 Hours</div>
          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% from last week
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-purple-500/20">
          <div className="text-xs text-slate-400 font-medium">Average Quiz Accuracy</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">91.4%</div>
          <div className="text-[10px] text-purple-400 mt-1">43 Quizzes Completed</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20">
          <div className="text-xs text-slate-400 font-medium">Code Sandbox Executions</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">128 Runs</div>
          <div className="text-[10px] text-emerald-400 mt-1">98.2% Stdout Clean Pass</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20">
          <div className="text-xs text-slate-400 font-medium">Video Retention Heatmap</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">88% Index</div>
          <div className="text-[10px] text-amber-400 mt-1">High Focus Segment 04:22</div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Spent Velocity Chart */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Weekly Learning Velocity (Hours / Day)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="hours" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quizzes & Code Challenges Chart */}
        <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Quiz & Code Challenge Volume
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="quizzes" name="Quizzes Solved" fill="#7928ca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
