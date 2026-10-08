'use client';

import React, { useEffect, useState } from 'react';

export interface FloatingPopEvent {
  id: string;
  score: number;
  word: string;
  isBiblical: boolean;
  isPentecost: boolean;
}

interface FloatingScorePopProps {
  activePop: FloatingPopEvent | null;
}

export const FloatingScorePop: React.FC<FloatingScorePopProps> = ({ activePop }) => {
  const [pop, setPop] = useState<FloatingPopEvent | null>(null);

  useEffect(() => {
    if (activePop) {
      setPop(activePop);
      const timer = setTimeout(() => {
        setPop(null);
      }, 1900);
      return () => clearTimeout(timer);
    }
  }, [activePop]);

  if (!pop) return null;

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-score-burst">
      <div className={`px-6 py-3 rounded-2xl border-2 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center ${
        pop.isPentecost
          ? 'bg-gradient-to-r from-red-600/95 via-orange-500/95 to-amber-500/95 border-yellow-200 text-white shadow-orange-500/50'
          : pop.isBiblical
          ? 'bg-gradient-to-r from-amber-500/95 via-yellow-400/95 to-amber-600/95 border-amber-100 text-slate-950 shadow-amber-500/50'
          : 'bg-gradient-to-r from-blue-600/95 to-indigo-700/95 border-cyan-300 text-white shadow-cyan-500/40'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">
            {pop.isPentecost ? '🔥' : pop.isBiblical ? '🕊️' : '✨'}
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
            +{pop.score} PTS
          </span>
        </div>
        <div className="text-xs sm:text-sm font-black uppercase tracking-wider mt-0.5">
          {pop.isPentecost
            ? `2× HOLY FIRE: “${pop.word}”`
            : pop.isBiblical
            ? `SCRIPTURE WORD: “${pop.word}”`
            : `“${pop.word}”`}
        </div>
      </div>
    </div>
  );
};
