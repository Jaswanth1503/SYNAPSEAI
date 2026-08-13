import React, { useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sparkles, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 50 },
    data: { label: '🧠 React 18 System Architecture' },
    style: {
      background: 'rgba(15, 23, 42, 0.9)',
      color: '#00f2fe',
      border: '1px solid rgba(0, 242, 254, 0.5)',
      borderRadius: '16px',
      padding: '12px 20px',
      fontWeight: 'bold',
      boxShadow: '0 0 20px rgba(0,242,254,0.2)',
    },
  },
  {
    id: '2',
    position: { x: 50, y: 180 },
    data: { label: '⚡ Concurrent Rendering Engine' },
    style: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#38bdf8',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '12px',
      padding: '10px 16px',
    },
  },
  {
    id: '3',
    position: { x: 450, y: 180 },
    data: { label: '📦 Zustand Atomic Slice Store' },
    style: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#d946ef',
      border: '1px solid rgba(217, 70, 239, 0.4)',
      borderRadius: '12px',
      padding: '10px 16px',
    },
  },
  {
    id: '4',
    position: { x: 50, y: 300 },
    data: { label: '🔄 useTransition & Deferred Value' },
    style: {
      background: 'rgba(15, 23, 42, 0.75)',
      color: '#f43f5e',
      border: '1px solid rgba(244, 63, 94, 0.3)',
      borderRadius: '10px',
      padding: '8px 14px',
    },
  },
  {
    id: '5',
    position: { x: 450, y: 300 },
    data: { label: '⚙️ Zero Re-render Selector Hooks' },
    style: {
      background: 'rgba(15, 23, 42, 0.75)',
      color: '#34d399',
      border: '1px solid rgba(52, 211, 153, 0.3)',
      borderRadius: '10px',
      padding: '8px 14px',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00f2fe', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#d946ef', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#f43f5e' } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#34d399' } },
];

export const Module9MindMapCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Canvas Header */}
      <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> React Flow Concept Mind Map
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-100">
            Interactive Visual Concept Tree
          </h2>
          <p className="text-xs text-slate-400">
            Auto-generated graph linking lecture transcripts to mental model nodes. Drag, zoom, and explore connections.
          </p>
        </div>

        <button
          onClick={() => {
            setNodes(initialNodes);
            setEdges(initialEdges);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Reset View
        </button>
      </div>

      {/* Flow Canvas Box */}
      <div className="h-[500px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e293b" />
          <Controls className="bg-slate-900 border border-slate-800 text-slate-200 fill-slate-200 rounded-xl" />
        </ReactFlow>
      </div>
    </div>
  );
};
