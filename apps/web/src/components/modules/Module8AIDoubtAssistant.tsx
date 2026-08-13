import React, { useState } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Sparkles, Send, Bot, User, Clock, Code2 } from 'lucide-react';
import { ChatMessage } from '../../types';

export const Module8AIDoubtAssistant: React.FC = () => {
  const { seekTo } = usePlayerStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderName: 'Alex Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      message: 'Why do we use atomic slice stores in Zustand instead of a single giant global object?',
      timestamp: '10:42 AM',
      isAi: false,
    },
    {
      id: 'msg-2',
      senderName: 'Synapse AI Assistant',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
      message: 'Atomic slice stores prevent unnecessary top-level component re-renders. By creating isolated slice functions, React only re-evaluates components subscribed to that specific state slice.',
      timestamp: '10:42 AM',
      isAi: true,
      citationTime: '04:22',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'Alex Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      message: inputQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQ = inputQuery;
    setInputQuery('');
    setIsStreaming(true);

    // Simulate AI Typewriter Response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderName: 'Synapse AI Assistant',
        senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
        message: `Based on transcript vectors matching "${currentQ}": You can optimize state handlers by passing granular selectors. This ensures zero re-renders outside modified component boundaries.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true,
        citationTime: '09:00',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsStreaming(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 animate-fadeIn flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 flex items-center justify-between glow-purple">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">In-Video AI Doubt Assistant</h3>
            <p className="text-[10px] text-purple-300">Grounded with Timestamp Citations</p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.isAi ? 'justify-start' : 'justify-end'}`}
          >
            {msg.isAi && (
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 ${
                msg.isAi
                  ? 'bg-slate-900 border border-purple-500/30 text-slate-200'
                  : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-100'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold">{msg.senderName}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed">{msg.message}</p>

              {msg.citationTime && (
                <div className="pt-1.5 border-t border-purple-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Grounded in transcript
                  </span>
                  <button
                    onClick={() => seekTo(262)}
                    className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono hover:bg-purple-500/30 border border-purple-500/40 flex items-center gap-1 transition"
                  >
                    <Clock className="w-3 h-3" /> Cited from {msg.citationTime}
                  </button>
                </div>
              )}
            </div>

            {!msg.isAi && (
              <img src={msg.senderAvatar} alt={msg.senderName} className="w-7 h-7 rounded-lg object-cover border border-cyan-400/40 shrink-0" />
            )}
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-purple-400 p-2 italic animate-pulse">
            <Bot className="w-4 h-4" /> AI Assistant is searching video vectors & generating response...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any question about this lecture..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500/50"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/30 transition"
        >
          <Send className="w-3.5 h-3.5" /> Ask AI
        </button>
      </form>
    </div>
  );
};
