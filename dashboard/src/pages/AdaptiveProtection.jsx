import React, { useState } from 'react';
import { Sparkles, Shield, Sliders, Lock, Info, PlusCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function AdaptiveProtection({ profile, onProfileUpdated }) {
  const [loading, setLoading] = useState(false);

  const categories = [
    {
      key: 'gaming_scams',
      title: 'Gaming Scams & Bait Currency',
      count: profile?.gaming_scams ?? 4,
      level: profile?.threat_levels?.gaming_scams || 'HIGH',
      threshold: profile?.adapted_thresholds?.gaming || 55,
      description: 'Tightened sensitivity for free Robux/V-Bucks sites and fake reward generators.',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      key: 'phishing',
      title: 'Credential Phishing & Fake Logins',
      count: profile?.phishing ?? 2,
      level: profile?.threat_levels?.phishing || 'MEDIUM',
      threshold: profile?.adapted_thresholds?.phishing || 60,
      description: 'Scrutiny on password collection fields on non-authentic subdomains.',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      key: 'malicious_downloads',
      title: 'Dangerous Executable Downloads',
      count: profile?.malicious_downloads ?? 1,
      level: profile?.threat_levels?.malicious_downloads || 'LOW',
      threshold: profile?.adapted_thresholds?.downloads || 50,
      description: 'Enforces demo quarantine on .exe, .scr, and .bat downloads from unverified origins.',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      key: 'fake_logins',
      title: 'Account Verification Spoofs',
      count: profile?.fake_logins ?? 1,
      level: profile?.threat_levels?.fake_logins || 'LOW',
      threshold: 65,
      description: 'Detects fake security warning screens spoofing Steam or Discord.',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  async function handleSimulateExposure(category) {
    setLoading(true);
    try {
      await api.adjustAdaptiveProfile(category, 2);
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err) {
      console.error("Adaptive adjustment failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Privacy Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Section F: Adaptive Protection System</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Privacy-Conscious Dynamic Threat Modeling
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Vigilo adapts protection dynamically based on aggregated threat categories rather than invasive personal browsing surveillance. As a child encounters specific threats, sensitivity automatically tightens.
            </p>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs text-emerald-400">
            <Lock className="w-4 h-4" />
            <span className="font-semibold">Zero Private History Stored</span>
          </div>
        </div>

        {/* Privacy Design Explanation Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">How Privacy-Preserving Adaptation Works:</strong>{' '}
            Vigilo only increments anonymized threat category counters (e.g. <code>gaming_scams + 1</code>). It does not log what school homework the child searched, what videos they watched, or personal keystrokes.
          </div>
        </div>
      </div>

      {/* Aggregated Threat Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-100">{cat.title}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${cat.badgeColor}`}>
                  {cat.level} RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{cat.description}</p>

              {/* Dynamic Sensitivity Slider indicator */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Adapted Warning Threshold:</span>
                  <span className="font-mono text-cyan-400 font-bold">{cat.threshold} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                    style={{ width: `${(100 - cat.threshold)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Standard (70)</span>
                  <span>High Scrutiny ({cat.threshold})</span>
                </div>
              </div>
            </div>

            {/* Actions: Live Simulate Counter Increment */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                Incidents Logged: <strong className="text-white">{cat.count}</strong>
              </span>
              <button
                onClick={() => handleSimulateExposure(cat.key)}
                disabled={loading}
                className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold border border-slate-700 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Simulate +2 Incidents</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
