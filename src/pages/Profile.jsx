import React from 'react';
import { User, Shield, Activity, Clock } from 'lucide-react';

export default function Profile({ summary, incidents = [] }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-neon-cyan flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center">
          <User className="w-10 h-10 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Leo's Profile</h1>
          <p className="text-slate-400">Child Profile • Age 10</p>
          <div className="mt-2 inline-flex items-center space-x-1.5 text-emerald-400 text-sm font-medium px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <Shield className="w-3.5 h-3.5" />
            <span>Protection Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Threats Prevented</span>
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.todays_protection?.threats_resolved || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Scams Avoided</span>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.threat_categories?.gaming_scams || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Downloads Blocked</span>
            <Clock className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.todays_protection?.dangerous_downloads_blocked || 0}</div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Recent Security Activity</h2>
        <div className="space-y-4">
          {incidents.slice(0, 5).map(inc => (
            <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${inc.risk_score >= 80 ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{inc.threat_type}</p>
                  <p className="text-xs text-slate-400">{inc.domain}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${inc.risk_score >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {inc.action_taken}
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Date(inc.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-4">No recent security events.</div>
          )}
        </div>
      </div>
    </div>
  );
}
