import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Target, CheckCircle2, XCircle, Sparkles, Trophy, ArrowRight, HelpCircle } from 'lucide-react';
import { mockQuizQuestions } from '../../data/mockData';

export const Module13AIQuizChallenge: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [blankInput, setBlankInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = mockQuizQuestions[currentIdx];

  const handleCheckAnswer = () => {
    if (!question) return;

    let correct = false;
    if (question.type === 'mcq') {
      correct = selectedOption === question.correctAnswer;
    } else if (question.type === 'fill_blank') {
      correct = blankInput.trim().toLowerCase() === String(question.correctAnswer).toLowerCase();
    } else if (question.type === 'code') {
      correct = blankInput.trim() === String(question.correctAnswer);
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setBlankInput('');

    if (currentIdx < mockQuizQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Auto-Generated AI Quiz Engine
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Lecture Comprehension Challenge
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evaluation across MCQs, fill-in-the-blanks, and code completion tasks.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          Score: <span className="font-bold text-cyan-400">{score}</span> / {mockQuizQuestions.length}
        </div>
      </div>

      {!isFinished && question ? (
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-5 shadow-2xl">
          {/* Question Meta */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <span className="uppercase text-cyan-400">Question {currentIdx + 1} of {mockQuizQuestions.length}</span>
            <span className="capitalize text-purple-400">Type: {question.type}</span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg font-bold text-slate-100 leading-snug">{question.question}</h2>

          {/* Code Snippet if applicable */}
          {question.codeSnippet && (
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
              {question.codeSnippet}
            </pre>
          )}

          {/* Input Controls */}
          {question.type === 'mcq' && question.options && (
            <div className="space-y-2.5">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between ${
                    selectedOption === idx
                      ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{opt}</span>
                  {selectedOption === idx && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}

          {(question.type === 'fill_blank' || question.type === 'code') && (
            <input
              type="text"
              value={blankInput}
              onChange={(e) => setBlankInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          )}

          {/* Submit / Next Button */}
          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-400/20 transition"
            >
              Submit Answer
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn">
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  isCorrect ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">{isCorrect ? 'Correct Answer!' : 'Incorrect'}</div>
                  <p className="mt-1 text-slate-300">{question.explanation}</p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
              >
                Next Challenge <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Completion Summary */
        <div className="p-8 rounded-3xl glass-panel border border-cyan-500/40 text-center space-y-4 glow-cyan">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-heading font-extrabold text-slate-100">Quiz Challenge Completed!</h2>
          <div className="text-3xl font-mono font-bold text-cyan-400">
            {score} / {mockQuizQuestions.length} ({Math.round((score / mockQuizQuestions.length) * 100)}%)
          </div>
          <p className="text-xs text-slate-400">
            Your results have been updated on your progress analytics dashboard and cohort leaderboard.
          </p>
          <button
            onClick={() => {
              setIsFinished(false);
              setCurrentIdx(0);
              setScore(0);
              setIsAnswered(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-400/20 transition"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};
