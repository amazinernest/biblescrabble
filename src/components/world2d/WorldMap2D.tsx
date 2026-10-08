'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { LEVELS_CONFIG } from '@/lib/levelDefinitions';
import { Level, Stage } from '@/types/game';
import { Sparkles, Star, Lock, Play, Shield, Gift, Trophy, ArrowRight, Check } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';

interface WorldMap2DProps {
  onSelectStage: (levelNum: number, stageNum: number, isBoss: boolean) => void;
  onOpenMiniGame: (gameId: 'slingshot' | 'redsea' | 'jericho' | 'wordle') => void;
}

const BIOME_THEMES = [
  { id: 1, name: 'Garden of Eden', bg: 'from-emerald-950 via-[#102a20] to-[#0a1812]', border: 'border-emerald-500/50', icon: '🌿' },
  { id: 2, name: 'Exodus & Red Sea', bg: 'from-cyan-950 via-[#0e2736] to-[#081620]', border: 'border-cyan-500/50', icon: '🌊' },
  { id: 3, name: 'Walls of Jericho', bg: 'from-amber-950 via-[#2e1d0f] to-[#1a0f08]', border: 'border-amber-500/50', icon: '🎺' },
  { id: 4, name: 'Solomon’s Golden Temple', bg: 'from-yellow-950 via-[#2c200c] to-[#171105]', border: 'border-yellow-500/50', icon: '🏛️' },
  { id: 5, name: 'Mount Carmel Altar', bg: 'from-red-950 via-[#2d1414] to-[#170808]', border: 'border-red-500/50', icon: '🔥' },
  { id: 6, name: 'Babylon & Lion’s Den', bg: 'from-purple-950 via-[#251233] to-[#12071a]', border: 'border-purple-500/50', icon: '🦁' },
  { id: 7, name: 'Sea of Galilee', bg: 'from-blue-950 via-[#0f2238] to-[#071321]', border: 'border-blue-500/50', icon: '⛵' },
  { id: 8, name: 'Acts & Paul’s Shipwreck', bg: 'from-teal-950 via-[#0d2a29] to-[#051717]', border: 'border-teal-500/50', icon: '⚓' },
  { id: 9, name: 'Armor of God', bg: 'from-indigo-950 via-[#191938] to-[#0b0b1c]', border: 'border-indigo-500/50', icon: '🛡️' },
  { id: 10, name: 'New Jerusalem Glory', bg: 'from-amber-900 via-[#3a2206] to-[#1e0f02]', border: 'border-amber-400', icon: '👑' },
];

