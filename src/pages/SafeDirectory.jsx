import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Filter, ExternalLink, Shield, Gamepad2, Code, GraduationCap, Compass } from 'lucide-react';
import { fetchSafeResources } from '../api';

export default function SafeDirectory() {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSafeResources(selectedCategory, searchQuery);
      setResources(data);
    } catch (err) {
      console.error("Failed to load safe resources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Safe Portals', icon: Compass },
    { id: 'gaming', label: 'Verified Gaming', icon: Gamepad2 },
    { id: 'coding', label: 'Kids Coding', icon: Code },
    { id: 'learning', label: 'STEM & Learning', icon: GraduationCap }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Vigilo Safe Alternatives Directory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          "Don't just block danger—guide children to official, verified sources."
          AI URL fabrication is strictly forbidden; all recommendations are checked against this verified whitelist.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex space-x-1 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search safe portals or games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => {
          const tags = typeof res.tags === 'string' ? JSON.parse(res.tags) : res.tags || [];
          return (
            <div
              key={res.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {res.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-medium bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">{res.category}</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Visit Safe Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
