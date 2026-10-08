'use client';

import React, { useState, useEffect } from 'react';
import { GameModeType, multiplayer } from '@/lib/multiplayerEngine';
import {
  Users,
  Globe,
  Bot,
  Copy,
  Check,
  Play,
  X,
  Share2,
  Sparkles,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameModeType;
  onSelectMode: (mode: GameModeType, roomCode?: string, player2Name?: string) => void;
  currentRoomCode: string;
  isHostConnected: boolean;
}

export default function MultiplayerLobbyModal({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  currentRoomCode,
  isHostConnected,
}: MultiplayerLobbyModalProps) {
  const [tab, setTab] = useState<'select' | 'host' | 'join' | 'pass_play'>('select');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [player1Name, setPlayer1Name] = useState<string>('David');
  const [player2Name, setPlayer2Name] = useState<string>('Solomon');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    // Generate a clean 6-character biblical room code
    const prefixes = ['FAITH', 'GRACE', 'MOSES', 'DAVID', 'NOAH', 'PEACE', 'ZION', 'EDEN'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setGeneratedCode(`${prefix}-${num}`);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?room=${generatedCode || currentRoomCode}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleStartHost = () => {
    onSelectMode('online_host', generatedCode);
    setTab('host');
  };

  const handleStartJoin = () => {
    if (!joinCodeInput.trim()) return;
    onSelectMode('online_guest', joinCodeInput.trim().toUpperCase());
    onClose();
  };

  const handleStartPassAndPlay = () => {
    onSelectMode('pass_and_play', undefined, player2Name.trim() || 'Player 2');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#18233d] to-[#0c1222] rounded-3xl border-2 border-amber-500/60 shadow-2xl p-6 sm:p-8 text-center text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/80 border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 text-2xl shadow-xl shadow-amber-500/20">
            👥
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            PLAY WITH <span className="gold-gradient-text">FRIENDS</span>
          </h2>
          <p className="text-xs text-slate-300">
            Connect live online or share the same screen with family.
          </p>
        </div>

        {/* TAB 1: MODE SELECTOR */}
        {tab === 'select' && (
          <div className="grid grid-cols-1 gap-3 text-left">
            {/* Online Match (Host / Join) */}
            <div
              onClick={handleStartHost}
              className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-[#122445] border-2 border-blue-500/50 hover:border-blue-400 transition cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🌐
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Create Online Match</h3>
                  <p className="text-xs text-slate-300">Get a room code & invite link to play live with a friend.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Join by Room Code */}
            <div
              onClick={() => setTab('join')}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-[#221340] border-2 border-purple-500/50 hover:border-purple-400 transition cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🔗
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Join Friend’s Match</h3>
                  <p className="text-xs text-slate-300">Enter a 6-character room code from your friend.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Pass & Play (Local 2-Player) */}
            <div
              onClick={() => setTab('pass_play')}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#102e1c] border-2 border-emerald-500/50 hover:border-emerald-400 transition cursor-pointer shadow-lg group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📱
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Pass & Play (Same Device)</h3>
                  <p className="text-xs text-slate-300">Take turns on the same laptop or tablet with tile privacy.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* VS Solomon AI */}
            <div
              onClick={() => {
                onSelectMode('ai');
                onClose();
              }}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Solo VS Solomon AI</h3>
                  <p className="text-xs text-slate-400">Practice your Scripture Scrabble against wise AI.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        )}

        {/* TAB 2: HOST ROOM DISPLAY */}
        {tab === 'host' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                Your Match Room Code:
              </span>
              <div className="text-3xl font-mono font-black text-white tracking-widest bg-slate-950 p-3 rounded-xl border border-amber-500/40 select-all">
                {generatedCode}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl flex items-center justify-center gap-2"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Invite Link Copied!' : 'Copy Shareable Invite Link'}</span>
              </button>

              <p className="text-[11px] text-slate-400">
                Send this link or code to your friend. When they open it, you will connect instantly!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs text-blue-300 flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span>
                {isHostConnected ? '🟢 Friend Connected! Game Ready.' : 'Waiting for friend to connect...'}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              Start Playing on Board
            </button>
          </div>
        )}

        {/* TAB 3: JOIN ROOM INPUT */}
        {tab === 'join' && (
          <div className="space-y-4">
            <div className="text-left space-y-2">
              <label className="text-xs font-bold uppercase text-amber-300 tracking-wider">
                Enter 6-Character Room Code:
              </label>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="e.g. FAITH-777"
                maxLength={12}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:outline-none text-white font-mono font-bold text-center text-lg uppercase shadow-inner"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTab('select')}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleStartJoin}
                disabled={!joinCodeInput.trim()}
                className="flex-1 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl disabled:opacity-40"
              >
                Connect to Room 🚀
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PASS & PLAY SETUP */}
        {tab === 'pass_play' && (
          <div className="space-y-4 text-left">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-amber-300 tracking-wider block mb-1">
                  Player 1 Name:
                </label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  maxLength={15}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-emerald-300 tracking-wider block mb-1">
                  Player 2 Name:
                </label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  maxLength={15}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTab('select')}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleStartPassAndPlay}
                className="flex-1 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
              >
                Start Local Match 📱
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
