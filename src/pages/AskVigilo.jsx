import React from 'react';
import OwlAssistantWidget from '../components/OwlAssistantWidget';

export default function AskVigilo() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <span>🦉 Child & Parent AI Safety Companion</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Ask Vigilo Safety Owl</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Context-aware AI companion powered by Gemini & Vigilo ML rules. Ask about scam sites, suspicious links, passwords, or gaming traps.
        </p>
      </div>

      {/* Embedded Owl Assistant Widget */}
      <OwlAssistantWidget embedded={true} />
    </div>
  );
}
