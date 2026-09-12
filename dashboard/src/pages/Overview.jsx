import React from 'react';
import { ShieldAlert, Globe, Download, AlertTriangle, CheckCircle2, ArrowUpRight, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export default function Overview({ summary, incidents, onSelectIncident, setActiveTab }) {
  const protection = summary?.todays_protection || {
    high_risk_threats: 0,
    suspicious_websites: 0,
    dangerous_downloads_blocked: 0,
    warnings_issued: 0,
    threats_resolved: 0,
  };

  const statCards = [
    {
      title: 'High-Risk Threats',
      value: protection.high_risk_threats,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      desc: 'Credential theft & malware portals',
    },
    {
      title: 'Suspicious Websites',
      value: protection.suspicious_websites,
      icon: Globe,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      desc: 'Unusual domains & unverified TLDs',
    },
    {
      title: 'Dangerous Downloads Blocked',
      value: protection.dangerous_downloads_blocked,
      icon: Download,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      desc: 'Demo quarantined executables',
    },
    {
      title: 'Warnings Issued',
      value: protection.warnings_issued,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      desc: 'Cautious browsing notices',
    },
    {
      title: 'Total Threats Resolved',
      value: protection.threats_resolved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      desc: 'Safely neutralized for child',
    },
  ];

  const categories = summary?.threat_categories || {};
  const adaptive = summary?.adaptive_profile || {};

  return (
    <div className="space-y-6">
      {/* 1. Today's Protection KPI Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Section A: Today's Protection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl bg-slate-900/90 border ${card.border} shadow-lg transition hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white">
                    {card.value}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200">{card.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{card.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Incidents + Category Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section B: Recent Incidents Feed */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Recent Intercepted Incidents</h3>
              <p className="text-xs text-slate-400">Meaningful security events rather than full personal browsing history.</p>
            </div>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(incidents || []).slice(0, 5).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    inc.risk_score >= 80 ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-amber-500'
                  }`} />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition truncate">
                        {inc.threat_type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {inc.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      Domain: <span className="text-slate-300 font-mono">{inc.domain || 'suspicious-origin'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-xs font-black ${
                      inc.risk_score >= 80 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {inc.risk_score}/100
                    </div>
                    <div className="text-[10px] text-slate-500">{inc.action_taken}</div>
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-300">→</span>
                </div>
              </div>
            ))}

            {(!incidents || incidents.length === 0) && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No threat incidents recorded yet. Your child is browsing safely!
              </div>
            )}
          </div>
        </div>

        {/* Section C & D: Threat Categories & Adaptive Snapshot */}
        <div className="space-y-6">
          {/* Threat Categories Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">Threat Categories</h3>
            <p className="text-xs text-slate-400 mb-4">Aggregated category breakdown.</p>

            <div className="space-y-3">
              {[
                { key: 'gaming_scams', label: 'Gaming Scams & Bait', count: categories.gaming_scams || 4, color: 'bg-rose-500' },
                { key: 'phishing', label: 'Credential Phishing', count: categories.phishing || 2, color: 'bg-indigo-500' },
                { key: 'malicious_downloads', label: 'Dangerous Downloads', count: categories.malicious_downloads || 1, color: 'bg-orange-500' },
                { key: 'fake_logins', label: 'Fake Login Portals', count: categories.fake_logins || 1, color: 'bg-purple-500' },
                { key: 'suspicious_content', label: 'Suspicious Content', count: categories.suspicious_content || 0, color: 'bg-amber-500' }
              ].map((cat) => {
                const total = 8; // normalize
                const pct = Math.min(100, Math.round((cat.count / total) * 100));
                return (
                  <div key={cat.key}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">{cat.label}</span>
                      <span className="text-slate-400">{cat.count} events</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(8, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adaptive Protection Mini Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Adaptive Protection Active</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">Gaming Threat Scrutiny Elevated</h4>
            <p className="text-xs text-slate-300 mt-1">
              Due to recent gaming scam exposures, Vigilo lowered detection thresholds for gaming bait URLs from 70 to <strong>55</strong>.
            </p>
            <button
              onClick={() => setActiveTab('adaptive')}
              className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1"
            >
              <span>Manage Adaptive Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
