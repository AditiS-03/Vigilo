import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, RefreshCw, Sparkles, Shield, ChevronDown, Bot } from 'lucide-react';
import { askVigiloAI } from '../api';

export default function OwlAssistantWidget({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState([
    {
      sender: 'owl',
      text: "Hoo! 🦉 Hi Leo! I'm Vigilo, your AI Safety Companion! Ask me anything about online safety, password tricks, or checking if a game reward is real.",
      safetyTip: "Never share passwords or credentials, even if a site promises free Robux or V-Bucks!",
      action: "Pause before you click and ask a parent if you're unsure."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Is a site giving 10,000 free Robux safe?",
    "Why shouldn't I download .exe files?",
    "Someone asked for my parent's email in a game!",
    "How do I make a strong password?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText = null) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askVigiloAI(q, window.location.href);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'owl',
          text: res.answer || res.response || "Hoo! Stay safe online! Never share your passwords or credentials.",
          safetyTip: res.safety_tip || "Double-check website names before typing passwords.",
          action: res.action_recommended || "Ask a trusted adult if an offer looks too good to be true."
        }
      ]);
    } catch (err) {
      console.error("Failed to ask Vigilo:", err);
      // Smart local fallback so the user always gets an instant, helpful response even offline
      const lower = q.lower ? q.lower() : q.toLowerCase();
      let replyText = "Hoo! Keep your account safe! Never share your passwords or download unknown files.";
      let tip = "Check the domain URL carefully before clicking links.";
      let act = "Ask a trusted adult before downloading any game mod or app.";

      if (lower.includes("robux") || lower.includes("vbucks") || lower.includes("free") || lower.includes("reward")) {
        replyText = "Hoo! That offer is almost certainly a scam trap! Real game companies like Roblox or Epic Games NEVER give away free currency on third-party websites or ask for your password.";
        tip = "Free currency generators are 100% fake and designed to steal account passwords.";
        act = "Close the page immediately and do not enter your login details!";
      } else if (lower.includes(".exe") || lower.includes("download") || lower.includes("mod")) {
        replyText = "Hoo! Downloading executable files (.exe, .scr) from random websites is very risky. They can contain viruses or keyloggers that steal your account!";
        tip = "Only download games and mods from official stores like Steam or verified developer portals.";
        act = "Cancel the download and check with a parent first.";
      } else if (lower.includes("password")) {
        replyText = "Hoo! A strong password uses a combination of upper and lowercase letters, numbers, and special symbols (like Leo!Secured#2026). Never reuse the same password for games and email!";
        tip = "Use a password phrase that only you know.";
        act = "Keep your passwords secret from friends and only share them with your parents.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'owl',
          text: replyText,
          safetyTip: tip,
          action: act
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (embedded) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[560px] overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md ${
                  m.sender === 'owl'
                    ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {m.sender === 'owl' ? '🦉' : <User className="w-4 h-4 text-cyan-400" />}
              </div>

              <div
                className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-lg'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <p className="font-medium text-sm text-slate-100">{m.text}</p>
                {m.safetyTip && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-200 text-[11px] font-medium flex items-start space-x-2">
                    <span className="flex-shrink-0 text-base">💡</span>
                    <div>
                      <strong className="text-cyan-300">Safety Rule:</strong> {m.safetyTip}
                    </div>
                  </div>
                )}
                {m.action && (
                  <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-100 text-[11px] font-medium flex items-start space-x-2">
                    <span className="flex-shrink-0 text-base">🛡️</span>
                    <div>
                      <strong className="text-amber-300">Action:</strong> {m.action}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-lg">
                🦉
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-cyan-300 flex items-center space-x-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="font-medium">Vigilo Owl is generating child-safe advice...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase flex-shrink-0">Suggestions:</span>
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-500/20 whitespace-nowrap transition-all flex-shrink-0 font-medium"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Vigilo Owl about any website, scam, or password..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[520px] bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl shadow-neon-cyan">
                🦉
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Vigilo Safety Owl</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-cyan-300 font-medium">Real-Time AI Companion</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    m.sender === 'owl'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {m.sender === 'owl' ? '🦉' : <User className="w-3.5 h-3.5 text-cyan-400" />}
                </div>

                <div
                  className={`max-w-[280px] p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.safetyTip && (
                    <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/40 text-cyan-200 text-[10px]">
                      💡 <strong>Rule:</strong> {m.safetyTip}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm font-bold">
                  🦉
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-cyan-300 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking safety response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt chips */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-900 flex items-center space-x-1.5 overflow-x-auto">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="text-[10px] bg-slate-900 hover:bg-slate-850 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20 whitespace-nowrap flex-shrink-0"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Vigilo Owl anything..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-full shadow-2xl shadow-cyan-500/30 border border-cyan-300/40 transition-all transform hover:scale-105 active:scale-95 group"
      >
        <span className="text-2xl animate-bounce">🦉</span>
        <span className="text-xs font-extrabold tracking-wide text-white flex items-center space-x-1">
          <span>Ask Vigilo Owl</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
        </span>
      </button>
    </div>
  );
}
