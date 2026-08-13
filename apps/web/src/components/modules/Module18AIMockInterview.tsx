import React, { useState } from 'react';
import { MessageSquareCode, Bot, Mic, Send, Sparkles, CheckCircle2, Award, Volume2 } from 'lucide-react';

export const Module18AIMockInterview: React.FC = () => {
  const [transcript, setTranscript] = useState([
    {
      speaker: 'AI Interviewer Avatar',
      text: 'Welcome Alex! Let’s start with system design. How would you handle state synchronization across 10,000 active LiveKit whiteboard users?',
      score: null,
      isAi: true,
    },
    {
      speaker: 'Alex Vance',
      text: 'I would use Conflict-free Replicated Data Types (CRDTs) with binary delta compression to sync canvas operations via WebSocket pub/sub channels.',
      score: 94,
      isAi: false,
    },
  ]);

  const [inputAnswer, setInputAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim()) return;

    const userEntry = {
      speaker: 'Alex Vance',
      text: inputAnswer,
      score: Math.floor(Math.random() * 15) + 85,
      isAi: false,
    };

    setTranscript((prev) => [...prev, userEntry]);
    setInputAnswer('');
    setIsSpeaking(true);

    setTimeout(() => {
      setIsSpeaking(false);
      const aiReply = {
        speaker: 'AI Interviewer Avatar',
        text: 'Excellent depth on CRDTs! Follow-up question: What strategy would you employ to handle network partition packet drops?',
        score: null,
        isAi: true,
      };
      setTranscript((prev) => [...prev, aiReply]);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 flex items-center justify-between glow-purple">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-4 h-4" /> Turn-Based Technical Interview Studio
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-slate-100">
              AI Senior Frontend Architect Interview
            </h1>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-purple-950 text-purple-300 font-mono text-xs font-bold border border-purple-500/40 flex items-center gap-2">
          {isSpeaking ? <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" /> : <Award className="w-4 h-4 text-cyan-400" />}
          <span>{isSpeaking ? 'AI Speaking...' : 'Live Evaluation'}</span>
        </span>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Avatar & Audio Wave */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6 text-center shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-purple-500/50 p-1 glow-purple">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300"
                alt="AI Interviewer Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">AI Architect Avatar</h3>
              <p className="text-xs text-purple-300">Staff Interviewer Persona</p>
            </div>
          </div>

          {/* Voice Wave Animation */}
          <div className="h-10 flex items-center justify-center gap-1">
            {[30, 80, 45, 95, 60, 85, 40, 90, 50, 75].map((h, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isSpeaking ? 'bg-purple-400 animate-bounce' : 'bg-slate-800'
                }`}
                style={{ height: isSpeaking ? `${h}%` : '20%' }}
              />
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Current Rubric Assessment: <span className="font-bold text-emerald-400">93 / 100</span>
          </div>
        </div>

        {/* Right Live Technical Transcript */}
        <div className="md:col-span-2 space-y-4 flex flex-col h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-3xl bg-slate-950/60 border border-slate-800">
            {transcript.map((t, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                  t.isAi ? 'bg-slate-900 border border-purple-500/30 text-slate-200' : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className={t.isAi ? 'text-purple-400' : 'text-cyan-400'}>{t.speaker}</span>
                  {t.score !== null && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                      Answer Score: {t.score}%
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>

          {/* Input Answer Bar */}
          <form onSubmit={handleSendAnswer} className="flex gap-2">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="Type or speak your technical answer..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/30 transition"
            >
              <Send className="w-4 h-4" /> Submit Answer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
