'use client';

import React from 'react';
import {
  Sparkles,
  Trophy,
  Layers,
  Send,
  Lightbulb,
  SkipForward,
  RotateCcw,
  BookOpen,
  Users,
  Volume2,
  VolumeX,
  Clock,
  Settings,
} from 'lucide-react';
import { GameModeType } from '@/lib/multiplayerEngine';
import { FaithDifficulty, FAITH_DIFFICULTIES } from '@/lib/scrabbleEngine';

interface ScrabbleHUDProps {
  playerScore: number;
  opponentScore: number;
  player1Name: string;
  player2Name: string;
  player1FaithPoints?: number;
  player2FaithPoints?: number;
  gameMode: GameModeType;
  faithDifficulty?: FaithDifficulty;
  onOpenFaithModal?: () => void;
  isPlayerTurn: boolean;
  tilesLeftInBag: number;
  isMusicMuted?: boolean;
  onToggleMusic?: () => void;
  onPlayWord: () => void;
  onScriptureHint: () => void;
  onPassTurn: () => void;
  onOpenBagModal: () => void;
  onOpenLobbyModal: () => void;
  onNewGame: () => void;
  isAiThinking: boolean;
  hasTempPlacements: boolean;
  roomCode?: string;
  isOnlineConnected?: boolean;
}

export default function ScrabbleHUD({
  playerScore,
  opponentScore,
  player1Name,
  player2Name,
  player1FaithPoints = 100,
  player2FaithPoints = 100,
  gameMode,
  faithDifficulty = 'disciple',
  onOpenFaithModal,
  isPlayerTurn,
  tilesLeftInBag,
  isMusicMuted = false,
  onToggleMusic,
  onPlayWord,
  onScriptureHint,
  onPassTurn,
  onOpenBagModal,
  onOpenLobbyModal,
  onNewGame,
  isAiThinking,
  hasTempPlacements,
  roomCode,
  isOnlineConnected,
}: ScrabbleHUDProps) {
  const currentDiffInfo = FAITH_DIFFICULTIES.find((d) => d.id === faithDifficulty) || FAITH_DIFFICULTIES[1];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 select-none">
      {/* TOP LAUREL SEAL HEADER */}
      <div className="flex flex-col items-center justify-center relative py-0.5">
        <div className="laurel-seal-plaque px-6 sm:px-10 py-2 rounded-full flex flex-col items-center justify-center shadow-md border border-[#cca25d] relative">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-sm sm:text-base">✝</span>
            <h1 className="font-serif font-black text-base sm:text-xl text-[#2b180d] tracking-widest uppercase">
              SCRIPTURE <span className="text-[#b45309]">SCRABBLE</span>
            </h1>
            <span className="text-amber-700 text-sm sm:text-base">🌿</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#78350f] tracking-widest uppercase font-serif">
            HOLY BIBLE EDITION • 15×15 DELUXE
          </span>
        </div>
      </div>

      {/* DUAL PLAYER STATUS PILLS / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* PLAYER 1 CARD (David / You) */}
        <div
          className={`hud-pill-card p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 ${
            isPlayerTurn
              ? 'ring-2 ring-amber-500 shadow-md shadow-amber-400/20 bg-gradient-to-r from-amber-50/90 to-white'
              : 'opacity-85'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-xl shadow-sm">
              👤
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-sm text-[#2b180d]">
                  {player1Name}
                </span>
                {isPlayerTurn && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                    Your Turn
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-serif text-[#78350f]">
                <span>Score: <strong className="text-[#b45309] font-black text-sm">{playerScore}</strong></span>
                <span className="text-amber-300">•</span>
                <span className="flex items-center gap-1 font-bold text-[11px] text-amber-800">
                  🕊️ {player1FaithPoints} FP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bag modal button */}
            <button
              onClick={onOpenBagModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#78350f] font-bold text-xs shadow-sm transition active:scale-95"
              title="View Tile Bag"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-black text-[11px]">{tilesLeftInBag}</span>
            </button>
          </div>
        </div>

        {/* OPPONENT / PLAYER 2 CARD */}
        <div
          className={`hud-pill-card p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-300 ${
            !isPlayerTurn
              ? 'ring-2 ring-purple-500 shadow-md shadow-purple-400/20 bg-gradient-to-r from-purple-50/90 to-white'
              : 'opacity-85'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-300 flex items-center justify-center text-xl shadow-sm">
              {gameMode === 'ai' ? '👑' : '👥'}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-sm text-[#2b180d]">
                  {gameMode === 'ai' ? 'Solomon AI' : player2Name}
                </span>
                {!isPlayerTurn && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
                    {isAiThinking ? 'Praying...' : "Opponent's Turn"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-serif text-[#78350f]">
                <span>Score: <strong className="text-purple-700 font-black text-sm">{opponentScore}</strong></span>
                {gameMode === 'ai' && (
                  <>
                    <span className="text-amber-300">•</span>
                    <button
                      onClick={onOpenFaithModal}
                      className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 hover:bg-amber-200 transition"
                      title="Change Faith Difficulty"
                    >
                      {currentDiffInfo.icon} {currentDiffInfo.name}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Audio Toggle */}
            {onToggleMusic && (
              <button
                onClick={onToggleMusic}
                className={`p-2 rounded-xl border transition ${
                  isMusicMuted
                    ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                    : 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm'
                }`}
                title={isMusicMuted ? 'Turn Music On' : 'Mute Music'}
              >
                {isMusicMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700" />}
              </button>
            )}

            {/* Multiplayer Mode */}
            <button
              onClick={onOpenLobbyModal}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-[#78350f] font-bold text-xs shadow-sm transition active:scale-95"
              title="Game Modes & Multiplayer"
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline text-[11px] font-black">Mode</span>
            </button>

            {/* Restart Game */}
            <button
              onClick={onNewGame}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition shadow-sm active:scale-95"
              title="Start New Game"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS BAR: PLAY WORD, HINT, PASS */}
      <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-2xl bg-white/95 border border-[#e7dac5] shadow-sm backdrop-blur-md">
        {/* Pass Button */}
        <button
          onClick={onPassTurn}
          disabled={isAiThinking || !isPlayerTurn}
          className="flex items-center gap-1 py-2 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition active:scale-95 disabled:opacity-40"
          title="Pass turn to opponent"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Pass</span>
        </button>

        {/* Hint Button */}
        <button
          onClick={onScriptureHint}
          disabled={isAiThinking || !isPlayerTurn}
          className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40"
          title="Get a Divine Scripture placement hint"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Prophetic Hint</span>
        </button>

        {/* Play Word Button */}
        <button
          onClick={onPlayWord}
          disabled={!hasTempPlacements || isAiThinking || !isPlayerTurn}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-6 sm:px-8 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md ${
            hasTempPlacements && isPlayerTurn && !isAiThinking
              ? 'btn-game-primary text-slate-950 scale-105 animate-pulse'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Play Word</span>
        </button>
      </div>
    </div>
  );
}
