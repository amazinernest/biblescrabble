'use client';

import React from 'react';
import { ScrabbleTile } from '@/lib/scrabbleEngine';
import { Shuffle, RotateCcw, RefreshCw, Sparkles } from 'lucide-react';

interface TileRackProps {
  rack: ScrabbleTile[];
  selectedTile: ScrabbleTile | null;
  isTargetingBlessing?: boolean;
  onSelectTile: (tile: ScrabbleTile) => void;
  onShuffle: () => void;
  onRecall: () => void;
  onOpenSwapModal: () => void;
  disabled?: boolean;
}

export default function TileRack({
  rack,
  selectedTile,
  isTargetingBlessing = false,
  onSelectTile,
  onShuffle,
  onRecall,
  onOpenSwapModal,
  disabled = false,
}: TileRackProps) {
  const handleDragStart = (e: React.DragEvent, tile: ScrabbleTile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tile));
    e.dataTransfer.effectAllowed = 'move';
    onSelectTile(tile);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-2">
      {/* WOODEN RACK BODY */}
      <div className="w-full p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#2e1d10] via-[#1f130a] to-[#120a05] border-4 border-[#78350f] shadow-2xl relative flex items-center justify-center gap-2 sm:gap-3">
        {/* Rack Wood Grain Highlight Ridge */}
        <div className="absolute top-1 left-4 right-4 h-1 bg-[#5c3317]/80 rounded-full blur-[0.5px] pointer-events-none" />
        <div className="absolute bottom-1.5 left-4 right-4 h-1.5 bg-[#0a0502]/90 rounded-full pointer-events-none" />

        {rack.length === 0 ? (
          <span className="text-xs text-amber-200/60 italic py-3 font-serif">
            All tiles placed on the board! Press “Play Word” to submit.
          </span>
        ) : (
          rack.map((tile) => {
            const isSelected = selectedTile?.id === tile.id;
            const isBlankWildcard = tile.isBlank;

            return (
              <div
                key={tile.id}
                draggable={!disabled && !isTargetingBlessing}
                onDragStart={(e) => handleDragStart(e, tile)}
                onClick={() => !disabled && onSelectTile(tile)}
                className={`w-11 h-13 sm:w-14 sm:h-16 rounded-xl flex flex-col items-center justify-between p-1 cursor-grab active:cursor-grabbing transform transition-all select-none relative ${
                  isBlankWildcard
                    ? 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-slate-950 font-black ring-2 ring-yellow-400'
                    : 'scrabble-tile-3d text-slate-950'
                } ${
                  isTargetingBlessing
                    ? 'ring-4 ring-yellow-400 animate-pulse hover:scale-110 cursor-pointer shadow-yellow-500/50'
                    : isSelected
                    ? 'ring-4 ring-amber-400 scale-110 -translate-y-2 shadow-amber-400/40 z-20 brightness-105'
                    : 'hover:-translate-y-1 hover:scale-105'
                }`}
              >
                {/* Letter */}
                <span className="text-xl sm:text-2xl font-black font-serif text-slate-950 leading-none mt-1">
                  {isBlankWildcard ? '★' : tile.letter}
                </span>

                {/* Scrabble Point Subscript */}
                <span className="text-[9px] sm:text-[10px] font-black text-amber-900 self-end mr-1 leading-none">
                  {isBlankWildcard ? 'W' : tile.points}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* RACK UTILITY BUTTONS */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          onClick={onShuffle}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 disabled:opacity-40"
          title="Shuffle tiles on rack"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
          <span>Shuffle</span>
        </button>

        <button
          onClick={onRecall}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 disabled:opacity-40"
          title="Recall placed tiles from board back to rack"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recall</span>
        </button>

        <button
          onClick={onOpenSwapModal}
          disabled={disabled || rack.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 disabled:opacity-40"
          title="Exchange tiles with the tile bag"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
          <span>Swap</span>
        </button>
      </div>
    </div>
  );
}
