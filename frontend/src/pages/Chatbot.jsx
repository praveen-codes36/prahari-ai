import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Camera, Loader2, Send, User } from "lucide-react";

import "./Chatbot.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// NOTE: Person 1's auth module hasn't landed yet, so there is no real Mongo user _id
// available on the client. We generate + persist a stable demo id per browser so the
// chatbot backend (which requires a user_id) has something consistent to key threads on.
// Replace this with the real logged-in user's _id once auth exists.
function getDemoUserId() {
  let id = localStorage.getItem("prahari_demo_user_id");
  if (!id) {
    id = `demo-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("prahari_demo_user_id", id);
  }
  return id;
}

function Chatbot() {
  const navigate = useNavigate();
  const userId = getDemoUserId();

  const [messages, setMessages] = useState([
    {
      sender: "BOT",
      text:
        "Namaste! Main Prahari Assistant hoon — pothole, streetlight ya garbage ki photo bhejein, " +
        "main complaint file kar dunga. Ya apni complaint ka status pooch sakte hain.",
      created_at: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Load previous history on mount (GET /api/chatbot/citizen/history/:userId)
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chatbot/citizen/history/${userId}`);
        if (!res.ok) return;
        const json = await res.json();
        const conversations = json?.data || [];
        const allMessages = conversations.flatMap((c) => c.messages || []);
        if (allMessages.length > 0) setMessages(allMessages);
      } catch {
        // Backend not reachable yet — keep the default greeting, fail silently.
      }
    }
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /*
  |--------------------------------------------------------------------------
  | Send a message (POST /api/chatbot/citizen/message)
  |--------------------------------------------------------------------------
  */
  async function sendMessage(text, attachment_url) {
    if (!text && !attachment_url) return;

    const userMessage = { sender: "USER", text, attachment_url: attachment_url || null, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/citizen/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, text, attachment_url })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Chatbot request failed");

      setMessages((prev) => [...prev, json.data.reply]);
    } catch (err) {
      setError(err.message || "Couldn't reach the Prahari Assistant. Try again.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input.trim());
  }

  // Photo capture: real upload/storage (e.g. Cloudinary, matching backend/package.json's
  // dependency) is Person 1's Complaints module concern — this just demonstrates the flow
  // by sending a placeholder attachment_url so the bot's photo branch can be exercised end-to-end.
  function handlePhotoClick() {
    sendMessage("", "https://placeholder.prahari.ai/uploads/demo-defect.jpg");
  }

  return (
    <div className="chatbot-page">
      <header className="chatbot-header">
        <button className="chatbot-back" onClick={() => navigate("/citizen/home")}>
          <ArrowLeft size={18} />
        </button>
        <div className="chatbot-title">
          <span className="chatbot-avatar">
            <Bot size={18} />
          </span>
          <div>
            <p className="chatbot-name">Prahari Assistant</p>
            <p className="chatbot-status">Online</p>
          </div>
        </div>
      </header>

      <main className="chatbot-messages" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`chatbot-bubble-row ${m.sender === "USER" ? "row-user" : "row-bot"}`}>
            <span className="chatbot-bubble-icon">{m.sender === "USER" ? <User size={14} /> : <Bot size={14} />}</span>
            <div className={`chatbot-bubble ${m.sender === "USER" ? "bubble-user" : "bubble-bot"}`}>
              {m.attachment_url && (
                <p className="chatbot-attachment">📷 Photo attached</p>
              )}
              {m.text && <p>{m.text}</p>}
            </div>
          </div>
        ))}

        {sending && (
          <div className="chatbot-bubble-row row-bot">
            <span className="chatbot-bubble-icon"><Bot size={14} /></span>
            <div className="chatbot-bubble bubble-bot chatbot-typing">
              <Loader2 size={14} className="chatbot-spin" /> typing...
            </div>
          </div>
        )}

        {error && <p className="chatbot-error">{error}</p>}
      </main>

      <form className="chatbot-input-bar" onSubmit={handleSubmit}>
        <button type="button" className="chatbot-icon-btn" onClick={handlePhotoClick} title="Attach a defect photo">
          <Camera size={18} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chatbot-send-btn" disabled={sending || !input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