export default function WorldMap2D({ onSelectStage, onOpenMiniGame }: WorldMap2DProps) {
  const { profile } = useGame();
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [selectedStage, setSelectedStage] = useState<{ level: Level; stage: Stage } | null>(null);

  const activeLevel = LEVELS_CONFIG.find((l) => l.levelNumber === selectedLevelNum) || LEVELS_CONFIG[0];
  const theme = BIOME_THEMES.find((t) => t.id === selectedLevelNum) || BIOME_THEMES[0];

  const handleStageClick = (level: Level, stage: Stage) => {
    const isUnlocked = profile.unlockedStages.includes(stage.id);
    if (!isUnlocked) {
      audioEngine.playWrong();
      return;
    }
    audioEngine.playWheelTick();
    setSelectedStage({ level, stage });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* 2.5D BIOME CAROUSEL / SELECTOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Kingdom Odyssey Map (10 Historical Epochs)
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            Level {selectedLevelNum} of 10
          </span>
        </div>

        {/* HORIZONTAL BIOME TABS */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {LEVELS_CONFIG.map((lvl) => {
            const isUnlocked = profile.unlockedLevels?.includes(lvl.levelNumber) ?? (lvl.levelNumber === 1);
            const isCurrent = lvl.levelNumber === selectedLevelNum;
            const t = BIOME_THEMES.find((bt) => bt.id === lvl.levelNumber) || BIOME_THEMES[0];

            return (
              <button
                key={lvl.levelNumber}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedLevelNum(lvl.levelNumber);
                    audioEngine.playWheelTick();
                  } else {
                    audioEngine.playWrong();
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl border transition-all shrink-0 flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-black border-yellow-200 shadow-xl scale-105'
                    : isUnlocked
                    ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 font-bold'
                    : 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <div className="text-left">
                  <span className="text-[9px] uppercase block leading-none">
                    Lvl {lvl.levelNumber}
                  </span>
                  <span className="text-xs whitespace-nowrap">{lvl.title}</span>
                </div>
                {!isUnlocked && <Lock className="w-3.5 h-3.5 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEATURED TACTILE MINI-GAME SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onOpenMiniGame('slingshot')}
          className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#1e1333] border border-purple-500/50 hover:border-purple-400 text-left transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg group-hover:scale-110 transition-transform">🎯</span>
            <span className="text-[9px] font-black uppercase bg-purple-900/60 px-2 py-0.5 rounded text-purple-300">Physics</span>
          </div>
          <h4 className="text-xs font-black text-white">David’s Slingshot</h4>
          <p className="text-[10px] text-slate-400">Aim & strike targets</p>
        </button>

        <button
          onClick={() => onOpenMiniGame('redsea')}
          className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-[#0e2738] border border-cyan-500/50 hover:border-cyan-400 text-left transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg group-hover:scale-110 transition-transform">🌊</span>
            <span className="text-[9px] font-black uppercase bg-cyan-900/60 px-2 py-0.5 rounded text-cyan-300">Swipe</span>
          </div>
          <h4 className="text-xs font-black text-white">Red Sea Parting</h4>
          <p className="text-[10px] text-slate-400">Guide Pillar of Fire</p>
        </button>

        <button
          onClick={() => onOpenMiniGame('jericho')}
          className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 to-[#2e1d0f] border border-amber-500/50 hover:border-amber-400 text-left transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg group-hover:scale-110 transition-transform">🎺</span>
            <span className="text-[9px] font-black uppercase bg-amber-900/60 px-2 py-0.5 rounded text-amber-300">Rhythm</span>
          </div>
          <h4 className="text-xs font-black text-white">Jericho Blast</h4>
          <p className="text-[10px] text-slate-400">Demolish the wall</p>
        </button>

        <button
          onClick={() => onOpenMiniGame('wordle')}
          className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-[#0e2a1e] border border-emerald-500/50 hover:border-emerald-400 text-left transition shadow-md group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg group-hover:scale-110 transition-transform">🔤</span>
            <span className="text-[9px] font-black uppercase bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">Scrabble</span>
          </div>
          <h4 className="text-xs font-black text-white">Scripture Scrabble</h4>
          <p className="text-[10px] text-slate-400">Build biblical words</p>
        </button>
      </div>

      {/* KINGDOM RUSH STYLE 2.5D LEVEL MAP CANVAS */}
      <div className={`p-6 sm:p-10 rounded-3xl bg-gradient-to-b ${theme.bg} border-2 ${theme.border} shadow-2xl relative overflow-hidden space-y-8`}>
        {/* Biome Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900/80 border border-amber-400/60 flex items-center justify-center text-2xl shadow-lg mb-1">
            {theme.icon}
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
            Epoch {activeLevel.levelNumber} • {activeLevel.era}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            {activeLevel.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {activeLevel.description}
          </p>
        </div>

        {/* STAGE PATH NODES (Winding Kingdom Rush Path) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {activeLevel.stages.map((stage, idx) => {
            const isUnlocked = profile.unlockedStages.includes(stage.id);
            const stars = profile.stageProgress?.[stage.id]?.stars || 0;
            const isBoss = stage.isBossStage;

            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(activeLevel, stage)}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-between text-center relative group ${
                  isUnlocked
                    ? isBoss
                      ? 'bg-gradient-to-b from-red-950 to-[#2a0e0e] border-red-500 shadow-xl hover:scale-105 ring-2 ring-red-500/40'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-amber-400/70 shadow-lg hover:scale-105'
                    : 'bg-slate-950/70 border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Node Number Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-md mb-2 ${
                    isUnlocked
                      ? isBoss
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? (isBoss ? '💀' : stage.stageNumber) : <Lock className="w-5 h-5" />}
                </div>

                <div className="space-y-0.5 mb-2">
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    {stage.title}
                  </h4>
                  <span className="text-[10px] text-amber-300/80 block uppercase">
                    {stage.subtitle}
                  </span>
                </div>

                {/* 3 Star Rating */}
                {isUnlocked && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-3.5 h-3.5 ${
                          starNum <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE DETAILS POPUP MODAL */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md game-panel rounded-3xl p-6 text-center space-y-5 border-2 border-amber-500/60 shadow-2xl text-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 px-2 py-0.5 rounded bg-slate-800 border border-amber-500/40">
                Stage {selectedStage.stage.stageNumber} • {selectedStage.stage.gameMode.replace('_', ' ').toUpperCase()}
              </span>
              <h3 className="text-2xl font-black text-white pt-1">
                {selectedStage.stage.title}
              </h3>
              <p className="text-xs text-slate-300">
                {selectedStage.stage.subtitle}
              </p>
            </div>

            {selectedStage.stage.isBossStage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-xs font-bold text-red-300 flex items-center justify-center gap-2">
                <span>💀 Epic Boss Encounter! Extra XP and Relic Drops.</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => {
                  const s = selectedStage;
                  setSelectedStage(null);
                  onSelectStage(s.level.levelNumber, s.stage.stageNumber, !!s.stage.isBossStage);
                }}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                ENTER STAGE
              </button>
              <button
                onClick={() => setSelectedStage(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
