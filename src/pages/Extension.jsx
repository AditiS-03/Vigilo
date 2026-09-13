import React from 'react';
import { Download, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Extension() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl border-cyan-500/20 p-8 shadow-neon-cyan">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Browser Protection</p>
            <h1 className="text-2xl font-bold text-white mt-1">Vigilo Extension</h1>
          </div>
        </div>

        <p className="mt-5 text-slate-300 leading-relaxed max-w-2xl">
          Keep child-safe protections active while browsing the web. The extension blocks scam pages, warns on risky downloads, and highlights dangerous reward lures before a click happens.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-cyan-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-neon-cyan">
            <Download className="w-4 h-4" />
            Install Demo Extension
          </button>
          <span className="text-xs text-slate-400">Ready for Chrome / Edge / Brave</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Malware blocking',
            desc: 'Stops dangerous executable downloads and disguised installer traps.',
          },
          {
            title: 'Credential shield',
            desc: 'Warns before passwords are typed into fake login or verification pages.',
          },
          {
            title: 'Safety coaching',
            desc: 'Shows child-friendly step-by-step guidance when scam patterns are detected.',
          },
        ].map((feature) => (
          <div key={feature.title} className="glass-panel rounded-2xl p-5 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
            <h2 className="text-lg font-bold text-white">{feature.title}</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Protection status</p>
            <h3 className="text-lg font-bold text-white mt-1">Active and monitoring</h3>
          </div>
          <button className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
            Open dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
