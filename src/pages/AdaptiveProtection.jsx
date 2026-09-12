import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Zap, RefreshCw, ChevronDown, Info, Clock, ArrowRight } from 'lucide-react';
import { fetchAdaptiveProfile, triggerAdaptiveIncident, updateAdaptiveThresholds } from '../api';

const PROTECTION_CATEGORIES = [
  {
    key: 'gaming',
    counterKey: 'gaming_scams',
    levelKey: 'gaming_scams',
    icon: '🎮',
    title: 'Gaming Scams',
    description: 'Fake free V-Bucks, Robux generators, coin giveaways, and reward traps.',
    details: [
      'Free reward offers',
      'Suspicious gaming websites',
      'Coin and skin generators',
      'Fake game currency sites',
    ],
    simulateCategory: 'gaming_scams',
    simulateLabel: '+ Simulate Gaming Threat',
    color: 'rose',
  },
  {
    key: 'phishing',
    counterKey: 'phishing',
    levelKey: 'phishing',
    icon: '🔗',
    title: 'Phishing',
    description: 'Fake login pages, credential harvesters, and account verification scams.',
    details: [
      'Fake account login pages',
      'Urgency manipulation tactics',
      'Credential harvesting forms',
      'Impersonation of real platforms',
    ],
    simulateCategory: 'phishing',
    simulateLabel: '+ Simulate Phishing Threat',
    color: 'amber',
  },
  {
    key: 'downloads',
    counterKey: 'malicious_downloads',
    levelKey: 'malicious_downloads',
    icon: '⬇',
    title: 'Suspicious Downloads',
    description: 'Executable files, game mod installers, and suspicious file downloads.',
    details: [
      'Executable .exe and .scr files',
      'Game mods from unknown sites',
      'Files from suspicious domains',
      'Bait-named game installers',
    ],
    simulateCategory: 'malicious_downloads',
    simulateLabel: '+ Simulate Download Threat',
    color: 'violet',
  },
];

const LEVEL_OPTIONS = ['STANDARD', 'MEDIUM', 'HIGH'];

const levelColors = {
  HIGH: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', ring: 'border-rose-500/40', label: 'HIGH ATTENTION' },
  MEDIUM: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', ring: 'border-amber-500/30', label: 'MEDIUM ATTENTION' },
  STANDARD: { badge: 'bg-slate-700/60 text-slate-300 border-slate-600/50', ring: 'border-slate-700', label: 'STANDARD' },
  LOW: { badge: 'bg-slate-700/60 text-slate-300 border-slate-600/50', ring: 'border-slate-700', label: 'STANDARD' },
};

function getLevel(count) {
  if (count >= 5) return 'HIGH';
  if (count >= 2) return 'MEDIUM';
  return 'STANDARD';
}

function getReasonText(category, count) {
  if (count === 0) return 'No threats encountered yet in this category. Standard protection is active.';
  if (count >= 5) return `This profile has encountered ${count} ${category.title.toLowerCase()} recently. Vigilo increased attention for this category.`;
  if (count >= 2) return `${count} ${category.title.toLowerCase()} have been detected. Protection is being elevated.`;
  return `${count} event${count > 1 ? 's' : ''} detected. Monitoring closely.`;
}

