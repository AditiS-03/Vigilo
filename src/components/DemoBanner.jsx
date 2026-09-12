import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, Cpu, ExternalLink, X, RefreshCw } from 'lucide-react';
import { simulateScenario } from '../api';

export default function DemoBanner({ onScenarioSimulated }) {
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  const scenarios = [
    { id: 'scenario_1_safe', num: '1', title: 'Safe Edu Site', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', desc: 'Score < 20 • Allow Access' },
    { id: 'scenario_2_gaming_scam', num: '2', title: 'Fake Game Reward', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', desc: 'Score 92 • Block & Safe Alt' },
    { id: 'scenario_3_fake_login', num: '3', title: 'Fake Login Phish', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', desc: 'Score 94 • Credential Block' },
    { id: 'scenario_4_download', num: '4', title: 'Unsafe Download', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', desc: 'Cancel & Demo Quarantine' },
    { id: 'scenario_5_adaptive', num: '5', title: 'Adaptive Shift', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', desc: 'Threshold drops 70 -> 55' },
    { id: 'scenario_6_coach', num: '6', title: 'Coach Challenge', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', desc: 'Interactive Child Quiz' },
    { id: 'scenario_7_safe_alt', num: '7', title: 'Safe Alternatives', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', desc: 'Vetted Whitelist Portal' }
  ];

  const handleRun = async (scenarioId) => {
    try {
      setIsLoading(true);
      setActiveSimulation(scenarioId);
      const data = await simulateScenario(scenarioId);
      setResultModal(data);
      if (onScenarioSimulated) {
        onScenarioSimulated(data);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsLoading(false);
      setActiveSimulation(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden mb-8">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Title & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
            ⚡
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Judge & Evaluator Presentation Console</span>
              <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                1-Click Execution
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trigger any of the 7 real-time threat detection scenarios without needing to visit live phishing sites.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Response Agent Active</span>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {scenarios.map((sc) => {
          const isRunning = activeSimulation === sc.id;
          return (
            <button
              key={sc.id}
              id={`btn-demo-${sc.id}`}
              disabled={isLoading}
              onClick={() => handleRun(sc.id)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${sc.badge} hover:brightness-110 disabled:opacity-50`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-[11px] opacity-80">Scenario {sc.num}</span>
                {isRunning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current opacity-70" />
                )}
              </div>
              <span className="font-bold text-xs text-white truncate w-full">{sc.title}</span>
              <span className="text-[10px] text-slate-300/80 line-clamp-1 mt-0.5">{sc.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Simulation Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setResultModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">🛡️</span>
              <h3 className="text-lg font-bold text-white">{resultModal.scenario?.title}</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong>Objective:</strong> {resultModal.scenario?.description}
            </p>

            {/* Results breakdown */}
            <div className="space-y-4">
              {/* Score and action badge */}
              {resultModal.result?.risk_score !== undefined && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Risk Score</span>
                    <span className={`text-2xl font-extrabold ${resultModal.result.risk_score >= 80 ? 'text-rose-400' : resultModal.result.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {resultModal.result.risk_score} / 100
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Severity</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      {resultModal.result.severity || 'SAFE'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Confidence</span>
                    <span className="text-sm font-bold text-cyan-400 mt-1 block">
                      {resultModal.result.confidence || 95}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Target</span>
                    <span className="text-xs font-semibold text-slate-300 truncate mt-1 block">
                      {resultModal.result.domain || resultModal.result.filename || 'Web Domain'}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Taken */}
              {resultModal.result?.response_actions && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Response Agent Action List:</span>
                  <div className="flex flex-wrap gap-2">
                    {resultModal.result.response_actions.map((act, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Download / Quarantine Notice */}
              {resultModal.result?.quarantine_status && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Clean-Up Action: {resultModal.result.action_taken}</span>
                  </div>
                  <p className="text-xs text-amber-200/80">{resultModal.result.notice}</p>
                  {resultModal.result.recovery_guidance && (
                    <div className="mt-2 text-xs text-slate-300">
                      <strong>Recovery Steps:</strong>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {resultModal.result.recovery_guidance.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* AI Explanation */}
              {resultModal.result?.explanation && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-2">
                    <span>🦉</span>
                    <span>Vigilo AI Threat Explanation:</span>
                  </div>
                  <p className="text-xs text-slate-200 mb-2 font-medium">
                    {resultModal.result.explanation.risk_explanation || resultModal.result.explanation.explanation}
                  </p>
                  {resultModal.result.explanation.child_friendly_warning && (
                    <div className="p-2.5 bg-cyan-950/40 rounded-lg border border-cyan-800/40 text-xs text-cyan-200">
                      <strong>Child Message:</strong> "{resultModal.result.explanation.child_friendly_warning}"
                    </div>
                  )}
                </div>
              )}

              {/* Adaptive Simulation Results */}
              {resultModal.result?.updated_profile && (
                <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-xl">
                  <span className="text-xs font-bold text-indigo-300 block mb-2">⚡ Privacy-Safe Dynamic Adaptation:</span>
                  <p className="text-xs text-slate-300 mb-3">{resultModal.result.message}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Gaming Incidents</span>
                      <strong className="text-white">{resultModal.result.updated_profile.gaming_scams} encounters</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Gaming Sensitivity</span>
                      <strong className="text-rose-400">{resultModal.result.updated_profile.threat_levels.gaming_scams}</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Adapted Threshold</span>
                      <strong className="text-amber-400">{resultModal.result.updated_profile.adapted_thresholds.gaming} / 100</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Safe Alternatives */}
              {resultModal.result?.safe_resources && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 block mb-2">✨ Vetted Safe Alternatives:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resultModal.result.safe_resources.map((res, i) => (
                      <div key={i} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">{res.name}</span>
                          <span className="text-[11px] text-slate-400 block">{res.description}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold ml-2">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setResultModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Close Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
