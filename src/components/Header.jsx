import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Bell, AlertTriangle, CheckCircle2, User, Sparkles, Sliders, Cpu, Chrome, Search, BookOpen, MessageSquareText } from 'lucide-react';

export default function Header({ notifications = [], aiStatus, onTriggerScenario }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: '/protection', label: 'Live Protection', icon: Shield },
    { id: '/quick-scan', label: 'Quick Scan', icon: Search },
    { id: '/threat-lab', label: 'Threat Lab', icon: Cpu },
    { id: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { id: '/adaptive', label: 'Adaptive', icon: Sliders },
    { id: '/profile', label: 'Profile', icon: User },
    { id: '/coach', label: 'Coach', icon: BookOpen },
    { id: '/ask-vigilo', label: 'Owl', icon: MessageSquareText },
    { id: '/extension', label: 'Extension', icon: Chrome },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-neon-cyan text-white font-bold">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">VIGILO</span>
              </div>
              <p className="text-xs text-cyan-400 hidden sm:block font-medium tracking-wide">AI Child-Safety</p>
            </div>
          </Link>

          {/* Active Status Pill */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800 shadow-glass">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold tracking-wide">Shield Active</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Monitoring: <strong className="text-white">Leo</strong></span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Security Alerts</span>
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
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.severity === 'HIGH' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'}`} />
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 text-center bg-slate-950 border-t border-slate-800">
                    <Link
                      to="/incidents"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      View All Incidents →
                    </Link>
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
            const isActive = location.pathname === item.id || (location.pathname === '/' && item.id === '/protection');
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
