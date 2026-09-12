import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Overview from './pages/Overview';
import Incidents from './pages/Incidents';
import LiveAnalyzer from './pages/LiveAnalyzer';
import AdaptiveProtection from './pages/AdaptiveProtection';
import Coach from './pages/Coach';
import SafeDirectory from './pages/SafeDirectory';
import AskVigilo from './pages/AskVigilo';
import { fetchDashboardSummary, fetchIncidents, simulateScenario } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sum, incs] = await Promise.all([
        fetchDashboardSummary(),
        fetchIncidents()
      ]);
      setSummary(sum);
      setIncidents(incs);
      
      // Seed initial notifications from high risk incidents
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
    // Refresh dashboard stats after simulation
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        aiStatus={summary?.ai_status}
        onTriggerScenario={(scId) => simulateScenario(scId).then(handleScenarioSimulated)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <Overview
            summary={summary}
            incidents={incidents}
            onNavigate={(tab) => setActiveTab(tab)}
            onScenarioSimulated={handleScenarioSimulated}
          />
        )}
        {activeTab === 'incidents' && <Incidents incidents={incidents} />}
        {activeTab === 'analyzer' && <LiveAnalyzer />}
        {activeTab === 'adaptive' && <AdaptiveProtection />}
        {activeTab === 'coach' && <Coach />}
        {activeTab === 'safe_directory' && <SafeDirectory />}
        {activeTab === 'ask_vigilo' && <AskVigilo />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-850 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white tracking-tight">VIGILO AI DEFENSE</span>
            <span className="text-slate-600">|</span>
            <span>"Don't just block danger. Detect it, explain it, respond to it, and teach children to recognize it."</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-medium">🔒 Privacy Standard: Zero URL History Logging</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-medium">FastAPI & Express Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
