'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Flame, ThumbsUp, Send } from 'lucide-react';

interface QuickReactionsProps {
  onSendReaction: (emoji: string, text: string) => void;
  incomingReaction: { emoji: string; text: string; sender: string } | null;
}

const REACTIONS = [
  { emoji: '🙏', text: 'Amen!' },
  { emoji: '🎯', text: 'Great Word!' },
  { emoji: '✨', text: 'Glory to God!' },
  { emoji: '🔥', text: 'Holy Fire!' },
  { emoji: '👏', text: 'Well Played!' },
];

export default function QuickReactions({
  onSendReaction,
  incomingReaction,
}: QuickReactionsProps) {
  const [activeBubble, setActiveBubble] = useState<{ emoji: string; text: string; sender: string } | null>(null);

  useEffect(() => {
    if (incomingReaction) {
      setActiveBubble(incomingReaction);
      const timer = setTimeout(() => setActiveBubble(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [incomingReaction]);

  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-between gap-1 select-none">
      {/* FLOATING INCOMING REACTION BUBBLE */}
      {activeBubble && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-2xl animate-pop border-2 border-white flex items-center gap-2">
          <span className="text-xl">{activeBubble.emoji}</span>
          <span>
            <strong>{activeBubble.sender}:</strong> “{activeBubble.text}”
          </span>
        </div>
      )}

      {/* REACTION PILLS */}
      <div className="flex items-center justify-center gap-1.5 w-full overflow-x-auto py-1">
        {REACTIONS.map((r, idx) => (
          <button
            key={idx}
            onClick={() => onSendReaction(r.emoji, r.text)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-[11px] font-bold text-slate-200 transition active:scale-95 shrink-0"
          >
            <span>{r.emoji}</span>
            <span className="hidden sm:inline">{r.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
