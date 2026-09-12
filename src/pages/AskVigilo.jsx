import React, { useState } from 'react';
import { Sparkles, Send, User, RefreshCw, Shield, HelpCircle } from 'lucide-react';
import { askVigiloAI } from '../api';

export default function AskVigilo() {
  const [messages, setMessages] = useState([
    {
      sender: 'owl',
      text: "Hoo! 🦉 Hi there! I'm Vigilo, your friendly safety buddy! Ask me anything about keeping your passwords safe, spotting fake game scams, or checking if a website is safe."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "Is a website giving away 10,000 free Robux safe?",
    "Why shouldn't I download .exe files from random websites?",
    "Someone in a game asked for my parent's email, what should I do?",
    "How can I make a strong password I won't forget?"
  ];

  const handleSend = async (questionText = null) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askVigiloAI(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'owl',
          text: res.answer,
          safetyTip: res.safety_tip,
          action: res.action_recommended
        }
      ]);
    } catch (err) {
      console.error("Failed to ask Vigilo:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'owl',
          text: "Hoo! My connection fluttered, but remember: Never share your passwords or download files without asking an adult first!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <span>🦉 Child & Parent Safety Companion</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Ask Vigilo Safety Owl</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Context-aware AI companion explaining cybersecurity concepts in encouraging, child-friendly terms powered by Google Gemini.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                  m.sender === 'owl'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {m.sender === 'owl' ? '🦉' : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <p>{m.text}</p>
                {m.safetyTip && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-[11px] font-medium">
                    💡 <strong>Safety Rule:</strong> {m.safetyTip}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold">
                🦉
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Vigilo is thinking child-safe advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex-shrink-0">Suggestions:</span>
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-[11px] bg-slate-900 hover:bg-slate-850 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap transition-colors flex-shrink-0"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-850 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              id="input-ask-vigilo"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Vigilo about any website, game trap, or password question..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              id="btn-send-ask-vigilo"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
