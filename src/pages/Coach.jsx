import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Star, ArrowRight, Trophy, Shield, Filter } from 'lucide-react';
import { fetchCoachLessons, submitCoachAnswer, generateAICoachChallenge, fetchCoachProgress } from '../api';

const CATEGORIES = [
  { id: 'all', label: '🌟 All Challenges' },
  { id: 'gaming_scams', label: '🎮 Gaming Scams' },
  { id: 'phishing', label: '🔗 Phishing Traps' },
  { id: 'malicious_downloads', label: '⬇ Dangerous Downloads' },
];

export default function Coach() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    completed_challenges: 3,
    accuracy_percentage: 100,
    safety_badges: [
      { name: 'Scam Detector', unlocked: true },
      { name: 'Password Guardian', unlocked: true },
      { name: 'Download Sentinel', unlocked: false }
    ]
  });

  const DEFAULT_LESSONS = [
    {
      id: 'LESSON-1',
      threat_category: 'gaming_scams',
      title: 'Free 10,000 Robux Trap',
      scenario_description: 'You see a video pop-up saying: "Enter your username and password to get free 10,000 Robux instantly!"',
      question: 'Is this offer real or a trap?',
      options: [
        'It is real! I should give my password.',
        'It is a scam trap! Real games never ask for passwords for free currency.',
        'I should give my email address instead.'
      ],
      correct_answer: 'It is a scam trap! Real games never ask for passwords for free currency.',
      explanation: 'No legitimate game developer or site will ever ask for your password or credentials in exchange for free in-game money.'
    },
    {
      id: 'LESSON-2',
      threat_category: 'phishing',
      title: 'Suspicious Email Security Alert',
      scenario_description: 'An email says "Your Steam account will be deleted in 1 hour unless you click this link to verify your password!"',
      question: 'What should you do?',
      options: [
        'Click the link immediately.',
        'Ignore the link and check with an adult or open the official app directly.',
        'Forward it to all your friends.'
      ],
      correct_answer: 'Ignore the link and check with an adult or open the official app directly.',
      explanation: 'Urgency tactics ("deleted in 1 hour") are classic phishing red flags designed to make you panic and click fake links.'
    },
    {
      id: 'LESSON-3',
      threat_category: 'malicious_downloads',
      title: 'Free Game Mod Installer (.exe)',
      scenario_description: 'A popup on an unofficial site says: "Download Free-Minecraft-GodMod.exe now to unlock all skins!"',
      question: 'Is it safe to download this .exe file?',
      options: [
        'Yes, it promises free skins so it must be good.',
        'No! Executable .exe files from unverified websites can contain malware.',
        'Yes, as long as I close the browser after.'
      ],
      correct_answer: 'No! Executable .exe files from unverified websites can contain malware.',
      explanation: 'Downloading executable files (.exe, .scr) from unknown websites is the #1 way devices get infected with viruses or keyloggers.'
    }
  ];

  const loadData = async (cat = selectedCategory) => {
    try {
      const categoryParam = cat === 'all' ? null : cat;
      const [lessonsData, progressData] = await Promise.all([
        fetchCoachLessons(categoryParam).catch(() => null),
        fetchCoachProgress().catch(() => null)
      ]);
      setLessons(lessonsData && lessonsData.length > 0 ? lessonsData : DEFAULT_LESSONS);
      setActiveLessonIndex(0);
      setFeedback(null);
      setSelectedOption(null);
      if (progressData) setProgress(progressData);
    } catch (err) {
      console.error("Failed to load coach data:", err);
      setLessons(DEFAULT_LESSONS);
    }
  };

  useEffect(() => {
    loadData(selectedCategory);
  }, [selectedCategory]);

  const activeLesson = lessons[activeLessonIndex];

  const handleSubmit = async () => {
    if (!selectedOption || !activeLesson) return;

    try {
      setIsSubmitting(true);
      const res = await submitCoachAnswer(activeLesson.id, selectedOption);
      setFeedback(res);
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
      const targetCat = selectedCategory === 'all' ? 'gaming_scams' : selectedCategory;
      const newChallenge = await generateAICoachChallenge(targetCat);
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

  const options = activeLesson?.options
    ? (typeof activeLesson.options === 'string' ? JSON.parse(activeLesson.options) : activeLesson.options)
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
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
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating AI Challenge...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Generate AI Challenge (Gemini)</span>
            </>
          )}
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="glass-panel p-2.5 rounded-2xl flex flex-wrap gap-2 border-slate-800">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === c.id
                ? 'bg-cyan-500 text-cyber-dark shadow-neon-cyan'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Badges & Progress Row */}
      {progress && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Safety Badges Earned:</span>
              <div className="flex flex-wrap gap-1.5">
                {progress.safety_badges?.map((b, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
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
        <div className="glass-panel border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Question Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {(activeLesson.threat_category || 'General').replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">Challenge {activeLessonIndex + 1} of {lessons.length}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-2">{activeLesson.title}</h2>
            </div>

            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-center">
              {activeLesson.id}
            </span>
          </div>

          {/* Scenario Description */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-cyan-400 block">📖 The Scenario:</span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {activeLesson.scenario_description || activeLesson.scenario}
            </p>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white">
              ❓ {activeLesson.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    disabled={Boolean(feedback)}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-neon-cyan'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-cyan-500 text-cyber-dark' : 'bg-slate-800 text-slate-400'
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
            <div className={`p-5 rounded-xl border space-y-2 animate-fadeIn ${
              feedback.is_correct
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {feedback.is_correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
                <span>{feedback.child_feedback}</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-200 mt-1">
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
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-cyber-dark font-bold text-xs sm:text-sm rounded-xl shadow-neon-cyan transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Submit Answer'}
              </button>
            ) : (
              <button
                onClick={handleNextLesson}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
          <span>Loading challenges for {selectedCategory}...</span>
        </div>
      )}
    </div>
  );
}
