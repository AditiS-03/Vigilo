import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, CheckCircle2, ChevronRight, Activity, Search, Cpu, FileText, Lock, Globe, AlertTriangle, Monitor } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-dark text-slate-100">
      {/* 00 - HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden min-h-[90vh]">
        <div className="absolute inset-0 bg-cyber-navy/80 bg-grid-pattern z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent z-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span>Next-Generation Child Online Safety</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight">
            Every click has a risk.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Vigilo sees it before it hurts.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered browser protection that helps children recognize and avoid scams, phishing, and dangerous online content.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
            <Link to="/quick-scan" className="group relative px-8 py-4 bg-cyan-500 text-cyber-dark font-bold rounded-xl overflow-hidden shadow-neon-cyan transition-all hover:scale-105 flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Try Quick Scan</span>
            </Link>
            
            <Link to="/extension" className="group px-8 py-4 bg-slate-800/80 text-white font-bold rounded-xl border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-glass backdrop-blur flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Get Browser Protection</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 01 - THE PROBLEM */}
      <section className="py-24 bg-cyber-dark relative z-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">01 — The Problem</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">The internet wasn't built for children.</h3>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Modern threats are highly deceptive and increasingly target young users through games and social media.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Gaming Scams', icon: Activity, desc: 'Fake free V-Bucks or Robux generators designed to steal credentials.' },
              { title: 'Deceptive Phishing', icon: ShieldAlert, desc: 'Fake login pages mimicking legitimate platforms to harvest passwords.' },
              { title: 'Dangerous Downloads', icon: Monitor, desc: 'Malware disguised as game mods, cheats, or screensavers.' }
            ].map((item) => (
              <div key={item.title} className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center space-y-4 transition-transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700">
                  <item.icon className="w-8 h-8 text-rose-400" />
                </div>
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 - HOW VIGILO WORKS */}
      <section className="py-24 relative bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">02 — How Vigilo Works</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">An intelligent safety loop.</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {[
              { label: 'DETECT', icon: Search, color: 'text-blue-400' },
              { label: 'ANALYZE', icon: Activity, color: 'text-violet-400' },
              { label: 'EXPLAIN', icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'WARN', icon: AlertTriangle, color: 'text-amber-400' },
              { label: 'RESPOND', icon: ShieldAlert, color: 'text-rose-400' },
              { label: 'ADAPT', icon: Cpu, color: 'text-cyan-400' }
            ].map((step, idx) => (
              <div key={step.label} className="group flex flex-col items-center relative p-4">
                <div className={`w-16 h-16 rounded-2xl glass-panel-glow flex items-center justify-center mb-4 ${step.color} transition-all duration-300 group-hover:scale-110`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-200 tracking-wider text-sm">{step.label}</h4>
                {idx < 5 && <ChevronRight className="hidden md:block absolute top-10 -right-4 w-5 h-5 text-slate-600" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 - REAL ML DETECTION */}
      <section className="py-24 bg-cyber-dark relative z-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">04 — Real ML Detection</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">Driven by actual machine learning.</h3>
            <p className="text-lg text-slate-400 leading-relaxed">
              Vigilo doesn't just guess. It extracts measurable features from every URL—length, entropy, HTTPS, domain structure—and runs them through a trained threat classification model.
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Real-time URL feature extraction</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Scikit-Learn/XGBoost classification</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Probabilistic risk scoring</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="glass-panel p-8 rounded-2xl border-cyan-500/20 shadow-neon-cyan relative">
              <div className="absolute -top-4 -right-4 bg-cyan-500 text-cyber-dark font-bold px-4 py-1 rounded-full text-sm">
                Live Inference
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Target URL</span>
                  <span className="text-rose-400 font-mono">free-minecraft-coins.xyz/claim</span>
                </div>
                <div className="h-px bg-slate-800 w-full"></div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-500">Special Chars</span>
                    <span className="text-white font-mono">High</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Domain Entropy</span>
                    <span className="text-white font-mono">0.84</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">HTTPS</span>
                    <span className="text-rose-400 font-mono">False</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Lure Words</span>
                    <span className="text-rose-400 font-mono">True</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex justify-between items-center">
                  <span className="text-rose-400 font-bold">Threat: Gaming Phishing</span>
                  <span className="text-2xl font-bold text-white">94/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08 - EVIDENCE PACK */}
      <section className="py-24 relative bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">08 — Evidence Pack</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Auditable Incident Reports.</h3>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">For every high-risk intervention, Vigilo automatically generates a professional, downloadable PDF detailing the threat metrics and AI explanation.</p>
          </div>
          
          <div className="inline-flex items-center space-x-3 px-6 py-4 glass-panel rounded-xl border-cyan-500/30">
            <FileText className="w-8 h-8 text-cyan-400" />
            <div className="text-left">
              <span className="block font-bold text-white">Vigilo-Incident-INC-0001.pdf</span>
              <span className="text-xs text-slate-400">Generated automatically via ReportLab</span>
            </div>
            <div className="pl-6 border-l border-slate-700 ml-4">
              <Link to="/incidents" className="text-cyan-400 hover:text-cyan-300 text-sm font-bold flex items-center">
                View Incidents <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11 - FINAL CTA */}
      <section className="py-32 bg-cyber-dark relative z-10 border-t border-slate-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-5xl font-extrabold text-white">Start protecting every click.</h2>
          <p className="text-xl text-slate-400 mb-10">Give your children the security they need to explore the digital world safely.</p>
          
          <Link to="/protection" className="inline-block px-10 py-5 bg-cyan-500 text-cyber-dark font-bold text-lg rounded-xl shadow-neon-cyan transition-all hover:scale-105">
            Enter Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
