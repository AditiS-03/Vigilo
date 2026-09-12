import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Download, Award, Compass, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function DemoBanner({ onScenarioExecuted }) {
  const [activeRunning, setActiveRunning] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const scenarios = [
    {
      id: 'scenario_1_safe',
      label: '1. Safe Edu Site',
      icon: ShieldCheck,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
    },
    {
      id: 'scenario_2_gaming_scam',
      label: '2. Gaming Scam',
      icon: AlertTriangle,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400',
    },
    {
      id: 'scenario_3_fake_login',
      label: '3. Fake Login',
      icon: AlertTriangle,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400',
    },
    {
      id: 'scenario_4_download',
      label: '4. Block Download',
      icon: Download,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
    },
    {
      id: 'scenario_5_adaptive',
      label: '5. Adaptive Shift',
      icon: Sparkles,
      color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400',
    },
    {
      id: 'scenario_6_coach',
      label: '6. Coach Challenge',
      icon: Award,
      color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
    },
    {
      id: 'scenario_7_safe_alt',
      label: '7. Safe Alternative',
      icon: Compass,
      color: 'hover:border-sky-500/50 hover:bg-sky-500/10 text-sky-400',
    },
  ];

  async function handleRun(id) {
    setActiveRunning(id);
    setLastResult(null);
    try {
      const res = await api.simulateDemo(id);
      setLastResult(res);
      if (onScenarioExecuted) {
        onScenarioExecuted();
      }
    } catch (err) {
      setLastResult({ error: err.message });
    } finally {
      setActiveRunning(null);
    }
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
              Judges Live Presentation Console
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            1-Click Interactive Threat Scenarios
          </h2>
          <p className="text-xs text-slate-400">
            Simulate safe sites, game coin scams, fake logins, and quarantined downloads to test AI reasoning in real-time.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isRunning = activeRunning === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleRun(sc.id)}
                disabled={activeRunning !== null}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 border border-slate-700/80 transition-all ${sc.color} ${
                  isRunning ? 'opacity-50 animate-pulse' : ''
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Running...' : sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result feedback box if a scenario ran */}
      {lastResult && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs flex items-start justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">
                {lastResult.scenario?.title || 'Execution Successful'}:
              </span>{' '}
              <span className="text-slate-300">
                {lastResult.scenario?.expected}
              </span>
              {lastResult.result?.explanation?.child_explanation && (
                <div className="mt-1 text-cyan-300 italic">
                  "{lastResult.result.explanation.child_explanation}"
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setLastResult(null)}
            className="text-slate-500 hover:text-slate-300 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
