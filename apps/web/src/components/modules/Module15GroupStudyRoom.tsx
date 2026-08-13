import React, { useState } from 'react';
import { Stage, Layer, Line as KonvaLine, Rect as KonvaRect, Text as KonvaText } from 'react-konva';
import { Users, Mic, MicOff, Video, VideoOff, Send, Sparkles, Paintbrush, Square, Type, Eraser, Trash2 } from 'lucide-react';
import { WhiteboardElement } from '../../types';

export const Module15GroupStudyRoom: React.FC = () => {
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [tool, setTool] = useState<'brush' | 'rect' | 'text' | 'eraser'>('brush');
  const [color, setColor] = useState('#00f2fe');
  const [isDrawing, setIsDrawing] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'Elena Rostova', text: 'Hey team! Let’s trace the CRDT sync algorithm on the whiteboard.', time: '10:45 AM' },
    { sender: 'Marcus Chen', text: 'Added the memory heap vector node.', time: '10:46 AM' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const participants = [
    { name: 'Alex Vance (You)', role: 'Host', isMuted: false, isVideoOn: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Elena Rostova', role: 'Student', isMuted: false, isVideoOn: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { name: 'Marcus Chen', role: 'Student', isMuted: true, isVideoOn: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { name: 'Sophia Miller', role: 'Student', isMuted: true, isVideoOn: false, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  ];

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    if (tool === 'brush' || tool === 'eraser') {
      setElements([
        ...elements,
        {
          id: `el-${Date.now()}`,
          type: tool,
          points: [point.x, point.y],
          color: tool === 'eraser' ? '#070a11' : color,
          strokeWidth: tool === 'eraser' ? 20 : 3,
        },
      ]);
    } else if (tool === 'rect') {
      setElements([
        ...elements,
        {
          id: `el-${Date.now()}`,
          type: 'rect',
          x: point.x,
          y: point.y,
          width: 100,
          height: 60,
          color,
          strokeWidth: 2,
        },
      ]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const lastElement = elements[elements.length - 1];
    if (!lastElement) return;

    if (lastElement.type === 'brush' || lastElement.type === 'eraser') {
      const newPoints = lastElement.points?.concat([point.x, point.y]);
      const updatedElement = { ...lastElement, points: newPoints };
      setElements(elements.slice(0, elements.length - 1).concat([updatedElement]));
    }
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages([...chatMessages, { sender: 'Alex Vance', text: newMsg, time: 'Just now' }]);
    setNewMsg('');
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 flex items-center justify-between glow-purple">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-heading">
              LiveKit Collaborative Group Study Room
            </h2>
            <p className="text-[11px] text-slate-400">
              Multi-user WebRTC grid with real-time synchronized Konva whiteboard canvas.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 4 Active Streamers
        </span>
      </div>

      {/* Main Grid: Video Participant Grid + Whiteboard Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Video Participant Stream Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cohort WebRTC Grid</h3>
          <div className="grid grid-cols-2 gap-3">
            {participants.map((p, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 group">
                {p.isVideoOn ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500 text-xs font-bold">
                    Camera Off
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded bg-slate-950/80 text-[10px] text-slate-200">
                  <span className="truncate">{p.name}</span>
                  {p.isMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Group Chat Panel */}
          <div className="p-4 rounded-2xl glass-panel space-y-3 h-64 flex flex-col">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group Room Chat</h4>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((c, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-cyan-300">{c.sender}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-slate-200 text-[11px] mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none"
              />
              <button type="submit" className="p-2 rounded-xl bg-cyan-400 text-slate-950 font-bold">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Shared Konva Whiteboard Canvas */}
        <div className="lg:col-span-2 space-y-3">
          {/* Whiteboard Controls */}
          <div className="p-2.5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTool('brush')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  tool === 'brush' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'bg-slate-900 text-slate-400'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" /> Brush
              </button>
              <button
                onClick={() => setTool('rect')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  tool === 'rect' ? 'bg-purple-500/20 text-purple-300 border border-purple-400' : 'bg-slate-900 text-slate-400'
                }`}
              >
                <Square className="w-3.5 h-3.5" /> Rectangle
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  tool === 'eraser' ? 'bg-rose-500/20 text-rose-300 border border-rose-400' : 'bg-slate-900 text-slate-400'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" /> Eraser
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Color Selector */}
              <div className="flex items-center gap-1.5">
                {['#00f2fe', '#d946ef', '#10b981', '#f59e0b', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full border ${color === c ? 'scale-125 border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={() => setElements([])}
                className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 transition"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Konva Stage Whiteboard Container */}
          <div className="h-[460px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-2xl">
            <Stage
              width={650}
              height={460}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                {elements.map((el) => {
                  if (el.type === 'brush' || el.type === 'eraser') {
                    return (
                      <KonvaLine
                        key={el.id}
                        points={el.points}
                        stroke={el.color}
                        strokeWidth={el.strokeWidth}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                      />
                    );
                  }
                  if (el.type === 'rect') {
                    return (
                      <KonvaRect
                        key={el.id}
                        x={el.x}
                        y={el.y}
                        width={el.width}
                        height={el.height}
                        stroke={el.color}
                        strokeWidth={el.strokeWidth}
                        cornerRadius={6}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};
