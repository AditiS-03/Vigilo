import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Zap, RefreshCw, CheckCircle2, AlertTriangle, Lock, EyeOff, Info, ArrowDown, Sparkles } from 'lucide-react';
import { fetchAdaptiveProfile, triggerAdaptiveIncident, updateAdaptiveThresholds } from '../api';

export default function AdaptiveProtection() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdaptiveProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load adaptive profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSimulateEncounter = async (category) => {
    try {
      setIsUpdating(true);
      const res = await triggerAdaptiveIncident(category);
      setProfile(res.profile);
      setToastMessage(`Simulated ${category.replace('_', ' ')} encounter! Threshold dynamically adapted.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSliderChange = async (categoryKey, value) => {
    if (!profile) return;
    const newThresholds = {
      ...profile.adapted_thresholds,
      [categoryKey]: parseInt(value)
    };
    setProfile({
      ...profile,
      adapted_thresholds: newThresholds
    });

    try {
      await updateAdaptiveThresholds(newThresholds);
    } catch (err) {
      console.error("Failed to save threshold:", err);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading Adaptive Protection Profile...</span>
      </div>
    );
  }

  const getLevelColor = (level) => {
    if (level === 'HIGH') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (level === 'MEDIUM') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center space-x-2 animate-bounce">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>Privacy-Preserving Adaptive Threat Protection</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic sensitivity tuning based on aggregated threat frequencies without tracking child browsing history.
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Zero Browsing Surveillance Architecture</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Guaranteed
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional parental monitoring logs every innocent website, query, and message a child reads. Vigilo <strong>strictly rejects surveillance</strong>.
              Protection is adapted purely via anonymous category frequency counters (e.g. <code className="text-cyan-300 font-mono">gaming_scams: {profile.gaming_scams}</code>). When gaming scam exposure rises, Vigilo automatically lowers the detection threshold from 70 to 55, scrutinizing gaming traps without ever recording innocent browsing.
            </p>
          </div>
        </div>
      </div>

      {/* Adaptive Threat Category Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Gaming Scams */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Gaming Scams</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getLevelColor(profile.threat_levels?.gaming_scams)}`}>
              {profile.threat_levels?.gaming_scams || 'MEDIUM'} SCRUTINY
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Aggregated Encounters:</span>
              <strong className="text-white">{profile.gaming_scams} events</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Adapted Warning Threshold:</span>
              <strong className="text-cyan-400">{profile.adapted_thresholds?.gaming || 55} / 100</strong>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sensitivity Slider (Lower = More Strict):</label>
            <input
              type="range"
              min="30"
              max="80"
              value={profile.adapted_thresholds?.gaming || 55}
              onChange={(e) => handleSliderChange('gaming', e.target.value)}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Strict (30)</span>
              <span>Default (70)</span>
            </div>
          </div>

          <button
            disabled={isUpdating}
            onClick={() => handleSimulateEncounter('gaming_scams')}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all"
          >
            + Simulate Gaming Scam Exposure
          </button>
        </div>

        {/* Phishing Traps */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Credential Phishing</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getLevelColor(profile.threat_levels?.phishing)}`}>
              {profile.threat_levels?.phishing || 'LOW'} SCRUTINY
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Aggregated Encounters:</span>
              <strong className="text-white">{profile.phishing} events</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Adapted Warning Threshold:</span>
              <strong className="text-cyan-400">{profile.adapted_thresholds?.phishing || 60} / 100</strong>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sensitivity Slider (Lower = More Strict):</label>
            <input
              type="range"
              min="30"
              max="80"
              value={profile.adapted_thresholds?.phishing || 60}
              onChange={(e) => handleSliderChange('phishing', e.target.value)}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Strict (30)</span>
              <span>Default (70)</span>
            </div>
          </div>

          <button
            disabled={isUpdating}
            onClick={() => handleSimulateEncounter('phishing')}
            className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition-all"
          >
            + Simulate Phishing Exposure
          </button>
        </div>

        {/* Malicious Downloads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Executable Downloads</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getLevelColor(profile.threat_levels?.malicious_downloads)}`}>
              {profile.threat_levels?.malicious_downloads || 'MEDIUM'} SCRUTINY
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Aggregated Encounters:</span>
              <strong className="text-white">{profile.malicious_downloads} events</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Adapted Warning Threshold:</span>
              <strong className="text-cyan-400">{profile.adapted_thresholds?.downloads || 50} / 100</strong>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sensitivity Slider (Lower = More Strict):</label>
            <input
              type="range"
              min="30"
              max="80"
              value={profile.adapted_thresholds?.downloads || 50}
              onChange={(e) => handleSliderChange('downloads', e.target.value)}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Strict (30)</span>
              <span>Default (70)</span>
            </div>
          </div>

          <button
            disabled={isUpdating}
            onClick={() => handleSimulateEncounter('malicious_downloads')}
            className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition-all"
          >
            + Simulate Download Exposure
          </button>
        </div>
      </div>

      {/* Adaptive Mathematics Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>The Adaptation Model Formula</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The threat detection engine uses an inverse linear penalty formula to compute adapted thresholds:
        </p>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
          Threshold(Gaming) = max(35, 70 - (gaming_scams_counter * 3))
        </div>
        <p className="text-xs text-slate-400">
          As a child encounters repeated deceptive reward lures, Vigilo automatically lowers the threshold from 70 down to 55, triggering warnings on ambiguous sites that would otherwise pass a generic filter.
        </p>
      </div>
    </div>
  );
}
