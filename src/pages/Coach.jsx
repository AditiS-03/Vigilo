import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Star, ArrowRight, Trophy } from 'lucide-react';
import { fetchCoachLessons, submitCoachAnswer, generateAICoachChallenge, fetchCoachProgress } from '../api';

export default function Coach() {
  const [lessons, setLessons] = useState([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null);

  const loadData = async () => {
    try {
      const [lessonsData, progressData] = await Promise.all([
        fetchCoachLessons(),
        fetchCoachProgress()
      ]);
      setLessons(lessonsData);
      setProgress(progressData);
    } catch (err) {
      console.error("Failed to load coach data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeLesson = lessons[activeLessonIndex];

  const handleSubmit = async () => {
    if (!selectedOption || !activeLesson) return;

    try {
      setIsSubmitting(true);
      const res = await submitCoachAnswer(activeLesson.id, selectedOption);
      setFeedback(res);
      // Reload progress
      const p = await fetchCoachProgress();
      setProgress(p);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextLesson = () => {
    setFeedback(null);
    setSelectedOption(null);
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else {
      setActiveLessonIndex(0);
    }
  };

  const handleGenerateAIChallenge = async () => {
    try {
      setIsGenerating(true);
      const newChallenge = await generateAICoachChallenge('gaming_scams');
      setLessons([newChallenge, ...lessons]);
      setActiveLessonIndex(0);
      setFeedback(null);
      setSelectedOption(null);
    } catch (err) {
      console.error("Failed to generate AI challenge:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const options = activeLesson?.options ? (typeof activeLesson.options === 'string' ? JSON.parse(activeLesson.options) : activeLesson.options) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Vigilo Coach: Child Cybersecurity Mastery</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "Don't just block danger. Detect it, explain it, respond to it, and teach children to recognize it."
          </p>
        </div>

        <button
          id="btn-generate-ai-lesson"
          disabled={isGenerating}
          onClick={handleGenerateAIChallenge}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating AI Challenge...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Challenge (Gemini)</span>
            </>
          )}
        </button>
      </div>

      {/* Badges & Progress Row */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Quizzes</span>
              <strong className="text-lg font-black text-white block">{progress.completed_challenges || 0} Challenges</strong>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Detection Accuracy</span>
              <strong className="text-lg font-black text-white block">{progress.accuracy_percentage || 100}%</strong>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Safety Badges Earned:</span>
              <div className="flex flex-wrap gap-1.5">
                {progress.safety_badges?.map((b, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      b.unlocked
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {b.unlocked ? '🏅 ' : '🔒 '}{b.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Challenge Card */}
      {activeLesson ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Question Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeLesson.threat_category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">Challenge {activeLessonIndex + 1} of {lessons.length}</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{activeLesson.title}</h2>
            </div>

            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {activeLesson.id}
            </span>
          </div>

          {/* Scenario Description */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-cyan-400 block mb-1">📖 The Scenario:</span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {activeLesson.scenario_description || activeLesson.scenario}
            </p>
          </div>

          {/* Question */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">
              ❓ {activeLesson.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    disabled={Boolean(feedback)}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Explanation Box */}
          {feedback && (
            <div className={`p-4 rounded-xl border space-y-2 animate-fadeIn ${
              feedback.is_correct
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {feedback.is_correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
                <span>{feedback.child_feedback}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 mt-1">
                <strong>Why this is important:</strong> {feedback.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-400">
              {feedback ? `Awarded: ${feedback.score} XP Points` : 'Choose an answer to earn your safety badge'}
            </span>

            {!feedback ? (
              <button
                id="btn-submit-coach-answer"
                disabled={!selectedOption || isSubmitting}
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Submit Answer'}
              </button>
            ) : (
              <button
                onClick={handleNextLesson}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
          <span>Loading lessons...</span>
        </div>
      )}
    </div>
  );
}
