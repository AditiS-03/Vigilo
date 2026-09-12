import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Incidents from './pages/Incidents';
import LiveAnalyzer from './pages/LiveAnalyzer';
import QuickScan from './pages/QuickScan';
import AdaptiveProtection from './pages/AdaptiveProtection';
import Profile from './pages/Profile';
import Extension from './pages/Extension';
import { fetchDashboardSummary, fetchIncidents, simulateScenario } from './api';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sum, incs] = await Promise.all([
        fetchDashboardSummary(),
        fetchIncidents()
      ]);
      setSummary(sum);
      setIncidents(incs);
      
      const notifs = incs
        .filter(i => i.risk_score >= 80)
        .slice(0, 5)
        .map(i => ({
          id: `notif-${i.id}`,
          incident_id: i.id,
          title: `Blocked: ${i.threat_type}`,
          message: `Vigilo prevented child access to ${i.domain}.`,
          severity: 'HIGH',
          read: false,
          created_at: i.created_at
        }));
      setNotifications(notifs);
    } catch (err) {
      console.error("Failed to load initial Vigilo data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScenarioSimulated = async (scenarioData) => {
    try {
      const [sum, incs] = await Promise.all([
        fetchDashboardSummary(),
        fetchIncidents()
      ]);
      setSummary(sum);
      setIncidents(incs);
    } catch (e) {
      console.error("Refresh error:", e);
    }
  };

  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative">
      {!isLanding && (
        <Header
          notifications={notifications}
          aiStatus={summary?.ai_status}
          onTriggerScenario={(scId) => simulateScenario(scId).then(handleScenarioSimulated)}
        />
      )}

      <main className={`flex-1 w-full ${!isLanding ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/protection" element={<Overview summary={summary} incidents={incidents} onScenarioSimulated={handleScenarioSimulated} />} />
          <Route path="/incidents" element={<Incidents incidents={incidents} />} />
          <Route path="/quick-scan" element={<QuickScan />} />
          <Route path="/threat-lab" element={<LiveAnalyzer />} />
          <Route path="/adaptive" element={<AdaptiveProtection />} />
          <Route path="/profile" element={<Profile summary={summary} incidents={incidents} />} />
          <Route path="/extension" element={<Extension />} />
        </Routes>
      </main>

      {/* Global Footer */}
      {!isLanding && (
        <footer className="border-t border-slate-800/60 bg-slate-950/80 py-6 text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-white tracking-tight">VIGILO AI DEFENSE</span>
              <span className="text-slate-600">|</span>
              <span>"Protect every click."</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-emerald-400 font-medium">🔒 Zero URL History Logging</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-medium">FastAPI Engine</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
