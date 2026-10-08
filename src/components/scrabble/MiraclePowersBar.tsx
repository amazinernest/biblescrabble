'use client';

import React, { useState } from 'react';
import { MIRACLE_POWERS, MiraclePower, MiracleId, PlayerFaithState } from '@/lib/miraclePowers';
import { audioEngine } from '@/lib/audioEngine';

interface MiraclePowersBarProps {
  faithState: PlayerFaithState;
  isMyTurn: boolean;
  onActivateMiracle: (miracle: MiraclePower) => void;
  targetingMode: 'NONE' | 'PART_WATERS' | 'ARK_BLESSING';
  onCancelTargeting: () => void;
  activePropheticWord?: string | null;
}

export const MiraclePowersBar: React.FC<MiraclePowersBarProps> = ({
  faithState,
  isMyTurn,
  onActivateMiracle,
  targetingMode,
  onCancelTargeting,
  activePropheticWord,
}) => {
  const [hoveredMiracle, setHoveredMiracle] = useState<MiraclePower | null>(null);

  const handleMiracleClick = (m: MiraclePower) => {
    if (!isMyTurn || faithState.faithPoints < m.cost) {
      audioEngine.playWrong();
      return;
    }
    audioEngine.playClick();
    onActivateMiracle(m);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-1 select-none">
      {/* Target Mode or Active Buff Banner */}
      {targetingMode !== 'NONE' && (
        <div className="mb-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-900 border border-cyan-400 text-white flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold">
            <span className="text-xl">{targetingMode === 'PART_WATERS' ? '🌊' : '🌟'}</span>
            <span>
              {targetingMode === 'PART_WATERS'
                ? 'Select any placed tile on the board to part and clear it.'
                : 'Select any tile from your rack to bless it into a Golden Wildcard.'}
            </span>
          </div>
          <button
            onClick={onCancelTargeting}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold transition shadow"
          >
            Cancel
          </button>
        </div>
      )}

      {faithState.activeBuffs.pentecostFireActive && (
        <div className="mb-2.5 p-2 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 border border-yellow-300 text-white flex items-center justify-between shadow-lg shadow-orange-500/30">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-wider font-serif">
            <span className="text-xl animate-bounce">🔥</span>
            <span>PENTECOSTAL FIRE ACTIVE: NEXT WORD SCORES 2× HOLY BONUS!</span>
          </div>
          <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded-full font-mono font-bold">2× Score</span>
        </div>
      )}

      {activePropheticWord && (
        <div className="mb-2.5 p-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-serif">
            <span className="text-lg">💡</span>
            <span>Prophetic Hint Active: Word “{activePropheticWord}” highlighted on board!</span>
          </div>
        </div>
      )}

      {/* HORIZONTAL MIRACLES DOCK WITH PILL BUTTONS */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {MIRACLE_POWERS.map((m) => {
          const canAfford = faithState.faithPoints >= m.cost;
          const isAffordableAndTurn = canAfford && isMyTurn;

          return (
            <button
              key={m.id}
              onClick={() => handleMiracleClick(m)}
              disabled={!isAffordableAndTurn}
              onMouseEnter={() => setHoveredMiracle(m)}
              onMouseLeave={() => setHoveredMiracle(null)}
              className={`miracle-pill-btn px-3 py-2 rounded-full flex items-center gap-1.5 text-xs font-serif font-bold transition ${
                isAffordableAndTurn
                  ? 'text-[#2b180d] hover:text-[#b45309] cursor-pointer'
                  : 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={`${m.name} - ${m.description} (Costs ${m.cost} FP)`}
            >
              <span className="text-sm sm:text-base leading-none">{m.icon}</span>
              <span className="text-[11px] sm:text-xs font-black tracking-wide whitespace-nowrap">
                {m.name}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold leading-none ${
                  canAfford
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {m.cost} FP
              </span>
            </button>
          );
        })}
      </div>

      {/* Tooltip Description */}
      {hoveredMiracle && (
        <div className="mt-1.5 text-center text-[11px] font-serif italic text-[#78350f] animate-fade-in">
          {hoveredMiracle.name}: {hoveredMiracle.description}
        </div>
      )}
    </div>
  );
};
