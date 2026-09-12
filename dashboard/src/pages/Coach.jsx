import React, { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2, Sparkles, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function Coach() {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [lData, pData] = await Promise.all([
        api.getCoachLessons(),
        api.getCoachProgress(),
      ]);
      setLessons(lData);
      setProgress(pData);
      if (lData.length > 0 && !activeLesson) {
        setActiveLesson(lData[0]);
      }
    } catch (err) {
      console.error("Failed to load coach data:", err);
    }
  }

  async function handleAnswerSubmit() {
    if (!selectedOption || !activeLesson) return;
    try {
      const res = await api.answerCoachChallenge(activeLesson.id, selectedOption);
      setFeedback(res);
      // Reload progress
      const p = await api.getCoachProgress();
      setProgress(p);
    } catch (err) {
      console.error("Answer submission failed:", err);
    }
  }

  async function handleGenerateNewChallenge() {
    setGenerating(true);
    setFeedback(null);
    setSelectedOption('');
    try {
      const newLesson = await api.generateCoachChallenge("gaming_scams");
      setActiveLesson(newLesson);
      await loadData();
    } catch (err) {
      console.error("Challenge generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Badges Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase mb-1">
            <Award className="w-4 h-4" />
            <span>Section G: Vigilo Coach Education</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Personalized Child Cybersecurity Challenges
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn threats into learning moments. Short, engaging scenario quizzes generated from detected online risks.
          </p>
        </div>

        <button
          onClick={handleGenerateNewChallenge}
          disabled={generating}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition self-start"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? "Crafting Challenge..." : "Generate AI Challenge"}</span>
        </button>
      </div>

      {/* Progress & Mastery Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{progress?.completed_challenges || 0}</div>
            <div className="text-xs font-semibold text-slate-300">Challenges Solved</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{progress?.accuracy_percentage || 100}%</div>
            <div className="text-xs font-semibold text-slate-300">Detection Accuracy</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {(progress?.safety_badges || []).filter(b => b.unlocked).length} / 3
            </div>
            <div className="text-xs font-semibold text-slate-300">Safety Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Active Challenge Quiz Card */}
      {activeLesson && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-mono text-purple-400 uppercase bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              {activeLesson.threat_category?.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400">Lesson ID: {activeLesson.id}</span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-100 mb-2">
            {activeLesson.title}
          </h3>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300 mb-4 leading-relaxed">
            <strong>Scenario:</strong> {activeLesson.scenario_description || activeLesson.scenario}
          </div>

          <div className="text-sm font-bold text-cyan-300 mb-3">
            ❓ {activeLesson.question}
          </div>

          {/* Options */}
          <div className="space-y-2 mb-5">
            {(activeLesson.options || []).map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedOption === opt
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="coach-option"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={() => {
                    setSelectedOption(opt);
                    setFeedback(null);
                  }}
                  className="text-purple-500 focus:ring-purple-400"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          {/* Submit Action */}
          {!feedback ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedOption}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedOption
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Submit Answer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            /* Immediate Feedback Box */
            <div className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
              feedback.is_correct
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {feedback.is_correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                <span>{feedback.child_feedback}</span>
              </div>
              <p className="text-slate-300">
                <strong>Why:</strong> {feedback.explanation}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setFeedback(null);
                    setSelectedOption('');
                    handleGenerateNewChallenge();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
                >
                  Next Safety Challenge →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Safety Badges Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h4 className="text-sm font-bold text-slate-200 mb-3">Earned Child Cyber-Safety Badges</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(progress?.safety_badges || []).map((badge, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs flex items-center space-x-3 ${
                badge.unlocked
                  ? 'bg-purple-950/20 border-purple-500/30 text-slate-200'
                  : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className={`p-2 rounded-lg ${badge.unlocked ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-600'}`}>
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">{badge.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
