import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { executeCopilotQuery, CopilotQueryResponse } from '../../services/aiCopilotService';

export const AICopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; data?: CopilotQueryResponse }[]
  >(() => {
    const saved = localStorage.getItem('authority_copilot_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      {
        role: 'assistant',
        text: `Hello Commander Srivastava. Prahari AI Copilot is online with active data info from 14,208 network nodes. \n\nI can analyze multi-factor risk indexes, simulate asphalt allocation for school zones, explain priority priority check scoring, or generate operational deployment directives. How may I assist you today?`,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('authority_copilot_history', JSON.stringify(messages));
  }, [messages]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const promptSuggestions = [
    'Why is Civil Lines Road ranked #1 in the priority queue?',
    'Which roads require immediate repair within 24 hours?',
    'Show high-risk road defects situated near schools',
    'What is our current asphalt material & crew allocation status?',
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await executeCopilotQuery(q);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.response,
          data: res,
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        const title = line.replace('### ', '');
        return <h3 key={idx} className="text-base md:text-lg font-bold text-white mt-4 mb-2 border-b border-white/10 pb-2">{title}</h3>;
      }
      if (line.match(/^\d+\.\s/)) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="ml-2 mt-4 mb-1">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-[#00daf3] text-sm md:text-base">{part.slice(2, -2)}</strong>;
              }
              return <span key={i} className="text-white text-sm md:text-base">{part}</span>;
            })}
          </div>
        );
      }
      if (line.trim().startsWith('- ')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="ml-8 mb-1.5 text-[#dde2f8] flex items-start gap-2">
            <span className="text-[#00daf3] mt-1.5 text-[8px] font-bold">■</span>
            <div>
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1"></div>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className="mb-2">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-[#00daf3]">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto pt-2 pb-2 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              PRAHARI NEURAL ADVISORY ENGINE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            AI Copilot Command Assistant
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Executive natural language querying for road network priority check, predictive monsoon risks, and resource planning.
          </p>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="p-3 rounded-xl bg-[#151b2b] hover:bg-[#191f2f] border border-white/10 hover:border-[#00daf3]/50 text-left transition-all group flex items-center justify-between gap-2"
          >
            <span className="text-xs font-mono text-[#b3c5ff] group-hover:text-white line-clamp-1">
              {prompt}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#00daf3] shrink-0" />
          </button>
        ))}
      </div>

      {/* Chat Terminal Box */}
      <div className="flex-1 min-h-0 bg-[#151b2b] rounded-2xl border border-white/10 p-5 md:p-6 overflow-y-auto space-y-5 shadow-2xl">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-[#b3c5ff] text-[#002b75]'
                  : 'bg-[#00e3fd]/20 text-[#00daf3] border border-[#00e3fd]/40'
              }`}
            >
              {msg.role === 'user' ? 'NS' : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 md:p-5 text-xs md:text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-[#0066ff] text-white rounded-tr-none'
                  : 'bg-[#191f2f] text-[#dde2f8] border border-white/10 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.role === 'user' ? msg.text : renderMarkdown(msg.text)}
              </div>

              {msg.data?.keyInsights && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                  <div className="text-xs font-mono text-[#00daf3] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Key Decision Data Info:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.data.keyInsights.map((insight, iIdx) => {
                      try {
                        const parsed = JSON.parse(insight);
                        const isObj = parsed && typeof parsed === 'object';
                        const title = isObj ? (parsed.corridor || parsed.road_name || parsed.road || parsed.location || parsed.name || parsed.title) : null;

                        if (isObj && title) {
                          return (
                            <div
                              key={iIdx}
                              className="bg-[#0d1322]/80 p-3.5 rounded-lg border border-white/10 flex flex-col gap-2 shadow-lg hover:border-[#00daf3]/40 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                 <span className="text-white font-mono font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded">Rank #{parsed.rank || parsed.index || iIdx + 1}</span>
                                 <span className="text-[9px] font-mono font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                                   {parsed.urgency || parsed.severity || 'HIGH'}
                                 </span>
                              </div>
                              <div className="font-bold text-[#00daf3] text-sm leading-tight mt-1">{title}</div>
                              <div className="text-xs text-[#c2c6d8] leading-snug border-t border-white/10 pt-2 mt-1">
                                {parsed.defect || parsed.issue || parsed.description || 'Issue detected'}
                              </div>
                              <div className="text-[10px] font-mono text-amber-400 mt-1 flex justify-between items-center bg-black/40 px-2 py-1 rounded">
                                <span>Priority Score:</span>
                                <span className="font-bold text-white">{parsed.priority_score || parsed.score || 'N/A'} / 100</span>
                              </div>
                            </div>
                          );
                        } else if (isObj && parsed.metric !== undefined && parsed.value !== undefined) {
                          // Handle {metric, value} schema
                          return (
                            <div
                              key={iIdx}
                              className="bg-[#0d1322]/80 p-3.5 rounded-lg border border-white/10 flex flex-col justify-center gap-1 shadow-lg hover:border-[#00daf3]/40 transition-colors"
                            >
                              <span className="text-[10px] font-mono text-[#8c90a1] uppercase tracking-wider">{parsed.metric}</span>
                              <span className="text-lg font-bold text-white">{parsed.value}</span>
                            </div>
                          );
                        } else if (isObj) {
                          // Generic object rendering
                          return (
                            <div
                              key={iIdx}
                              className="bg-[#0d1322]/80 p-3 rounded-lg border border-white/10 flex flex-col gap-1.5 shadow-lg"
                            >
                              {Object.entries(parsed).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-start gap-4 border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                                  <span className="text-[10px] font-mono text-[#8c90a1] uppercase">{k.replace(/_/g, ' ')}:</span>
                                  <span className="text-xs text-white text-right font-medium">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          // Plain string fallback
                          return (
                            <div
                              key={iIdx}
                              className="bg-[#0d1322]/80 p-2.5 rounded-lg border border-white/5 text-xs text-[#c2c6d8] font-mono flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] shrink-0 mt-1.5" />
                              <span>{String(insight)}</span>
                            </div>
                          );
                        }
                      } catch {
                        return (
                          <div
                            key={iIdx}
                            className="bg-[#0d1322]/80 p-2.5 rounded-lg border border-white/5 text-xs text-[#c2c6d8] font-mono flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] shrink-0 mt-1.5" />
                            <span>{insight}</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}

              {msg.data?.recommendedAction && (
                <div className="mt-3 bg-[#00e3fd]/10 border border-[#00e3fd]/30 rounded-xl p-3 text-xs text-[#c2c6d8]">
                  <strong className="text-white block mb-0.5">Recommended Executive Action:</strong>
                  <span>{msg.data.recommendedAction}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00e3fd]/20 text-[#00daf3] flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#191f2f] border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-[#00daf3] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-ping" />
              Cross-referencing spatial database, traffic volume data info, and priority matrices...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-[#151b2b] rounded-2xl p-2.5 border border-white/15 focus-within:border-[#00daf3] shadow-xl shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI Copilot for strategic insights or dispatch recommendations..."
          className="flex-1 bg-transparent px-3 text-xs md:text-sm text-white placeholder:text-[#8c90a1] focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-5 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] flex items-center gap-1.5 font-bold font-mono text-xs disabled:opacity-40 transition-all shadow-md shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
