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
  Flame,
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
    <div className="w-full max-w-2xl mx-auto space-y-2.5 select-none">
      {/* TOP HEADER: ROOM CODE, FAITH LEVEL & MULTIPLAYER MODE SELECTOR */}
      <div className="flex items-center justify-between gap-2 p-2 px-3.5 rounded-2xl bg-white/95 border border-amber-200/80 backdrop-blur-md text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] sm:text-xs">
            {gameMode === 'ai'
              ? 'Solo VS Solomon'
              : gameMode === 'pass_and_play'
              ? 'Pass & Play (Local 2P)'
              : `Live Match: ${roomCode || 'Connected'}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Faith Level Selector */}
          {gameMode === 'ai' && onOpenFaithModal && (
            <button
              onClick={onOpenFaithModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-900 font-bold text-[11px] shadow-sm transition active:scale-95"
              title="Change Faith Difficulty"
            >
              <span>{currentDiffInfo.icon}</span>
              <span className="hidden sm:inline font-black">{currentDiffInfo.name}</span>
            </button>
          )}

          {/* Music Toggle */}
          {onToggleMusic && (
            <button
              onClick={onToggleMusic}
              className={`p-1.5 rounded-xl border transition ${
                isMusicMuted
                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                  : 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse shadow-sm'
              }`}
              title={isMusicMuted ? 'Turn Music On' : 'Mute Music'}
            >
              {isMusicMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Mode Lobby Button */}
          <button
            onClick={onOpenLobbyModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow hover:scale-105 active:scale-95 transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mode</span>
          </button>
        </div>
      </div>

      {/* SCOREBOARDS & TURN STATUS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Player 1 Score Card */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all text-left flex items-center justify-between relative overflow-hidden ${
            isPlayerTurn
              ? 'bg-white border-amber-400 ring-2 ring-amber-300/60 shadow-lg shadow-amber-500/10'
              : 'bg-slate-50/90 border-slate-200/90 opacity-75'
          }`}
        >
          {isPlayerTurn && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          )}

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-xl shadow border border-amber-200">
                👑
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-900 px-1 py-0.2 rounded-full border border-amber-400 font-mono text-amber-300 font-bold">
                {player1FaithPoints}FP
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-black uppercase text-amber-800 truncate max-w-[100px] block">
                {player1Name}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block leading-none">
                {playerScore} <span className="text-[10px] text-amber-600 font-sans font-bold">PTS</span>
              </span>
            </div>
          </div>

          {isPlayerTurn && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-bounce shadow">
              Turn
            </span>
          )}
        </div>

        {/* Player 2 / Opponent Score Card */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all text-left flex items-center justify-between relative overflow-hidden ${
            !isPlayerTurn
              ? 'bg-white border-purple-400 ring-2 ring-purple-300/60 shadow-lg shadow-purple-500/10'
              : 'bg-slate-50/90 border-slate-200/90 opacity-75'
          }`}
        >
          {!isPlayerTurn && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
          )}

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-xl shadow border border-purple-200">
                {gameMode === 'ai' ? '🤖' : '🛡️'}
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-900 px-1 py-0.2 rounded-full border border-purple-400 font-mono text-purple-300 font-bold">
                {player2FaithPoints}FP
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-black uppercase text-purple-800 truncate max-w-[100px] block">
                {player2Name}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block leading-none">
                {opponentScore} <span className="text-[10px] text-purple-600 font-sans font-bold">PTS</span>
              </span>
            </div>
          </div>

          {!isPlayerTurn && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white animate-pulse shadow">
              {isAiThinking ? 'Thinking...' : 'Turn'}
            </span>
          )}
        </div>
      </div>

      {/* TOP CONTROL BAR: TILE BAG COUNT & ACTION BUTTONS */}
      <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md">
        {/* Tile Bag Counter */}
        <button
          onClick={onOpenBagModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition active:scale-95 shadow-sm"
          title="Click to view remaining tiles in bag"
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Bag: {tilesLeftInBag}</span>
        </button>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={onScriptureHint}
            disabled={isAiThinking || !isPlayerTurn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-xs font-bold text-amber-900 transition active:scale-95 disabled:opacity-40 shadow-sm"
            title="Get a Divine Scripture placement hint"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span className="hidden sm:inline">Prophetic Hint</span>
          </button>

          <button
            onClick={onPassTurn}
            disabled={isAiThinking || !isPlayerTurn}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition active:scale-95 disabled:opacity-40 shadow-sm"
            title="Pass turn to opponent"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Pass</span>
          </button>

          <button
            onClick={onPlayWord}
            disabled={!hasTempPlacements || isAiThinking || !isPlayerTurn}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md ${
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
    </div>
  );
}
