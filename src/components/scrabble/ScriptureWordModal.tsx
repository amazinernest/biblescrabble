'use client';

import React from 'react';
import { ScriptureDefinition } from '@/lib/scrabbleDictionary';
import { BookOpen, X, Sparkles, Trophy } from 'lucide-react';

interface ScriptureWordModalProps {
  entry: ScriptureDefinition | null;
  scoreEarned?: number;
  onClose: () => void;
}

export default function ScriptureWordModal({
  entry,
  scoreEarned,
  onClose,
}: ScriptureWordModalProps) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#18233d] to-[#0c1222] rounded-3xl border-2 border-amber-500/60 shadow-2xl p-6 sm:p-8 text-center text-slate-100 space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/80 border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20 text-slate-950">
          📜
        </div>

        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
            {entry.category}
          </span>
          <h2 className="text-3xl font-black text-white mt-1 font-serif tracking-wide">
            {entry.word}
          </h2>
          {scoreEarned !== undefined && (
            <span className="text-xs font-black text-emerald-400 block mt-0.5">
              +{scoreEarned} Points Scored (+1.5x Biblical Bonus!)
            </span>
          )}
        </div>

        {/* Definition */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {entry.definition}
        </p>

        {/* Scripture Quote */}
        <div className="p-4 rounded-2xl bg-[#090f1d] border border-amber-500/30 text-xs font-serif italic text-amber-200/90 space-y-1.5 text-left">
          <div className="flex items-center gap-1.5 text-amber-400 not-italic font-sans text-[11px] font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scripture Reference</span>
          </div>
          <p className="leading-relaxed">{entry.verse}</p>
          <span className="block text-[11px] font-sans font-black text-amber-400 not-italic pt-1">
            — {entry.reference}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
        >
          Continue Game
        </button>
      </div>
    </div>
  );
}
