import React, { useState } from 'react';
import { X, FileText, Download, ShieldAlert, CheckCircle, Brain, Terminal, ExternalLink } from 'lucide-react';
import { api } from '../api';

export default function IncidentModal({ incident, onClose }) {
  const [viewTab, setViewTab] = useState('summary'); // 'summary' | 'json'

  if (!incident) return null;

  const pdfUrl = api.getReportUrl(incident.id, 'pdf');
  const htmlUrl = api.getReportUrl(incident.id, 'html');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              incident.risk_score >= 80 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-400">{incident.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  incident.risk_score >= 80 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  Score: {incident.risk_score}/100
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">{incident.threat_type}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setViewTab('summary')}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition ${
              viewTab === 'summary' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Forensic Summary & AI Assessment
          </button>
          <button
            onClick={() => setViewTab('json')}
            className={`py-3 text-xs font-semibold border-b-2 transition ${
              viewTab === 'json' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured Evidence JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {viewTab === 'summary' ? (
            <>
              {/* Target Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs uppercase text-slate-400 font-bold mb-1">Target Origin</div>
                <div className="font-mono text-slate-200 break-all text-xs">{incident.url}</div>
                <div className="text-xs text-slate-500 mt-1">Domain: {incident.domain} • Action Taken: <span className="text-cyan-400 font-semibold">{incident.action_taken}</span></div>
              </div>

              {/* Download Details if present */}
              {incident.download_metadata && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                  <div className="text-xs uppercase text-amber-400 font-bold mb-1">Clean-Up / Quarantined Download</div>
                  <div className="text-sm font-semibold text-amber-200">
                    File: {incident.download_metadata.filename}
                  </div>
                  <div className="text-xs text-amber-300/80 mt-0.5">
                    Quarantine Status: <span className="font-bold">DEMO_QUARANTINED</span> (Browser isolation demonstration)
                  </div>
                </div>
              )}

              {/* Forensic Indicators */}
              <div>
                <div className="text-xs uppercase text-slate-400 font-bold mb-2">Detected Security Indicators</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(incident.detected_indicators || []).map((ind, i) => (
                    <div key={i} className="flex items-center space-x-2 bg-slate-800/60 px-3 py-2 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                      <span className="text-rose-400">•</span>
                      <span>{ind}</span>
                    </div>
                  ))}
                  {(!incident.detected_indicators || incident.detected_indicators.length === 0) && (
                    <div className="text-xs text-slate-500">No anomalous indicators logged.</div>
                  )}
                </div>
              </div>

              {/* AI Dual Assessment */}
              <div className="space-y-3">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs mb-1">
                    <Brain className="w-4 h-4" />
                    <span>Child-Friendly Explanation:</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "{incident.ai_assessment?.child_explanation || 'Deceptive threat pattern intercepted by Vigilo.'}"
                  </p>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs mb-1">
                    <Terminal className="w-4 h-4" />
                    <span>Parent Technical Forensics:</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {incident.ai_assessment?.parent_technical_summary || 'Multi-signal heuristics and scikit-learn classifier identified deceptive credential harvesting pattern.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* JSON View */
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(incident, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer with PDF Downloader */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Confidential Evidence Record • Privacy Guaranteed
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview HTML</span>
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
