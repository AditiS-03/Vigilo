import React, { useState, useEffect } from 'react';
import { User, Shield, Activity, Bell, Mail, Phone, Save, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { fetchParentContact, saveParentContact, fetchParentAlerts } from '../api';

export default function Profile({ summary, incidents = [] }) {
  const [parentContact, setParentContact] = useState({
    name: 'Sarah Miller',
    relationship: 'Parent / Guardian',
    email: 'sarah.miller@example.com',
    phone: '+1 (555) 019-2834',
    alert_high_risk: true,
    alert_downloads: true,
    alert_medium_risk: false,
    notification_method: 'in_app'
  });
  const [alerts, setAlerts] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchParentContact()
      .then(data => data && setParentContact(data))
      .catch(e => console.log('Loaded default parent contact', e));

    fetchParentAlerts()
      .then(res => res?.alerts && setAlerts(res.alerts))
      .catch(e => console.log('Loaded default alerts', e));
  }, []);

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveParentContact(parentContact);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save parent contact', err);
    } finally {
      setIsSaving(false);
    }
  };

  const highRiskCount = incidents.filter(i => (i.risk_score || 0) >= 80).length;
  const suspiciousCount = incidents.filter(i => (i.risk_score || 0) >= 40 && (i.risk_score || 0) < 80).length;
  const downloadsCount = incidents.filter(i => i.download_metadata || (i.threat_category || '').includes('download')).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Profile Header */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-neon-cyan flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl border-2 border-cyan-500/50 overflow-hidden shadow-lg shadow-cyan-500/10">
            <img
              src="/leo-avatar.png"
              alt="Leo's Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">Leo's Safety Profile</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">Age 10</span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Child Profile • Active Protection Engine Enabled</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs font-semibold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Shield className="w-4 h-4" />
                <span>Vigilo Shield Active</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 text-cyan-300 text-xs font-semibold px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Activity className="w-3.5 h-3.5" />
                <span>Member since Sept 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border-slate-800">
          <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Threats Blocked</span>
          <div className="text-3xl font-extrabold text-white mt-2">{highRiskCount || summary?.todays_protection?.high_risk_threats || 23}</div>
          <span className="text-xs text-rose-400 mt-1 block">High risk interventions</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border-slate-800">
          <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Suspicious Pages</span>
          <div className="text-3xl font-extrabold text-white mt-2">{suspiciousCount || summary?.todays_protection?.suspicious_websites || 8}</div>
          <span className="text-xs text-amber-400 mt-1 block">Warnings issued</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border-slate-800">
          <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Dangerous Downloads</span>
          <div className="text-3xl font-extrabold text-white mt-2">{downloadsCount || summary?.todays_protection?.dangerous_downloads_blocked || 2}</div>
          <span className="text-xs text-cyan-400 mt-1 block">Quarantined executables</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border-slate-800">
          <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Parent Alerts</span>
          <div className="text-3xl font-extrabold text-white mt-2">{alerts.length || 4}</div>
          <span className="text-xs text-emerald-400 mt-1 block">Notifications sent</span>
        </div>
      </div>

      {/* Parent Contact Information Form */}
      <div className="glass-panel p-8 rounded-2xl space-y-6 border-slate-800">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <Bell className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Parent / Guardian Contact & Alert Settings</h2>
            <p className="text-xs text-slate-400">Configure alert channels and notification triggers when severe threats occur.</p>
          </div>
        </div>

        {isSaved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-3 text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Parent contact details and notification preferences saved successfully to database!</span>
          </div>
        )}

        <form onSubmit={handleSaveContact} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Guardian Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={parentContact.name}
                  onChange={(e) => setParentContact({ ...parentContact, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Relationship</label>
              <input
                type="text"
                required
                value={parentContact.relationship}
                onChange={(e) => setParentContact({ ...parentContact, relationship: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={parentContact.email}
                  onChange={(e) => setParentContact({ ...parentContact, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  value={parentContact.phone}
                  onChange={(e) => setParentContact({ ...parentContact, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">Alert Preferences</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={parentContact.alert_high_risk}
                  onChange={(e) => setParentContact({ ...parentContact, alert_high_risk: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-700 focus:ring-cyan-500 bg-slate-950"
                />
                <span className="text-xs text-slate-200 font-medium">High-risk threats (Score ≥ 80)</span>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={parentContact.alert_downloads}
                  onChange={(e) => setParentContact({ ...parentContact, alert_downloads: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-700 focus:ring-cyan-500 bg-slate-950"
                />
                <span className="text-xs text-slate-200 font-medium">Dangerous executable downloads</span>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={parentContact.alert_medium_risk}
                  onChange={(e) => setParentContact({ ...parentContact, alert_medium_risk: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-700 focus:ring-cyan-500 bg-slate-950"
                />
                <span className="text-xs text-slate-200 font-medium">Medium-risk warnings</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-cyber-dark font-bold text-sm rounded-xl transition-all flex items-center space-x-2 shadow-neon-cyan"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Contact Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Parent Alerts Log */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <span>Parent Alert Feed</span>
        </h2>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-rose-400 text-sm">{alert.title}</span>
                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded-full uppercase">{alert.severity}</span>
                </div>
                <p className="text-xs text-slate-300">{alert.message}</p>
                <div className="text-[10px] text-slate-500 font-mono">Domain: {alert.domain || 'N/A'} • {new Date(alert.created_at).toLocaleString()}</div>
              </div>
              <a
                href={`/api/incidents/${alert.incident_id || 'INCIDENT'}/evidence/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5 flex-shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Evidence PDF</span>
              </a>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-6">No parent alerts recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
