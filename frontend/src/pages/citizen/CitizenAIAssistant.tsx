import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, Shield, MapPin, AlertCircle, ArrowRight, User } from 'lucide-react';
import { sendCitizenChatMessage, getCitizenChatHistory, ChatbotMessage } from '../../services/aiChatbotService';

export const CitizenAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      sender: 'BOT',
      text: 'Hello Aarav! I am Prahari Citizen AI Safety Assistant. Ask me about road conditions, flood-prone choke points, active pothole repair zones, or safe commute routes.',
      created_at: new Date().toISOString()
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Is Western Express Highway safe to commute right now?',
    'Show critical pothole locations near Powai & Andheri',
    'How does Prahari AI route emergency ambulances?',
    'What should I do if I spot a large sinkhole?',
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getCitizenChatHistory();
        if (history && history.length > 0) {
          // If there's existing history, we can optionally load the most recent conversation
          const latestConvo = history[history.length - 1];
          if (latestConvo && latestConvo.messages && latestConvo.messages.length > 0) {
             setMessages(latestConvo.messages);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMessage: ChatbotMessage = { sender: 'USER', text: q, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await sendCitizenChatMessage(q);
      setMessages((prev) => [...prev, response.reply]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        sender: 'BOT',
        text: 'Sorry, I am having trouble connecting to the system right now.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 pt-2 space-y-4">
      {/* Header */}
      <div className="bg-[#151b2b] p-4 md:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00e3fd]/20 text-[#00daf3] flex items-center justify-center shadow-[0_0_15px_rgba(0,227,253,0.3)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              Prahari Citizen AI Assistant
              <span className="text-[10px] font-mono bg-[#00e3fd]/15 text-[#00daf3] px-2 py-0.5 rounded border border-[#00e3fd]/30">
                ACTIVE
              </span>
            </h1>
            <p className="text-xs text-[#8c90a1]">
              Real-time route risk smart system and hazard avoidance guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested quick queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-lg bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 text-xs font-mono text-[#b3c5ff] hover:text-white whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#00daf3]" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat messages container */}
      <div className="bg-[#151b2b]/95 rounded-2xl border border-white/10 p-4 md:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 shadow-2xl">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === 'USER'
                  ? 'bg-[#b3c5ff] text-[#002b75]'
                  : 'bg-[#00e3fd]/20 text-[#00daf3] border border-[#00e3fd]/40'
              }`}
            >
              {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-lg ${
                msg.sender === 'USER'
                  ? 'bg-[#0066ff] text-white rounded-tr-none'
                  : 'bg-[#191f2f] text-[#dde2f8] border border-white/10 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {msg.attachment_url && (
                <div className="mt-3">
                  <img
                    src={msg.attachment_url.startsWith('http') ? msg.attachment_url : (msg.attachment_url.startsWith('/') ? msg.attachment_url : `/${msg.attachment_url}`)}
                    alt="Attachment"
                    className="max-w-full rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/sample_images/pothole_critical_deep.jpg';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00e3fd]/20 text-[#00daf3] flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#191f2f] border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-[#00daf3] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-ping" />
              Scanning spatial data info and road health registries...
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-[#151b2b] rounded-2xl p-2 border border-white/15 focus-within:border-[#00daf3] shadow-xl"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI safety assistant anything..."
          className="flex-1 bg-transparent px-3 text-xs md:text-sm text-white placeholder:text-[#8c90a1] focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] flex items-center justify-center font-bold disabled:opacity-40 transition-all shadow-md shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
