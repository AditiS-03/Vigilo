import React, { useState } from 'react';
import { Search, Download, Filter, FileText, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function Incidents({ incidents, onSelectIncident }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = (incidents || []).filter((inc) => {
    const matchesSearch =
      inc.id?.toLowerCase().includes(search.toLowerCase()) ||
      inc.domain?.toLowerCase().includes(search.toLowerCase()) ||
      inc.threat_type?.toLowerCase().includes(search.toLowerCase()) ||
      inc.url?.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      categoryFilter === 'ALL' || inc.threat_category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Evidence Packs & Security Incidents</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {filtered.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-first design: Storing threat forensics, indicators, and actions taken while excluding private browsing history.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by incident ID, domain, or threat type..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Threats' },
            { id: 'gaming_scams', label: 'Gaming Scams' },
            { id: 'phishing', label: 'Phishing' },
            { id: 'malicious_downloads', label: 'Downloads' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === tab.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Incident ID & Type</th>
                <th className="py-3.5 px-4">Domain / Origin</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Enforced Action</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Evidence Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onSelectIncident(inc)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-cyan-400 font-bold">{inc.id}</div>
                    <div className="font-semibold text-slate-200 mt-0.5">{inc.threat_type}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate">
                    <div className="font-mono text-slate-300 truncate">{inc.domain || 'unknown'}</div>
                    <div className="text-[11px] text-slate-500 truncate">{inc.url}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold ${
                      inc.risk_score >= 80
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {inc.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-300">
                      {inc.action_taken}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onSelectIncident(inc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-semibold"
                      >
                        Inspect Pack
                      </button>
                      <a
                        href={api.getReportUrl(inc.id, 'pdf')}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white transition"
                        title="Download Forensic PDF Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No matching incidents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
