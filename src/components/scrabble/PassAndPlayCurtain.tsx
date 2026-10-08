'use client';

import React from 'react';
import { Shield, Eye, ArrowRight } from 'lucide-react';

interface PassAndPlayCurtainProps {
  nextPlayerName: string;
  onReveal: () => void;
}

export default function PassAndPlayCurtain({
  nextPlayerName,
  onReveal,
}: PassAndPlayCurtainProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-[#1c1829] via-[#120f1e] to-[#0a0712] rounded-3xl border-2 border-purple-500/60 shadow-2xl p-8 text-center text-slate-100 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-4xl shadow-2xl shadow-purple-500/30">
          🛡️
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400">
            Pass & Play Turn Transition
          </span>
          <h2 className="text-3xl font-black text-white font-serif">
            PASS DEVICE TO: <span className="gold-gradient-text">{nextPlayerName}</span>
          </h2>
          <p className="text-xs text-slate-400 pt-1">
            Tile racks are hidden to keep your letters secret.
          </p>
        </div>

        <button
          onClick={onReveal}
          className="w-full py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2 transform hover:scale-105 transition"
        >
          <Eye className="w-4 h-4 fill-slate-950" />
          <span>I AM {nextPlayerName.toUpperCase()} — REVEAL MY TILES</span>
        </button>
      </div>
    </div>
  );
}
