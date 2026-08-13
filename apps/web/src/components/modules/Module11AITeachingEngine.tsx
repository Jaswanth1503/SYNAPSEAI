import React, { useState } from 'react';
import { Stage, Layer, Rect, Text as KonvaText, Arrow as KonvaArrow, Circle as KonvaCircle } from 'react-konva';
import { Play, Pause, SkipForward, RotateCcw, Sparkles } from 'lucide-react';
import { mockTeachingSteps } from '../../data/mockData';

export const Module11AITeachingEngine: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = mockTeachingSteps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < mockTeachingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setCurrentStepIndex(0);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Declarative Konva Vector Teaching Canvas
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-100">
            Step-by-Step Algorithm & Memory Stack Trace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reads declarative JSON steps to render call stack push/pops and memory pointer movement.
          </p>
        </div>

        {/* Playback Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
          </button>

          <button
            onClick={handleNextStep}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Info Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            STEP {step.id} OF {mockTeachingSteps.length}
          </span>
          <h3 className="text-sm font-bold text-slate-100">{step.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{step.explanation}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/30">
          JSON Declarative
        </span>
      </div>

      {/* Konva Stage Frame */}
      <div className="h-[420px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-2xl flex items-center justify-center">
        <Stage width={700} height={400}>
          <Layer>
            {step.canvasElements.map((el, idx) => {
              if (el.type === 'rect') {
                return (
                  <React.Fragment key={idx}>
                    <Rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill={el.fill}
                      stroke={el.stroke}
                      strokeWidth={2}
                      cornerRadius={8}
                    />
                    {el.text && (
                      <KonvaText
                        x={el.x + 15}
                        y={el.y + 12}
                        text={el.text}
                        fontSize={13}
                        fill="#ffffff"
                        fontStyle="bold"
                      />
                    )}
                  </React.Fragment>
                );
              }
              if (el.type === 'text') {
                return (
                  <KonvaText
                    key={idx}
                    x={el.x}
                    y={el.y}
                    text={el.text}
                    fontSize={12}
                    fill={el.fill}
                    fontFamily="Fira Code"
                  />
                );
              }
              if (el.type === 'arrow') {
                return (
                  <KonvaArrow
                    key={idx}
                    points={el.points || [0, 0, 50, 50]}
                    pointerLength={8}
                    pointerWidth={8}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={3}
                  />
                );
              }
              if (el.type === 'circle') {
                return (
                  <React.Fragment key={idx}>
                    <KonvaCircle
                      x={el.x}
                      y={el.y}
                      radius={el.radius}
                      fill={el.fill}
                      stroke={el.stroke}
                      strokeWidth={2}
                    />
                    {el.text && (
                      <KonvaText
                        x={el.x - 35}
                        y={el.y - 6}
                        text={el.text}
                        fontSize={11}
                        fill="#00f2fe"
                        fontStyle="bold"
                      />
                    )}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
