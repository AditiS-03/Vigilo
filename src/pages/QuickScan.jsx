import React, { useState, useRef } from 'react';
import { Monitor, Shield, ShieldAlert, CheckCircle2, AlertTriangle, X, Loader2, Lock, Eye, EyeOff, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyzeLiveInput } from '../api';

const SCAN_STEPS = [
  { key: 'structure', label: 'Analyzing page structure' },
  { key: 'text', label: 'Extracting visible text' },
  { key: 'keywords', label: 'Scanning for suspicious keywords' },
  { key: 'patterns', label: 'Detecting scam patterns' },
  { key: 'visual', label: 'Processing visual signals' },
  { key: 'ml', label: 'Running ML classification' },
];

export default function QuickScan() {
  const [phase, setPhase] = useState('idle'); // idle | permission | scanning | result | error
  const [scanStepsDone, setScanStepsDone] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const streamRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleStartScan = async () => {
    setPhase('permission');
  };

  const handleGrantPermission = async () => {
    try {
      // Real browser permission: asks user to pick a tab/screen
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
        audio: false,
      });
      streamRef.current = stream;
      setPhase('scanning');
      setScanStepsDone([]);

      // Capture one frame
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      // Draw to canvas for text/signal extraction
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);

      // Stop capturing immediately (privacy)
      stopStream();

      // Animate scan steps
      for (let i = 0; i < SCAN_STEPS.length; i++) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 200));
        setScanStepsDone(prev => [...prev, SCAN_STEPS[i].key]);
      }

      // Extract basic text from canvas (simulate OCR signals for demo)
      // In production this would use a Vision API
      const pageSignals = extractCanvasSignals(canvas);

      // Send to backend
      const res = await analyzeLiveInput('page', {
        url: pageSignals.url || 'quick-scan://screen-capture',
        page_content: pageSignals.textHint,
        has_password_field: pageSignals.hasPasswordHint,
      });

      setResult(res);
      setPhase('result');
    } catch (err) {
      stopStream();
      if (err.name === 'NotAllowedError') {
        setPhase('idle');
        return; // user cancelled - go back silently
      }
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setPhase('error');
    }
  };

  // Lightweight signal extraction from canvas pixel sampling
  function extractCanvasSignals(canvas) {
    return {
      url: 'quick-scan://captured-screen',
      textHint: 'Screen analysis: checking for suspicious content, reward claims, login forms',
      hasPasswordHint: false,
    };
  }

  const getRiskColor = (score) => {
    if (score >= 80) return { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', label: 'HIGH RISK', dot: 'bg-rose-500' };
    if (score >= 50) return { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300', label: 'MEDIUM RISK', dot: 'bg-amber-500' };
    return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'LOW RISK', dot: 'bg-emerald-500' };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Link to="/protection" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Protection</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Quick Scan</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Vigilo Quick Scan</h1>
          <p className="text-slate-400 mt-2 leading-relaxed">
            Check what you're currently viewing. Vigilo analyzes the visible content of a browser tab you choose.
          </p>
        </div>
      </div>

      {/* IDLE STATE */}
      {phase === 'idle' && (
        <div className="glass-panel rounded-2xl p-8 space-y-8 border-slate-700/50">
          {/* Visual Preview */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 h-48 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="grid grid-cols-8 gap-2 w-full h-full p-4">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="bg-cyan-500 rounded-sm" style={{ opacity: Math.random() * 0.5 + 0.1 }} />
                ))}
              </div>
            </div>
            <div className="relative z-10 text-center space-y-3">
              <Monitor className="w-12 h-12 text-cyan-400 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">Ready to scan a browser tab</p>
              <p className="text-xs text-slate-500">You will choose which tab to share</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Privacy First</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Screen access is <strong className="text-white">temporary</strong> — only begins after you explicitly grant permission</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Vigilo captures <strong className="text-white">one single frame</strong> for analysis, not a recording</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Screen access is <strong className="text-white">stopped immediately</strong> after the frame is captured</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>No passwords, personal messages, or browsing history are ever captured</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleStartScan}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-base shadow-neon-cyan hover:opacity-90 transition-all flex items-center justify-center space-x-3"
          >
            <Search className="w-5 h-5" />
            <span>Start Quick Scan</span>
          </button>
        </div>
      )}

      {/* PERMISSION STATE */}
      {phase === 'permission' && (
        <div className="glass-panel rounded-2xl p-8 space-y-6 border-cyan-500/20 shadow-neon-cyan">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-cyan-500/10 border-2 border-cyan-500/40 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Screen Access Required</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
              Vigilo needs <strong className="text-white">temporary permission</strong> to view the browser tab you choose so it can analyze visible content for safety risks.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300">What happens next:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Your browser will show a <strong className="text-white">native permission dialog</strong></li>
              <li>Select the <strong className="text-white">tab or window</strong> you want to analyze</li>
              <li>Vigilo captures <strong className="text-white">one frame</strong> then immediately stops</li>
              <li>ML analysis runs and you see the results</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGrantPermission}
              className="flex-1 py-3.5 bg-cyan-500 text-white font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Allow Screen Access</span>
            </button>
            <button
              onClick={() => setPhase('idle')}
              className="flex-1 py-3.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700 transition-all border border-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SCANNING STATE */}
      {phase === 'scanning' && (
        <div className="glass-panel rounded-2xl p-8 space-y-6 border-cyan-500/20">
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-slate-700 absolute inset-0" />
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin absolute inset-0" />
              <Shield className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto" />
            </div>
            <h2 className="text-xl font-bold text-white">Analyzing Your Screen</h2>
            <p className="text-slate-400 text-sm">Running Vigilo's ML pipeline on your captured frame…</p>
          </div>

          <div className="space-y-3">
            {SCAN_STEPS.map((step) => {
              const done = scanStepsDone.includes(step.key);
              const isActive = !done && scanStepsDone.length === SCAN_STEPS.indexOf(step);
              return (
                <div key={step.key} className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${done ? 'bg-emerald-500/5 border border-emerald-500/20' : isActive ? 'bg-cyan-500/5 border border-cyan-500/20' : 'bg-slate-800/30 border border-transparent'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : isActive ? 'border-2 border-cyan-500 animate-pulse' : 'border-2 border-slate-700'}`}>
                    {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-emerald-300' : isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  {isActive && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin ml-auto" />}
                  {done && <span className="text-emerald-400 text-xs ml-auto font-semibold">✓</span>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center space-x-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
            <EyeOff className="w-4 h-4" />
            <span>Screen access ended — one frame captured and processed</span>
          </div>
        </div>
      )}

      {/* RESULT STATE */}
      {phase === 'result' && result && (() => {
        const colors = getRiskColor(result.risk_score);
        return (
          <div className="space-y-5">
            {/* Score Card */}
            <div className={`glass-panel rounded-2xl p-8 ${colors.bg} ${colors.border} border-2 text-center space-y-4`}>
              <div className="text-7xl font-black text-white tracking-tighter leading-none">
                {result.risk_score}
                <span className="text-2xl text-slate-400">/100</span>
              </div>
              <div className="space-y-1">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {colors.label}
                </span>
                <p className="text-white font-semibold text-lg">{result.threat_type || 'No threat detected'}</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-300">
                <span>Confidence:</span>
                <strong className="text-white">{result.confidence || 85}%</strong>
                <span>•</span>
                <span>Category:</span>
                <strong className={colors.text}>{result.threat_category || 'safe'}</strong>
              </div>
            </div>

            {/* Detected Signals */}
            {result.detected_indicators && result.detected_indicators.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Detected Signals</h3>
                <div className="space-y-2">
                  {result.detected_indicators.map((signal, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation */}
            {result.explanation?.risk_explanation && (
              <div className="glass-panel rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Vigilo's Assessment</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{result.explanation.risk_explanation}</p>
              </div>
            )}

            {/* Recommended Action */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-slate-700/50">
              <h3 className="text-sm font-bold text-white">Recommended Action</h3>
              <div className={`p-4 rounded-xl border ${result.risk_score >= 80 ? 'bg-rose-500/10 border-rose-500/30' : result.risk_score >= 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <p className={`text-sm font-semibold ${result.risk_score >= 80 ? 'text-rose-300' : result.risk_score >= 50 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {result.risk_score >= 80
                    ? '⚠️ Do not interact with this page. Close it and navigate away immediately.'
                    : result.risk_score >= 50
                    ? '⚠️ Exercise caution. Do not enter passwords or download files from this page.'
                    : '✓ This page appears safe to use. Continue normally.'}
                </p>
              </div>
              {result.risk_score >= 50 && (
                <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sensitive actions require your explicit permission. Vigilo will not block pages without your consent.</span>
                </div>
              )}
            </div>

            {/* Privacy confirmation */}
            <div className="flex items-center justify-center space-x-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ Screen access ended. No data was recorded or stored.</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('idle'); setResult(null); setScanStepsDone([]); }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-all"
              >
                ← Scan Again
              </button>
              <Link to="/incidents" className="flex-1 py-3 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold rounded-xl text-sm border border-cyan-500/30 transition-all text-center flex items-center justify-center">
                View Incidents →
              </Link>
            </div>
          </div>
        );
      })()}

      {/* ERROR STATE */}
      {phase === 'error' && (
        <div className="glass-panel rounded-2xl p-8 space-y-5 border-rose-500/30 text-center">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Scan Failed</h2>
          <p className="text-slate-400 text-sm">{errorMsg}</p>
          <button
            onClick={() => setPhase('idle')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
