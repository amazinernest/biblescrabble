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
} from 'lucide-react';
import { GameModeType } from '@/lib/multiplayerEngine';

interface ScrabbleHUDProps {
  playerScore: number;
  opponentScore: number;
  player1Name: string;
  player2Name: string;
  player1FaithPoints?: number;
  player2FaithPoints?: number;
  gameMode: GameModeType;
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
  return (
    <div className="w-full max-w-2xl mx-auto space-y-2.5 select-none">
      {/* TOP HEADER: ROOM CODE & MULTIPLAYER MODE SELECTOR */}
      <div className="flex items-center justify-between gap-2 p-2 px-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 backdrop-blur-md text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-black text-amber-300 uppercase tracking-wider text-[11px] sm:text-xs">
            {gameMode === 'ai'
              ? 'Solo VS Solomon AI'
              : gameMode === 'pass_and_play'
              ? 'Pass & Play (Local 2P)'
              : `Live Match: ${roomCode || 'Connected'}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleMusic && (
            <button
              onClick={onToggleMusic}
              className={`p-1.5 rounded-xl border transition ${
                isMusicMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-300 animate-pulse'
              }`}
              title={isMusicMuted ? 'Turn Music On' : 'Mute Music'}
            >
              {isMusicMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={onOpenLobbyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition"
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
              ? 'bg-gradient-to-br from-amber-950/80 via-[#18233d] to-[#0c1424] border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-500/20'
              : 'bg-slate-900/80 border-slate-800 opacity-75'
          }`}
        >
          {isPlayerTurn && (
            <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          )}

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-md border border-amber-300">
                👑
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-950 px-1 py-0.2 rounded-full border border-amber-400 font-mono text-amber-300 font-bold">
                {player1FaithPoints}FP
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-black uppercase text-amber-300 truncate max-w-[100px] block">
                {player1Name}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white block leading-none">
                {playerScore} <span className="text-[10px] text-amber-400 font-sans font-bold">PTS</span>
              </span>
            </div>
          </div>

          {isPlayerTurn && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-bounce shadow-md">
              Turn
            </span>
          )}
        </div>

        {/* Player 2 / Opponent Score Card */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all text-left flex items-center justify-between relative overflow-hidden ${
            !isPlayerTurn
              ? 'bg-gradient-to-br from-purple-950/80 via-[#1b193d] to-[#0d0f24] border-purple-400 ring-2 ring-purple-400/50 shadow-2xl shadow-purple-500/20'
              : 'bg-slate-900/80 border-slate-800 opacity-75'
          }`}
        >
          {!isPlayerTurn && (
            <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
          )}

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-md border border-purple-300">
                {gameMode === 'ai' ? '🤖' : '🛡️'}
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-950 px-1 py-0.2 rounded-full border border-purple-400 font-mono text-purple-300 font-bold">
                {player2FaithPoints}FP
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-black uppercase text-purple-300 truncate max-w-[100px] block">
                {player2Name}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white block leading-none">
                {opponentScore} <span className="text-[10px] text-purple-400 font-sans font-bold">PTS</span>
              </span>
            </div>
          </div>

          {!isPlayerTurn && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white animate-pulse shadow-md">
              {isAiThinking ? 'Thinking...' : 'Turn'}
            </span>
          )}
        </div>
      </div>

      {/* TOP CONTROL BAR: TILE BAG COUNT & ACTION BUTTONS */}
      <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        {/* Tile Bag Counter */}
        <button
          onClick={onOpenBagModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 shadow"
          title="Click to view remaining tiles in bag"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Bag: {tilesLeftInBag}</span>
        </button>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={onScriptureHint}
            disabled={isAiThinking || !isPlayerTurn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-bold text-amber-300 transition active:scale-95 disabled:opacity-40 shadow"
            title="Get a Divine Scripture placement hint"
          >
            <Lightbulb className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span className="hidden sm:inline">Prophetic Hint</span>
          </button>

          <button
            onClick={onPassTurn}
            disabled={isAiThinking || !isPlayerTurn}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition active:scale-95 disabled:opacity-40 shadow"
            title="Pass turn to opponent"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Pass</span>
          </button>

          <button
            onClick={onPlayWord}
            disabled={!hasTempPlacements || isAiThinking || !isPlayerTurn}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-xl ${
              hasTempPlacements && isPlayerTurn && !isAiThinking
                ? 'btn-game-primary text-slate-950 scale-105 animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
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
