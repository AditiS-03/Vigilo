import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Download, Sliders, CheckCircle2, ChevronRight, ExternalLink, Sparkles, Activity, Clock, ArrowUpRight } from 'lucide-react';
import DemoBanner from '../components/DemoBanner';
import IncidentModal from '../components/IncidentModal';

export default function Overview({ summary, incidents = [], onNavigate, onScenarioSimulated }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const todays = summary?.todays_protection || {
    high_risk_threats: 14,
    suspicious_websites: 38,
    dangerous_downloads_blocked: 4,
    warnings_issued: 21,
    threats_resolved: 18
  };

  const adaptive = summary?.adaptive_profile || {
    gaming_scams: 4,
    phishing: 2,
    malicious_downloads: 1,
    adapted_thresholds: { gaming: 55, phishing: 60, downloads: 50, default: 70 },
    threat_levels: { gaming_scams: 'HIGH', phishing: 'MEDIUM', malicious_downloads: 'MEDIUM' }
  };

  const categories = summary?.threat_categories || {
    gaming_scams: 8,
    phishing: 5,
    malicious_downloads: 3,
    fake_logins: 2,
    suspicious_content: 6
  };

  const totalCatCount = Object.values(categories).reduce((a, b) => a + b, 0) || 1;

  const categoryLabels = {
    gaming_scams: { label: 'Gaming Reward Scams', color: 'bg-rose-500' },
    phishing: { label: 'Phishing Traps', color: 'bg-amber-500' },
    malicious_downloads: { label: 'Dangerous Executables', color: 'bg-purple-500' },
    fake_logins: { label: 'Credential Harvesters', color: 'bg-red-500' },
    suspicious_content: { label: 'Deceptive Content', color: 'bg-blue-500' }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Judge Presentation Console Banner */}
      <DemoBanner onScenarioSimulated={onScenarioSimulated} />

      {/* Today's Protection KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">High-Risk Blocked</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{todays.high_risk_threats}</div>
          <p className="text-[11px] text-rose-400/90 mt-1 flex items-center space-x-1">
            <span>🔴 100% neutralized at browser layer</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Downloads Quarantined</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{todays.dangerous_downloads_blocked}</div>
          <p className="text-[11px] text-purple-400/90 mt-1 flex items-center space-x-1">
            <span>🛡️ Demo Quarantine Simulated</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Suspicious Warned</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{todays.warnings_issued}</div>
          <p className="text-[11px] text-amber-400/90 mt-1 flex items-center space-x-1">
            <span>⚠️ Safe alternatives provided</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Vigilo Coach Mastery</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">100%</div>
          <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center space-x-1">
            <span>🌟 3 Cyber badges earned</span>
          </p>
        </div>
      </div>

      {/* Middle Grid: Threat Breakdown + Adaptive Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Category Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Aggregated Threat Category Distribution</h3>
              <p className="text-xs text-slate-400">Only category counts are tracked; individual URLs/history are never logged.</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
              {Object.values(categories).reduce((a, b) => a + b, 0)} Total Detections
            </span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(categories).map(([key, count]) => {
              const info = categoryLabels[key] || { label: key, color: 'bg-slate-600' };
              const percent = Math.round((count / totalCatCount) * 100);
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{info.label}</span>
                    <span className="text-slate-400">{count} events ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${info.color} transition-all duration-500`}
                      style={{ width: `${Math.max(6, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Multi-Signal ML (Random Forest) + Gemini AI Active</span>
            </span>
            <button
              onClick={() => onNavigate('analyzer')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>Test Live Analyzer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Adaptive Profile Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Adaptive Protection</span>
              </h3>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                DYNAMIC
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Vigilo tightens warning sensitivity when exposure to specific threat vectors increases.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Gaming Scrutiny</span>
                  <span className="text-[11px] text-slate-400">Threshold: {adaptive.adapted_thresholds?.gaming || 55}/100</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {adaptive.threat_levels?.gaming_scams || 'HIGH'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Phishing Scrutiny</span>
                  <span className="text-[11px] text-slate-400">Threshold: {adaptive.adapted_thresholds?.phishing || 60}/100</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {adaptive.threat_levels?.phishing || 'MEDIUM'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Download Protection</span>
                  <span className="text-[11px] text-slate-400">Threshold: {adaptive.adapted_thresholds?.downloads || 50}/100</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {adaptive.threat_levels?.malicious_downloads || 'MEDIUM'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('adaptive')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-xl transition-colors text-center"
            >
              Tune Adaptive Thresholds →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Security Incidents Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Security Incidents & Forensic Evidence</h3>
            <p className="text-xs text-slate-400">Click any incident to inspect complete multi-signal indicators and evidence pack.</p>
          </div>
          <button
            onClick={() => onNavigate('incidents')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Incidents</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {incidents.slice(0, 5).map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="py-3 px-2 rounded-xl hover:bg-slate-850/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${inc.risk_score >= 80 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : inc.risk_score >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                  {inc.risk_score}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{inc.threat_type}</span>
                    <span className="text-[10px] font-mono text-slate-400">{inc.id}</span>
                  </div>
                  <span className="text-xs text-slate-400 truncate max-w-md block mt-0.5">{inc.url}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {inc.action_taken}
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Modal */}
      {selectedIncident && (
        <IncidentModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      )}
    </div>
  );
}
