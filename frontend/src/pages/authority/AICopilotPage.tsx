import React, { useState } from 'react';
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
  >([
    {
      role: 'assistant',
      text: `Hello Commander Srivastava. Prahari AI Copilot is online with active telemetry from 14,208 network nodes. 

I can analyze multi-factor risk indexes, simulate asphalt allocation for school zones, explain priority triage scoring, or generate operational deployment directives. How may I assist you today?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-6 pb-20 pt-2 max-w-5xl mx-auto">
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
            Executive natural language querying for infrastructure triage, predictive monsoon risks, and resource planning.
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
      <div className="bg-[#151b2b] rounded-2xl border border-white/10 p-5 md:p-6 min-h-[480px] max-h-[620px] overflow-y-auto space-y-5 shadow-2xl">
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
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {msg.data?.keyInsights && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <div className="text-xs font-mono text-[#00daf3] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Key Decision Telemetry:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.data.keyInsights.map((insight, iIdx) => (
                      <div
                        key={iIdx}
                        className="bg-[#0d1322]/80 p-2.5 rounded-lg border border-white/5 text-xs text-[#c2c6d8] font-mono flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] shrink-0 mt-1.5" />
                        <span>{insight}</span>
                      </div>
                    ))}
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
              Cross-referencing spatial database, traffic volume telemetry, and priority matrices...
            </div>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-[#151b2b] rounded-2xl p-2.5 border border-white/15 focus-within:border-[#00daf3] shadow-xl"
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
