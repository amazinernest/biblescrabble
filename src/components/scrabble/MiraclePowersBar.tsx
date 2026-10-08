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
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2">
      {/* Target Mode or Active Buff Banner */}
      {targetingMode !== 'NONE' && (
        <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-900/90 to-blue-900/90 border border-cyan-400 text-white flex items-center justify-between shadow-lg shadow-cyan-500/20 animate-pulse">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-xl">{targetingMode === 'PART_WATERS' ? '🌊' : '🌟'}</span>
            <span>
              {targetingMode === 'PART_WATERS'
                ? 'Select any single placed tile on the board to part and remove it.'
                : 'Select any tile from your rack to bless it into a Golden Wildcard.'}
            </span>
          </div>
          <button
            onClick={onCancelTargeting}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-500 rounded-lg text-xs font-bold transition shadow"
          >
            Cancel
          </button>
        </div>
      )}

      {faithState.activeBuffs.pentecostFireActive && (
        <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-red-600/90 via-orange-500/90 to-amber-500/90 border border-yellow-300 text-white flex items-center justify-between shadow-lg shadow-orange-500/30">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-wider">
            <span className="text-xl animate-bounce">🔥</span>
            <span>PENTECOSTAL FIRE ACTIVE: NEXT WORD EARNS 2× HOLY BONUS SCORE!</span>
          </div>
          <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full font-mono font-bold">2× Anointing</span>
        </div>
      )}

      {activePropheticWord && (
        <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-amber-600/80 to-yellow-500/80 border border-amber-300 text-amber-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-xl">💡</span>
            <span>Prophetic Hint Active: Word “{activePropheticWord}” highlighted on board!</span>
          </div>
        </div>
      )}

      {/* Main Miracle Control Dock */}
      <div className="bg-white/95 border border-amber-200/90 rounded-2xl p-2.5 sm:p-3 shadow-md backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Faith Points Meter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm border border-amber-200 text-slate-950 font-black text-xl">
              🕊️
            </div>
            <div className="flex-1 sm:w-44">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-amber-800 flex items-center gap-1 font-black">
                  FAITH GRACE <span className="text-[10px] text-amber-700">({faithState.faithPoints}/{faithState.maxFaithPoints} FP)</span>
                </span>
                <span className="text-[11px] text-amber-900 font-mono font-bold">
                  {Math.round((faithState.faithPoints / faithState.maxFaithPoints) * 100)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-amber-300">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(100, (faithState.faithPoints / faithState.maxFaithPoints) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Miracle Power-Up Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto justify-center pb-1 sm:pb-0">
            {MIRACLE_POWERS.map((power) => {
              const canAfford = faithState.faithPoints >= power.cost;
              const isAffordableAndTurn = canAfford && isMyTurn;

              return (
                <div key={power.id} className="relative group">
                  <button
                    onClick={() => handleMiracleClick(power)}
                    disabled={!isAffordableAndTurn}
                    onMouseEnter={() => setHoveredMiracle(power)}
                    onMouseLeave={() => setHoveredMiracle(null)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[62px] sm:min-w-[70px] border ${
                      isAffordableAndTurn
                        ? 'bg-amber-50/70 hover:bg-amber-100/90 border-amber-300/80 hover:border-amber-500 hover:scale-105 active:scale-95 shadow-sm'
                        : 'bg-slate-100/60 border-slate-200 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-0.5 filter drop-shadow-sm">{power.icon}</span>
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-800 tracking-tight whitespace-nowrap text-center">
                      {power.name.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-mono font-black mt-0.5 px-1 rounded ${
                      canAfford ? 'text-amber-800 bg-amber-100' : 'text-slate-400'
                    }`}>
                      {power.cost} FP
                    </span>
                  </button>

                  {/* Desktop Hover Tooltip */}
                  {hoveredMiracle?.id === power.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl bg-slate-900 border border-amber-400 text-white text-xs shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                        <span>{power.icon}</span>
                        <span>{power.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-200 mb-1.5 leading-relaxed">
                        {power.description}
                      </p>
                      <div className="border-t border-slate-700 pt-1 text-[9px] text-amber-400 italic font-serif">
                        {power.scriptureRef}: {power.verse}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
