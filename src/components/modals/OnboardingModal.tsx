'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { AVATAR_OPTIONS } from '@/lib/gameEngine';
import { BookOpen, Sparkles, Flame, Shield, Crown, Sun, Compass, HeartHandshake, ArrowRight, Check } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Sparkles,
  BookOpen,
  Flame,
  Crown,
  Shield,
  Sun,
  Compass,
  HeartHandshake,
};

export default function OnboardingModal() {
  const { profile, setOnboardingComplete } = useGame();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(profile.displayName || 'Seeker');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar || 'Sparkles');

  if (profile.hasCompletedOnboarding) return null;

  const handleFinish = () => {
    setOnboardingComplete(name, selectedAvatar);
  };

  const handleSkip = () => {
    setOnboardingComplete('Seeker', 'Sparkles');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#16233d] to-[#0d1424] rounded-2xl border-2 border-amber-500/40 shadow-2xl p-6 sm:p-8 text-center text-slate-100 overflow-hidden">
        {/* Quick Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-amber-300 py-1 px-2.5 rounded-lg bg-slate-900/80 border border-slate-700"
        >
          Skip ✕
        </button>

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: WELCOME & NAME */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-200">
              <BookOpen className="w-8 h-8 text-slate-950 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                WELCOME TO <span className="gold-gradient-text">WORD QUEST</span>
              </h2>
              <p className="text-sm text-amber-200/80 font-serif italic mt-1">
                “Your word is a lamp to my feet and a light for my path.” — Psalm 119:105
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-3">
                Embark on an epic journey through 10 Levels of Scripture, unlock achievements, climb leaderboards, and sharpen your knowledge of God’s Word!
              </p>
            </div>

            <div className="text-left space-y-2 max-w-xs mx-auto">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Choose Your Pilgrim Name
              </label>
              <input
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter display name..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:outline-none text-white font-bold text-sm shadow-inner"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full max-w-xs mx-auto py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2"
            >
              Choose Avatar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: CHOOSE AVATAR */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">Select Your Calling</h3>
              <p className="text-xs text-slate-300 mt-1">
                Choose an archetype avatar to represent your journey in Word Quest.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
              {AVATAR_OPTIONS.map((av) => {
                const IconComponent = ICON_MAP[av.icon] || Sparkles;
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${av.color} flex items-center justify-center shadow-md mb-2`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-white leading-tight">{av.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{av.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 max-w-xs mx-auto">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 px-6 rounded-xl font-extrabold text-xs uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2"
              >
                Quick Guide <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: QUICK GAME TUTORIAL */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">How Word Quest Works</h3>
              <p className="text-xs text-slate-300 mt-1">Master these 3 core mechanics to excel:</p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-orange-400 animate-flame" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-orange-300 uppercase tracking-wide">
                    1. Streaks & Combos
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Answer consecutive questions correctly to boost your combo multiplier up to <strong>3.0x score</strong>!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    2. Earn Wisdom Coins
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Earn coins from high scores and daily challenges to unlock 50/50 hints, extra time, and life shields.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                    3. Conquer 10 Journey Levels
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    From Genesis to Revelation, collect 3 stars on every stage to claim the final Word Master Crown.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Start Quest Now! ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
