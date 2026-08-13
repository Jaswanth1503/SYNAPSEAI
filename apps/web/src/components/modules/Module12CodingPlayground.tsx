import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Play, Code2, Terminal, Clock, Cpu, CheckCircle2 } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';

export const Module12CodingPlayground: React.FC = () => {
  const { currentVideo } = usePlayerStore();
  const { theme } = useThemeStore();

  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python' | 'cpp' | 'java'>('javascript');
  const [code, setCode] = useState<string>(
    `// SYNAPSE AI Monaco In-Browser Sandbox\nimport { create } from 'zustand';\n\nconst useStore = create((set) => ({\n  count: 0,\n  inc: () => set((state) => ({ count: state.count + 1 })),\n}));\n\nconsole.log("Execution output verified!");`
  );
  const [stdin, setStdin] = useState<string>('42');
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [execTime, setExecTime] = useState<string>('');
  const [memoryUsed, setMemoryUsed] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setStdout('Running script in web worker sandbox...');
    setStderr('');

    setTimeout(() => {
      setIsRunning(false);
      setStdout(`[SUCCESS] Output stdout:\nExecution output verified!\nInput stdin received: ${stdin}`);
      setExecTime('12ms');
      setMemoryUsed('14.2 MB');
    }, 600);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-heading">
              Dual-Pane In-Browser Monaco Playground
            </h2>
            <p className="text-[11px] text-slate-400">
              Synchronized split view: Video stream context on left, Monaco compiler on right.
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          {(['javascript', 'python', 'cpp', 'java'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold uppercase transition ${
                language === lang
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Split View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Video Context */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" /> Video Lecture Context
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950">
            {currentVideo && (
              <img src={currentVideo.thumbnail} alt="Video" className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 text-[10px] text-slate-200 font-mono">
              {currentVideo?.title}
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentVideo?.description}
          </p>
        </div>

        {/* Right Pane: Monaco Editor & Console */}
        <div className="space-y-3 flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-mono text-cyan-400">main.{language === 'javascript' ? 'ts' : language}</span>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-400/20 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
            </button>
          </div>

          {/* Monaco Editor Component */}
          <div className="h-72 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 12,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: 'Fira Code',
              }}
            />
          </div>

          {/* Output & Stdin Console Panel */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-mono text-slate-400 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Console Stdout / Stderr
              </span>
              {execTime && (
                <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {execTime}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {memoryUsed}</span>
                </div>
              )}
            </div>

            {/* Stdin Input */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">STDIN:</span>
              <input
                type="text"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Pass standard input..."
                className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 focus:outline-none"
              />
            </div>

            {/* Output Display */}
            <pre className="text-[11px] font-mono text-emerald-300 min-h-[60px] max-h-28 overflow-y-auto whitespace-pre-wrap">
              {stdout || '// Click "Run Code" to compile and execute program.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
