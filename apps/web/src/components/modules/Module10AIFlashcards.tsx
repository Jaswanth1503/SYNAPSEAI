import React, { useState } from 'react';
import { Layers, RotateCw, CheckCircle2, Sparkles, Flame, BookOpen } from 'lucide-react';
import { mockFlashcards } from '../../data/mockData';
import { FlashcardItem } from '../../types';

export const Module10AIFlashcards: React.FC = () => {
  const [cards, setCards] = useState<FlashcardItem[]>(mockFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const currentCard = cards[currentIndex];

  const handleSM2Rating = (ratingScore: number) => {
    // SuperMemo-2 scheduling math simulation
    // q in [0..5]
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if (!currentCard) return;

    const q = ratingScore;
    const oldEF = currentCard.easeFactor;
    const newEF = Math.max(1.3, oldEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    const newInterval = q < 3 ? 1 : Math.round(currentCard.interval * newEF);

    console.log(`SM-2 Updated: Rating ${q}, Next Interval: ${newInterval} days, EaseFactor: ${newEF.toFixed(2)}`);

    setIsFlipped(false);
    setCompletedCount((prev) => prev + 1);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop or finish deck
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> SM-2 Spaced Repetition Review Engine
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            AI Memory Deck
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adaptive memory optimization algorithm based on cognitive recall retention scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300">
            Due Today: <span className="font-bold text-cyan-400">{cards.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>14 Streak</span>
          </div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      {currentCard ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer perspective-1000 group"
          >
            <div
              className={`w-full h-full rounded-3xl p-8 glass-panel border border-cyan-500/40 flex flex-col justify-between transition-all duration-500 shadow-2xl relative ${
                isFlipped ? 'bg-slate-900/95 border-purple-500/50 glow-purple' : 'bg-slate-900/80 glow-cyan'
              }`}
            >
              {/* Category Pill */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                  {currentCard.category}
                </span>
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Click Card to Flip
                </span>
              </div>

              {/* Card Face Content */}
              <div className="text-center my-auto space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isFlipped ? 'BACK: ANSWER & EXPLANATION' : 'FRONT: CONCEPT QUESTION'}
                </span>
                <p className="text-xl lg:text-2xl font-bold text-slate-100 leading-snug">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
              </div>

              {/* Footer Indicator */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-800">
                <span>Ease Factor: {currentCard.easeFactor}</span>
                <span>Card {currentIndex + 1} of {cards.length}</span>
              </div>
            </div>
          </div>

          {/* SM-2 SuperMemo Rating Controls */}
          {isFlipped ? (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fadeIn">
              <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                Rate Recall Difficulty (SuperMemo-2 SM-2)
              </div>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleSM2Rating(0)}
                  className="py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-bold space-y-0.5 transition"
                >
                  <div>Again (0)</div>
                  <div className="text-[10px] text-rose-400 font-mono">1 min</div>
                </button>

                <button
                  onClick={() => handleSM2Rating(3)}
                  className="py-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-bold space-y-0.5 transition"
                >
                  <div>Hard (3)</div>
                  <div className="text-[10px] text-amber-400 font-mono">1 Day</div>
                </button>

                <button
                  onClick={() => handleSM2Rating(4)}
                  className="py-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-bold space-y-0.5 transition"
                >
                  <div>Good (4)</div>
                  <div className="text-[10px] text-cyan-400 font-mono">3 Days</div>
                </button>

                <button
                  onClick={() => handleSM2Rating(5)}
                  className="py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold space-y-0.5 transition"
                >
                  <div>Easy (5)</div>
                  <div className="text-[10px] text-emerald-400 font-mono">6 Days</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-2">
              Flip the card to reveal the answer and rate recall difficulty.
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl glass-panel text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">All Flashcards Reviewed Today!</h2>
          <p className="text-xs text-slate-400">Great job! Your SM-2 memory retention queue is fully up to date.</p>
        </div>
      )}
    </div>
  );
};