function ProtectionCard({ cat, count, isUpdating, onSimulate }) {
  const [showReason, setShowReason] = useState(false);
  const level = getLevel(count);
  const colors = levelColors[level] || levelColors.STANDARD;

  return (
    <div className={`glass-panel rounded-2xl p-6 border ${colors.ring} space-y-5 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-2xl">
            {cat.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{cat.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{count} event{count !== 1 ? 's' : ''} detected</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed">{cat.description}</p>

      {/* What Vigilo watches */}
      <div className="bg-slate-900/60 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400">Vigilo pays extra attention to:</p>
        <ul className="space-y-1">
          {cat.details.map((d, i) => (
            <li key={i} className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Protection level indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Protection Level</span>
          <span className={`font-bold ${level === 'HIGH' ? 'text-rose-400' : level === 'MEDIUM' ? 'text-amber-400' : 'text-slate-300'}`}>
            {level}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${level === 'HIGH' ? 'bg-rose-500 w-full' : level === 'MEDIUM' ? 'bg-amber-500 w-2/3' : 'bg-slate-500 w-1/3'}`}
          />
        </div>
      </div>

      {/* Why did Vigilo change this? */}
      <button
        onClick={() => setShowReason(!showReason)}
        className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        <span>Why did Vigilo set this level?</span>
      </button>

      {showReason && (
        <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs text-slate-300 leading-relaxed animate-fade-in">
          {getReasonText(cat, count)}
        </div>
      )}

      {/* Simulate button for demo */}
      <button
        onClick={() => onSimulate(cat.simulateCategory)}
        disabled={isUpdating}
        className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl transition-all disabled:opacity-50"
      >
        {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" /> : cat.simulateLabel}
      </button>
    </div>
  );
}

export default function AdaptiveProtection() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdaptiveProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load adaptive profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSimulate = async (category) => {
    try {
      setIsUpdating(true);
      const res = await triggerAdaptiveIncident(category);
      setProfile(res.profile);
      const catLabel = PROTECTION_CATEGORIES.find(c => c.simulateCategory === category)?.title || category;
      setToast(`Protection updated: ${catLabel} attention increased.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-24 space-x-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading protection profile…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border border-cyan-500/40 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl text-sm flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Adaptive Protection</h1>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Vigilo learns which types of online threats matter most to this profile and adjusts protection accordingly.
        </p>
      </div>

      {/* Status Overview */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-emerald-500/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white">Protection Active for Leo</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Total threats encountered: <strong className="text-white">{(profile.gaming_scams || 0) + (profile.phishing || 0) + (profile.malicious_downloads || 0)}</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {PROTECTION_CATEGORIES.map(cat => {
            const count = profile[cat.counterKey] || 0;
            const level = getLevel(count);
            const c = levelColors[level];
            return (
              <div key={cat.key} className={`px-3 py-1.5 rounded-full border font-semibold ${c.badge}`}>
                {cat.icon} {cat.title}: {c.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROTECTION_CATEGORIES.map(cat => (
          <ProtectionCard
            key={cat.key}
            cat={cat}
            count={profile[cat.counterKey] || 0}
            isUpdating={isUpdating}
            onSimulate={handleSimulate}
          />
        ))}
      </div>

      {/* Protection Timeline */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Protection History</h2>
        </div>

        <div className="space-y-3">
          {[
            { time: '10:42 AM', type: 'Gaming Phishing', score: 94, action: 'Blocked', color: 'rose' },
            { time: '10:39 AM', type: 'Suspicious Download', score: 87, action: 'Warning', color: 'amber' },
            { time: '9:51 AM', type: 'Safe Gaming Site', score: 12, action: 'Allowed', color: 'emerald' },
          ].map((event, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${event.color === 'rose' ? 'bg-rose-500' : event.color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-sm font-medium text-white">{event.type}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{event.time} today</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-right">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                  event.score >= 80 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  event.score >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {event.score}
                </div>
                <span className={`text-xs font-bold ${
                  event.action === 'Blocked' ? 'text-rose-400' :
                  event.action === 'Warning' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {event.action}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Protection Update Notice */}
        {(profile.gaming_scams >= 3 || profile.phishing >= 2 || profile.malicious_downloads >= 2) && (
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Protection Updated</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.gaming_scams >= 3 && `Gaming Scam Protection: STANDARD → HIGH. Reason: Repeated gaming-related threats detected (${profile.gaming_scams} events).`}
              {profile.phishing >= 2 && ` Phishing Protection elevated due to ${profile.phishing} phishing encounters.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
