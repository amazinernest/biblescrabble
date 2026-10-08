'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { LEVELS_CONFIG } from '@/lib/levelDefinitions';
import { MASTER_RELICS } from '@/lib/relics';
import { GameMode } from '@/types/game';
import {
  Sparkles,
  Flame,
  Crown,
  Play,
  Calendar,
  Compass,
  Trophy,
  ShoppingBag,
  HelpCircle,
  CheckCircle,
  Scroll,
  BookOpen,
  Clock,
  Layers,
  ArrowRight,
  Star,
  Users,
  Check,
  Zap,
  Gift,
  Shield,
  Target,
  Music,
} from 'lucide-react';

interface HomeOverhaulProps {
  onNavigate: (view: string) => void;
  onStartMode: (mode: GameMode) => void;
  onOpenWheel: () => void;
  onOpenMiniGame: (gameId: 'slingshot' | 'redsea' | 'jericho' | 'wordle') => void;
}

export default function HomeOverhaul({
  onNavigate,
  onStartMode,
  onOpenWheel,
  onOpenMiniGame,
}: HomeOverhaulProps) {
  const {
    profile,
    startDailyChallenge,
    startStageRound,
    dailyChallenge,
  } = useGame();

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = profile.stats.lastSpinDate === todayStr;
  const isDailyCompletedToday = profile.completedDailyDates.includes(todayStr);
  const equippedRelic = MASTER_RELICS.find((r) => r.id === profile.equippedRelicId);

  // Latest unlocked stage
  const latestStageId = profile.unlockedStages[profile.unlockedStages.length - 1] || '1-1';
  const [lastLvlStr, lastStgStr] = latestStageId.split('-');
  const lastLvlNum = parseInt(lastLvlStr, 10);
  const lastStgNum = parseInt(lastStgStr, 10);
  const activeLevelDef = LEVELS_CONFIG.find((l) => l.levelNumber === lastLvlNum) || LEVELS_CONFIG[0];
  const activeStageDef = activeLevelDef.stages.find((s) => s.stageNumber === lastStgNum) || activeLevelDef.stages[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-8 animate-fade-in text-slate-100">
      {/* 1. HERO KINGDOM RUSH / DUOLINGO SHOWCASE */}
      <div className="game-panel rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden border-2 border-amber-500/50 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            The Ultimate Bible Adventure
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight">
            WORD <span className="gold-gradient-text">QUEST</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed">
            Journey through 10 Historical Epochs, master tactile mini-games, conquer biblical boss duels, and rise through weekly competitive leagues!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('map')}
              className="py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-2xl shadow-amber-500/30 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              PLAY ODYSSEY MAP
            </button>
            <button
              onClick={() => onOpenMiniGame('wordle')}
              className="py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 transition flex items-center gap-2 shadow-xl"
            >
              <span className="text-sm">🔤</span>
              Scripture Scrabble
            </button>
            <button
              onClick={() => onNavigate('leagues')}
              className="py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2 shadow-lg"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leagues
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR TACTILE CASUAL MINI-GAMES GRID */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Tactile Mini-Game Arenas</h3>
            <p className="text-xs text-slate-400">Addictive casual mechanics inspired by biblical events.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* David's Slingshot Strike */}
          <div
            onClick={() => onOpenMiniGame('slingshot')}
            className="p-5 rounded-2xl border border-purple-500/50 bg-gradient-to-br from-purple-950/60 to-[#131326] hover:border-purple-400 transition cursor-pointer shadow-lg group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎯
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Physics Aim
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-white">David’s Slingshot</h4>
              <p className="text-xs text-slate-300 mt-1">Aim & strike Goliath’s target rings with smooth stones.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-purple-300">
              <span>Play Mini-Game</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Red Sea Wave Parting */}
          <div
            onClick={() => onOpenMiniGame('redsea')}
            className="p-5 rounded-2xl border border-cyan-500/50 bg-gradient-to-br from-cyan-950/60 to-[#0e2133] hover:border-cyan-400 transition cursor-pointer shadow-lg group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🌊
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Swipe Puzzle
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Red Sea Parting</h4>
              <p className="text-xs text-slate-300 mt-1">Swipe the Pillar of Fire path to open the dry seabed.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-cyan-300">
              <span>Play Mini-Game</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Jericho Trumpet Blast */}
          <div
            onClick={() => onOpenMiniGame('jericho')}
            className="p-5 rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-950/60 to-[#26190e] hover:border-amber-400 transition cursor-pointer shadow-lg group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎺
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Rhythm Tap
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Jericho Blast</h4>
              <p className="text-xs text-slate-300 mt-1">Blast the Shofars on beat to crumble the fortress walls.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-amber-300">
              <span>Play Mini-Game</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scripture Scrabble */}
          <div
            onClick={() => onOpenMiniGame('wordle')}
            className="p-5 rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-950/60 to-[#0e261b] hover:border-emerald-400 transition cursor-pointer shadow-lg group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🔤
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Scrabble Mode
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Scripture Scrabble</h4>
              <p className="text-xs text-slate-300 mt-1">Form biblical words with Scrabble tiles & multipliers.</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-emerald-300">
              <span>Play Mini-Game</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAILY CHALLENGE & STREAK SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DAILY CHALLENGE CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#141e35] to-[#0f172a] border border-amber-500/40 shadow-xl text-left flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Daily Challenge
              </span>
              <span className="text-xs font-mono text-slate-400">{dailyChallenge.date}</span>
            </div>

            <h3 className="text-lg font-black text-white">{dailyChallenge.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dailyChallenge.description}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-amber-400">+{dailyChallenge.xpReward} XP</span>
              <span className="text-yellow-300">🪙 +{dailyChallenge.coinReward}</span>
            </div>

            <button
              onClick={startDailyChallenge}
              className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-md flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              {isDailyCompletedToday ? 'Play Daily Again' : 'Enter Today’s Trial'}
            </button>
          </div>
        </div>

        {/* 7-DAY LOGIN STREAK REWARDS */}
        <div className="p-6 rounded-3xl bg-[#121c32] border border-slate-800 text-left flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400 animate-flame" />
                7-Day Pilgrimage Streak
              </h3>
              <span className="text-xs font-bold text-orange-300">
                Day {profile.stats.dailyStreak} of 7
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Return daily to keep your pilgrimage fire burning and collect growing coin bounties.
            </p>
          </div>

          {/* 7-DAY PILLS */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const isClaimed = dayNum <= profile.stats.dailyStreak;
              const isToday = dayNum === profile.stats.dailyStreak;

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isToday
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-amber-300'
                      : isClaimed
                      ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[9px] font-bold block leading-none">D{dayNum}</span>
                  <div className="my-1 flex justify-center">
                    {isClaimed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Flame className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[8px] font-mono block">+{dayNum * 25}🪙</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. PLAYABLE SCRIPTURE GAME MODES GRID */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Scripture Battle Arenas</h3>
            <p className="text-xs text-slate-400">Choose a game mode to train specific biblical mastery skills.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            {
              id: 'blitz' as GameMode,
              title: 'Bible Blitz',
              tagline: 'Fast-paced, high-speed Scripture trivia.',
              icon: Sparkles,
              color: 'from-amber-500 to-yellow-400',
              badge: 'Popular',
            },
            {
              id: 'who_am_i' as GameMode,
              title: 'Who Am I?',
              tagline: 'Deduce the character from progressive clues.',
              icon: HelpCircle,
              color: 'from-blue-500 to-indigo-600',
              badge: 'Mystery',
            },
            {
              id: 'bible_or_not' as GameMode,
              title: 'Bible or Not?',
              tagline: 'Is it real Scripture, or a cultural myth?',
              icon: CheckCircle,
              color: 'from-emerald-500 to-teal-600',
              badge: 'Fact-Check',
            },
            {
              id: 'verse_match' as GameMode,
              title: 'Complete the Verse',
              tagline: 'Fill the blank in foundational verses.',
              icon: Scroll,
              color: 'from-orange-500 to-red-600',
              badge: 'Memory',
            },
            {
              id: 'who_said_it' as GameMode,
              title: 'Who Said It?',
              tagline: 'Identify who spoke famous biblical quotes.',
              icon: BookOpen,
              color: 'from-purple-500 to-indigo-700',
              badge: 'Quotes',
            },
            {
              id: 'timeline' as GameMode,
              title: 'Bible Timeline',
              tagline: 'Reorder major biblical events in history.',
              icon: Clock,
              color: 'from-cyan-500 to-blue-600',
              badge: 'Chronology',
            },
            {
              id: 'sort' as GameMode,
              title: 'Bible Sort',
              tagline: 'Drag and sort characters & books into categories.',
              icon: Layers,
              color: 'from-pink-500 to-rose-600',
              badge: 'Interactive',
            },
          ].map((mode) => {
            const IconComp = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => onStartMode(mode.id)}
                className="p-5 rounded-2xl border border-slate-700/80 bg-[#131d33] hover:border-amber-400/60 hover:bg-[#182645] transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${mode.color} flex items-center justify-center shadow-md text-white group-hover:scale-110 transition-transform`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {mode.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white leading-tight">{mode.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">{mode.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-extrabold text-amber-400 group-hover:text-amber-300">
                  <span>Start Match</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. CONTINUE ODYSSEY BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#172646] to-[#121c32] border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Continue Kingdom Journey
            </span>
            {activeStageDef.isBossStage && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                Boss Battle
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Level {activeLevelDef.levelNumber}: {activeLevelDef.title}
          </h3>
          <p className="text-xs text-slate-300">
            Stage {activeStageDef.stageNumber}: {activeStageDef.title} ({activeStageDef.subtitle})
          </p>
        </div>

        <button
          onClick={() => startStageRound(activeLevelDef.levelNumber, activeStageDef.stageNumber, activeStageDef.isBossStage)}
          className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary flex items-center gap-2 shrink-0 z-10 shadow-lg"
        >
          <span>Continue Stage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. DAILY WHEEL & RELICS SANCTUARY ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wheel of Providence */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#141e35] to-[#0f172a] border border-amber-500/40 shadow-xl text-left flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                Daily Blessing
              </span>
              <span className="text-xs font-mono text-slate-400">{todayStr}</span>
            </div>

            <h3 className="text-lg font-black text-white">Wheel of Providence</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Spin the sacred fortune wheel daily to claim free Wisdom Coins, 50/50 powerup packs, and XP bounties!
            </p>
          </div>

          <button
            onClick={onOpenWheel}
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-md flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            {!hasSpunToday ? 'Claim Free Daily Spin!' : 'Wheel Spun Today (Re-opens Tomorrow)'}
          </button>
        </div>

        {/* Divine Relics Sanctuary */}
        <div className="p-6 rounded-3xl bg-[#121c32] border border-slate-800 text-left flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Relic Loadout
              </span>
            </div>

            <h3 className="text-lg font-black text-white">
              {equippedRelic ? equippedRelic.name : 'No Relic Equipped'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {equippedRelic ? equippedRelic.perkDescription : 'Visit the Sanctuary to equip biblical artifacts with passive battle perks!'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('relics')}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Manage Relic Armory
          </button>
        </div>
      </div>
    </div>
  );
}
