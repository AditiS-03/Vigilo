import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Download, ExternalLink, AlertTriangle, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import IncidentModal from '../components/IncidentModal';

export default function Incidents({ incidents = [] }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const sourceIncidents = incidents.length > 0 ? incidents : [
    {
      id: 'VIG-DEMO-01',
      threat_type: 'Fake Gaming Currency Scam',
      threat_category: 'gaming_scams',
      risk_score: 92,
      domain: 'free-minecraft-coins-999.xyz',
      url: 'http://free-minecraft-coins-999.xyz/claim?user=steve',
      action_taken: 'BLOCK_PAGE',
      detected_indicators: ['Suspicious .xyz domain', 'Urgency countdown', 'Password harvesting lure'],
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'VIG-DEMO-02',
      threat_type: 'Roblox Credential Harvester',
      threat_category: 'phishing',
      risk_score: 95,
      domain: 'roblox-verification.xyz',
      url: 'http://roblox-verification.xyz/login',
      action_taken: 'BLOCK_PAGE',
      detected_indicators: ['Fake login form', 'Urgent account verification prompt', 'Unverified host'],
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'VIG-DEMO-03',
      threat_type: 'Dangerous Executable Download',
      threat_category: 'malicious_downloads',
      risk_score: 89,
      domain: 'free-game-rewards.xyz',
      url: 'http://free-game-rewards.xyz/download',
      action_taken: 'CANCEL_DOWNLOAD',
      detected_indicators: ['Executable .exe payload', 'Installer exploit bait', 'Untrusted origin'],
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const filtered = sourceIncidents.filter(inc => {
    if (categoryFilter !== 'all' && inc.threat_category !== categoryFilter) return false;
    if (severityFilter === 'dangerous' && inc.risk_score < 80) return false;
    if (severityFilter === 'high' && (inc.risk_score < 50 || inc.risk_score >= 80)) return false;
    if (severityFilter === 'suspicious' && inc.risk_score >= 50) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.url.toLowerCase().includes(q) ||
        inc.domain.toLowerCase().includes(q) ||
        inc.threat_type.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getBadgeColor = (score) => {
    if (score >= 80) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (score >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Forensic Evidence Packs & Security Incidents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audited records of high-risk threats blocked by Vigilo. Transparent evidence without logging innocent browsing.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          Showing <strong className="text-white">{filtered.length}</strong> of {sourceIncidents.length} recorded events
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-incidents-search"
            placeholder="Search domain, URL, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            id="select-incidents-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
          >
            <option value="all">All Threat Categories</option>
            <option value="gaming_scams">Gaming Reward Scams</option>
            <option value="phishing">Phishing Traps</option>
            <option value="malicious_downloads">Malicious Downloads</option>
            <option value="fake_logins">Fake Logins</option>
            <option value="suspicious_content">Suspicious Content</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="w-full md:w-auto">
          <select
            id="select-incidents-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
          >
            <option value="all">All Severities</option>
            <option value="dangerous">Dangerous (Score 80-100)</option>
            <option value="high">High Risk (Score 50-79)</option>
            <option value="suspicious">Suspicious (Score &lt; 50)</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No matching security incidents found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Risk</th>
                  <th className="p-4">Threat Identifier</th>
                  <th className="p-4">Domain / Intercepted URL</th>
                  <th className="p-4">Action Taken</th>
                  <th className="p-4">Forensic Indicators</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-slate-850/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${getBadgeColor(inc.risk_score)}`}>
                        {inc.risk_score}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{inc.threat_type}</span>
                      <span className="text-[10px] font-mono text-cyan-400 block">{inc.id}</span>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <span className="font-semibold text-slate-200 block truncate">{inc.domain}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{inc.url}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                        {inc.action_taken}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <span className="font-semibold">{inc.detected_indicators?.length || 0}</span>
                        <span className="text-slate-500">signals</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(inc.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 group-hover:border-cyan-500/40 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Forensic Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
