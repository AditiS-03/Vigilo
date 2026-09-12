import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, Download, Copy, Check, FileText, Lock, Globe, Clock, Sparkles } from 'lucide-react';

export default function IncidentModal({ incident, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'indicators' | 'evidence_json'

  if (!incident) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(incident, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getSeverityBadge = (score) => {
    if (score >= 80) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (score >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:text-black print:bg-white">
        {/* Header */}
        <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between print:border-b-2 print:border-black">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${getSeverityBadge(incident.risk_score)}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-bold text-cyan-400">{incident.id}</span>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-full border ${getSeverityBadge(incident.risk_score)}`}>
                  Score {incident.risk_score}/100 • {incident.risk_score >= 80 ? 'DANGEROUS' : incident.risk_score >= 50 ? 'HIGH RISK' : 'SUSPICIOUS'}
                </span>
              </div>
              <h2 className="text-base font-bold text-white print:text-black mt-0.5">{incident.threat_type}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrintReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Print Official Evidence Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Report PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 px-5 pt-3 bg-slate-900 border-b border-slate-800 print:hidden">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-cyan-400 text-cyan-300 bg-slate-850'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Forensic Overview
          </button>
          <button
            onClick={() => setActiveTab('indicators')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'indicators'
                ? 'border-cyan-400 text-cyan-300 bg-slate-850'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Signals & Indicators ({incident.detected_indicators?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('evidence_json')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'evidence_json'
                ? 'border-cyan-400 text-cyan-300 bg-slate-850'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Evidence Pack JSON
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Quick Details Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-black">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Domain / Host</span>
                  <span className="text-xs font-bold text-white truncate block mt-1">{incident.domain}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-black">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="text-xs font-bold text-cyan-400 truncate block mt-1">{incident.threat_category}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-black">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Executed</span>
                  <span className="text-xs font-bold text-rose-400 truncate block mt-1">{incident.action_taken}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-black">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp</span>
                  <span className="text-xs font-semibold text-slate-300 truncate block mt-1">
                    {new Date(incident.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Target URL */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-black">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Intercepted URL</span>
                <span className="text-xs font-mono text-amber-300 break-all">{incident.url}</span>
              </div>

              {/* AI Threat Explanation */}
              {incident.ai_assessment && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini AI Safety Reasoning</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {incident.ai_assessment.risk_explanation || incident.ai_assessment.explanation}
                  </p>
                  {incident.ai_assessment.child_friendly_warning && (
                    <div className="p-3 bg-cyan-950/40 rounded-lg border border-cyan-800/40 text-xs text-cyan-200">
                      <strong>Child Communication:</strong> "{incident.ai_assessment.child_friendly_warning}"
                    </div>
                  )}
                </div>
              )}

              {/* Clean-Up Quarantine info if download */}
              {incident.download_metadata && (
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Clean-Up Download Quarantine Event</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div><strong>Filename:</strong> {incident.download_metadata.filename}</div>
                    <div><strong>Quarantine Status:</strong> Demo Quarantine (Sandbox Safe Isolation)</div>
                    <div><strong>System State:</strong> Threat was neutralized before disk execution.</div>
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                🛡️ <strong>Vigilo Privacy Standard:</strong> No child passwords, form inputs, or innocent browsing history are captured or stored in this evidence record.
              </div>
            </div>
          )}

          {activeTab === 'indicators' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                Multi-Signal Forensic Indicators ({incident.detected_indicators?.length || 0} detected)
              </span>
              {(!incident.detected_indicators || incident.detected_indicators.length === 0) ? (
                <p className="text-xs text-slate-400">No specific heuristic flags recorded.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {incident.detected_indicators.map((ind, i) => (
                    <div key={i} className="flex items-start space-x-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                      <span className="text-xs font-medium text-slate-200">{ind}</span>
                    </div>
                  ))}
                </div>
              )}

              {incident.ml_result && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-cyan-400 block mb-2">Machine Learning Classifier Output:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <div>Model: <strong className="text-white">Scikit-Learn Random Forest</strong></div>
                    <div>Model Risk: <strong className="text-rose-400">{incident.ml_result.risk_score}/100</strong></div>
                    <div>Confidence: <strong className="text-white">{incident.ml_result.confidence}%</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence_json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Forensic Schema: VigiloEvidencePack.v1.json</span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
                {JSON.stringify(incident, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-between items-center print:hidden">
          <span className="text-[11px] text-slate-400">Parent Notified: Instant Mobile Alert Dispatched</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Forensics
          </button>
        </div>
      </div>
    </div>
  );
}
