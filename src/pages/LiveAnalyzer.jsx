import React, { useState } from 'react';
import { Cpu, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Play, RefreshCw, FileCode, Globe, Download, Lock } from 'lucide-react';
import { analyzeLiveInput } from '../api';

export default function LiveAnalyzer() {
  const [activeMode, setActiveMode] = useState('url'); // 'url' | 'page' | 'download'
  const [urlInput, setUrlInput] = useState('http://free-minecraft-coins-999.xyz/claim?user=steve');
  const [pageContentInput, setPageContentInput] = useState('CONGRATULATIONS! You won 10,000 Free Coins! Enter your username and password to claim immediately before time runs out!');
  const [hasPasswordInput, setHasPasswordInput] = useState(true);
  const [downloadFilenameInput, setDownloadFilenameInput] = useState('free-minecraft-coins.exe');
  const [downloadSourceUrlInput, setDownloadSourceUrlInput] = useState('http://free-game-rewards.xyz/download');

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleRunAnalysis = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      let payload = {};
      if (activeMode === 'url') {
        payload = { url: urlInput };
      } else if (activeMode === 'page') {
        payload = {
          url: urlInput || 'http://roblox-verification.xyz/login',
          page_content: pageContentInput,
          has_password_field: hasPasswordInput
        };
      } else if (activeMode === 'download') {
        payload = {
          filename: downloadFilenameInput,
          source_url: downloadSourceUrlInput,
          file_size: 2457600
        };
      }

      const res = await analyzeLiveInput(activeMode, payload);
      setAnalysisResult(res);
    } catch (err) {
      console.error("Live analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePresets = [
    { label: 'Gaming Scam (.xyz)', mode: 'url', val: 'http://free-minecraft-coins-999.xyz/claim?user=steve' },
    { label: 'Safe Edu Site', mode: 'url', val: 'https://kids.nationalgeographic.com/animals' },
    { label: 'Roblox Phishing Page', mode: 'page', val: 'http://roblox-security-center.xyz/login.html' },
    { label: 'Executable Download', mode: 'download', val: 'free-minecraft-coins.exe' }
  ];

  const handleApplyPreset = (preset) => {
    setActiveMode(preset.mode);
    if (preset.mode === 'url') {
      setUrlInput(preset.val);
    } else if (preset.mode === 'page') {
      setUrlInput(preset.val);
      setPageContentInput('URGENT SECURITY ALERT: Your account will be permanently deleted unless verified right now. Enter your login password.');
      setHasPasswordInput(true);
    } else if (preset.mode === 'download') {
      setDownloadFilenameInput(preset.val);
      setDownloadSourceUrlInput('http://free-game-rewards.xyz/download');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Interactive Threat Detection & Risk Scoring Sandbox</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Test any URL, webpage content, or file download against Vigilo's multi-signal detection pipeline (Lexical Heuristics, ML Classifier, Gemini AI, and Guardrailed Action Agent).
        </p>
      </div>

      {/* Mode Selector & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex space-x-1">
          <button
            id="btn-mode-url"
            onClick={() => setActiveMode('url')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'url' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>URL Inspector</span>
          </button>
          <button
            id="btn-mode-page"
            onClick={() => setActiveMode('page')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'page' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Page Phishing DOM</span>
          </button>
          <button
            id="btn-mode-download"
            onClick={() => setActiveMode('download')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'download' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>File Download Clean-Up</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-medium">Quick Presets:</span>
          {samplePresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold whitespace-nowrap transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleRunAnalysis} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {activeMode === 'url' && (
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Web Address (URL):</label>
            <input
              type="text"
              id="input-analyzer-url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. http://free-minecraft-coins-999.xyz/claim"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        )}

        {activeMode === 'page' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Page URL:</label>
              <input
                type="text"
                id="input-analyzer-page-url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://roblox-verification.xyz/login"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Page Content / Text / Form Elements:</label>
              <textarea
                id="textarea-analyzer-page-content"
                rows={3}
                value={pageContentInput}
                onChange={(e) => setPageContentInput(e.target.value)}
                placeholder="Paste visible text or deceptive trap message..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasPasswordInput}
                onChange={(e) => setHasPasswordInput(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Page contains a password or sensitive credential input field</span>
              </span>
            </label>
          </div>
        )}

        {activeMode === 'download' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Download Filename:</label>
              <input
                type="text"
                id="input-analyzer-download-filename"
                value={downloadFilenameInput}
                onChange={(e) => setDownloadFilenameInput(e.target.value)}
                placeholder="e.g. free-minecraft-coins.exe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Origin Web Server URL:</label>
              <input
                type="text"
                id="input-analyzer-download-source"
                value={downloadSourceUrlInput}
                onChange={(e) => setDownloadSourceUrlInput(e.target.value)}
                placeholder="http://free-game-rewards.xyz/download"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            Engine: Scikit-Learn Model + Heuristics + Gemini 3.8 Flash + Response Policy
          </span>
          <button
            type="submit"
            id="btn-run-analyzer"
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Multi-Signal Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Real-Time Detection</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border ${
                analysisResult.risk_score >= 80 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                analysisResult.risk_score >= 40 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {analysisResult.risk_score}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">
                    {analysisResult.threat_type || (analysisResult.risk_score >= 80 ? 'High Risk Threat' : 'Safe Resource')}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    analysisResult.risk_score >= 80 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    analysisResult.risk_score >= 40 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {analysisResult.severity || (analysisResult.risk_score >= 80 ? 'DANGEROUS' : 'SAFE')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: <strong className="text-cyan-400">{analysisResult.threat_category || 'general'}</strong> • Confidence: <strong className="text-white">{analysisResult.confidence || 95}%</strong>
                </p>
              </div>
            </div>

            {analysisResult.incident_id && (
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {analysisResult.incident_id}
              </span>
            )}
          </div>

          {/* Signals Detected Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">Detected Security Signals & Indicators:</h4>
            {(!analysisResult.detected_indicators || analysisResult.detected_indicators.length === 0) ? (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No malicious indicators or scam signatures identified. Domain appears legitimate.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysisResult.detected_indicators.map((ind, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Agent Action Decisions */}
          {(analysisResult.response_actions || analysisResult.action_taken) && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Response Agent Enforced Actions:</h4>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.response_actions || [analysisResult.action_taken]).map((action, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gemini AI Reasoning */}
          {analysisResult.explanation && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>Vigilo AI Threat Explanation:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {analysisResult.explanation.risk_explanation || analysisResult.explanation.explanation}
              </p>
              {analysisResult.explanation.child_friendly_warning && (
                <div className="p-2.5 bg-cyan-950/40 rounded-lg border border-cyan-800/40 text-xs text-cyan-200">
                  <strong>Child Safe Explanation:</strong> "{analysisResult.explanation.child_friendly_warning}"
                </div>
              )}
            </div>
          )}

          {/* Safe Alternatives Recommendation */}
          {analysisResult.safe_alternatives && analysisResult.safe_alternatives.length > 0 && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Vigilo Safe Alternatives Surfaced (Instead of Sterile Block Page):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {analysisResult.safe_alternatives.map((alt, i) => (
                  <div key={i} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-white block">{alt.name}</strong>
                      <span className="text-[11px] text-slate-400">{alt.description}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-2">
                      VETTED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
