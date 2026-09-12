import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DemoBanner from './components/DemoBanner';
import IncidentModal from './components/IncidentModal';
import Overview from './pages/Overview';
import Incidents from './pages/Incidents';
import AdaptiveProtection from './pages/AdaptiveProtection';
import Coach from './pages/Coach';
import SafeDirectory from './pages/SafeDirectory';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Poll updates every 15 seconds to catch live events from the browser extension
    const timer = setInterval(loadDashboardData, 15000);
    return () => clearInterval(timer);
  }, []);

  async function loadDashboardData() {
    try {
      const [sum, incs, notifs] = await Promise.all([
        api.getSummary(),
        api.getIncidents(50),
        api.getNotifications()
      ]);
      setSummary(sum);
      setIncidents(incs);
      setNotifications(notifs);
    } catch (err) {
      console.warn("Vigilo Backend not yet reachable. (Is python backend running on port 8000?)", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationsCount={notifications.filter(n => !n.read).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Judge Live Presentation Demo Banner */}
        <DemoBanner onScenarioExecuted={loadDashboardData} />

        {/* Tab Routing */}
        {activeTab === 'overview' && (
          <Overview
            summary={summary}
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'incidents' && (
          <Incidents
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {activeTab === 'adaptive' && (
          <AdaptiveProtection
            profile={summary?.adaptive_profile}
            onProfileUpdated={loadDashboardData}
          />
        )}

        {activeTab === 'coach' && (
          <Coach />
        )}

        {activeTab === 'directory' && (
          <SafeDirectory />
        )}
      </main>

      {/* Incident Detail / Evidence Pack Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Vigilo AI Child-Safety Defense Platform • Built for Hackathon Demo</span>
          <span className="text-slate-400">Autonomous Threat Interception • Zero Surveillance Policy</span>
        </div>
      </footer>
    </div>
  );
}
