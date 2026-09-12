import React, { useState, useEffect } from 'react';
import { Compass, ExternalLink, ShieldCheck, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function SafeDirectory() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadResources();
  }, [category, search]);

  async function loadResources() {
    try {
      const data = await api.getSafeAlternatives(search, category);
      setResources(data.verified_resources || []);
    } catch (err) {
      console.error("Failed to load safe resources:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase mb-1">
          <Compass className="w-4 h-4" />
          <span>Module 8: Vigilo Safe Alternatives Directory</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          Curated & Verified Child-Friendly Platforms
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          When Vigilo blocks an unsafe site, it redirects intent to vetted platforms. To prevent hallucinated or poisoned URLs, AI models are never permitted to generate arbitrary links—all recommendations are drawn strictly from this verified registry.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search safe resources (e.g., Minecraft, Coding, Science)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: '', label: 'All Categories' },
            { id: 'gaming', label: 'Gaming & Mods' },
            { id: 'coding', label: 'Coding & Creation' },
            { id: 'learning', label: 'STEM & Learning' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                category === tab.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Verified Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => (
          <div
            key={res.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {res.category}
                </span>
                <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Safe</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                {res.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {res.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {(res.tags || []).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/80">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
                {res.url}
              </span>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>Visit Safe Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
