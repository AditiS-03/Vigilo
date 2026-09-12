import React, { useState } from 'react';
import { Shield, Bell, AlertTriangle, CheckCircle2, ChevronDown, User, Sparkles, Sliders, BookOpen, ExternalLink, Search, Cpu } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, notifications = [], aiStatus, onTriggerScenario }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'incidents', label: 'Evidence & Incidents', icon: AlertTriangle },
    { id: 'analyzer', label: 'Live Threat Analyzer', icon: Cpu },
    { id: 'adaptive', label: 'Adaptive Protection', icon: Sliders },
    { id: 'coach', label: 'Vigilo Coach', icon: BookOpen },
    { id: 'safe_directory', label: 'Safe Directory', icon: CheckCircle2 },
    { id: 'ask_vigilo', label: 'Ask Vigilo Owl', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">VIGILO</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Parent Defense
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Child-Safety Threat Intelligence</p>
            </div>
          </div>

          {/* Active Status Pill */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">Shield Active</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Monitoring: <strong className="text-white">Leo</strong> (Age 10)</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${aiStatus?.gemini_configured ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className={aiStatus?.gemini_configured ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
                {aiStatus?.gemini_configured ? `Gemini (${aiStatus.model || 'Active'})` : 'Heuristic Guard'}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Button */}
            <button
              id="btn-header-demo-shortcut"
              onClick={() => onTriggerScenario && onTriggerScenario('scenario_2_gaming_scam')}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              title="Trigger Scenario 2 Demo"
            >
              <span>⚡ Quick Scam Demo</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                id="btn-notifications-toggle"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Parent Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Parent Safety Alerts</span>
                    <span className="text-xs text-slate-400">{notifications.length} recent</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No active safety alerts. All browsing safe!
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                          <div className="flex items-start space-x-2">
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.severity === 'HIGH' ? 'bg-rose-500' : notif.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 text-center bg-slate-950 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('incidents');
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      View All Security Incidents →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
