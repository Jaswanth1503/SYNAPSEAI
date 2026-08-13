import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Sparkles, Activity, Gauge, CheckCircle2, AlertCircle } from 'lucide-react';
import { JamRecord } from '../../types';

export const Module14JAMStudio: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [result, setResult] = useState<JamRecord | null>(null);
  const [topic, setTopic] = useState('Explain Event Loop Microtasks vs Macrotasks in JavaScript');

  const topics = [
    'Explain Event Loop Microtasks vs Macrotasks in JavaScript',
    'Describe How Virtual DOM Diffing Works in React 18',
    'What are the advantages of Zustand over Redux Toolkit?',
    'How does HLS Video Streaming deliver adaptive bitrates?',
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0 && isRecording) {
      handleStopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, secondsLeft]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setSecondsLeft(60);
    setResult(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Simulate AI speech analysis results
    const generatedResult: JamRecord = {
      id: `jam-${Date.now()}`,
      topic,
      date: 'Just now',
      durationSeconds: 60 - secondsLeft,
      wpm: 142,
      fillerWordsCount: 2,
      fillerBreakdown: [
        { word: 'um', count: 1 },
        { word: 'like', count: 1 },
      ],
      feedbackScore: 92,
      aiSummary: 'Clear articulation of Promise microtask queue vs setTimeout macrotask callback execution order. Strong pace.',
    };
    setResult(generatedResult);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between glow-emerald">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Just-A-Minute (JAM) Speech Studio
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            60-Second Audio Speech Practice
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate your technical explanation pace (WPM), filler word frequency, and articulation clarity.
          </p>
        </div>

        <button
          onClick={() => setTopic(topics[Math.floor(Math.random() * topics.length)])}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          Shuffle Topic
        </button>
      </div>

      {/* Topic Card & Timer */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6 text-center shadow-2xl">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            SPONTANEOUS TOPIC PROMPT
          </span>
          <h2 className="text-xl font-bold text-slate-100">"{topic}"</h2>
        </div>

        {/* 60s Timer Countdown */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center rounded-full bg-slate-950 border-4 border-emerald-500/40 glow-emerald">
          <div className="text-center font-mono">
            <div className="text-3xl font-extrabold text-emerald-300">{secondsLeft}s</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">COUNTDOWN</div>
          </div>
        </div>

        {/* Audio Wave Visualizer Bars Simulation */}
        <div className="h-12 flex items-center justify-center gap-1.5">
          {[40, 70, 30, 90, 60, 80, 50, 100, 75, 45, 85, 60, 30, 95, 55, 40].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isRecording ? 'bg-emerald-400 animate-pulse' : 'bg-slate-800'
              }`}
              style={{ height: isRecording ? `${h}%` : '20%' }}
            />
          ))}
        </div>

        {/* Record / Stop Button */}
        <div className="flex justify-center">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition"
            >
              <Mic className="w-5 h-5 fill-slate-950" /> Start 60s Speech Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/30 transition"
            >
              <Square className="w-5 h-5 fill-white" /> Stop & Evaluate Audio
            </button>
          )}
        </div>
      </div>

      {/* Results Evaluation Card */}
      {result && (
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Speech Analysis Results
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
              Score: {result.feedbackScore} / 100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Words Per Minute (WPM)</div>
              <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">{result.wpm} WPM</div>
              <div className="text-[10px] text-emerald-400 mt-1">Optimal Pace Range</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Filler Words Frequency</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{result.fillerWordsCount} Count</div>
              <div className="text-[10px] text-amber-300 mt-1">"um" (1), "like" (1)</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Speech Duration</div>
              <div className="text-2xl font-mono font-bold text-purple-400 mt-1">{result.durationSeconds}s</div>
              <div className="text-[10px] text-purple-300 mt-1">Completed Target</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
            <span className="font-bold text-emerald-400 not-italic">AI Feedback: </span>
            "{result.aiSummary}"
          </div>
        </div>
      )}
    </div>
  );
};
