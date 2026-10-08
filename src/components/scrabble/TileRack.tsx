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
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none space-y-2.5">
      {/* 3D WALNUT WOODEN RACK BODY */}
      <div className="w-full p-3 sm:p-4 rounded-2xl wood-board-bezel relative flex items-center justify-center gap-2 sm:gap-3.5 shadow-2xl">
        {/* Rack Wood Grain Highlight Ridge */}
        <div className="absolute top-1 left-4 right-4 h-1 bg-[#854d0e]/40 rounded-full blur-[0.5px] pointer-events-none" />
        <div className="absolute bottom-1.5 left-4 right-4 h-1.5 bg-[#120a05]/90 rounded-full pointer-events-none" />

        {rack.length === 0 ? (
          <span className="text-xs text-amber-200/80 italic py-3 font-serif">
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
                className={`w-11 h-14 sm:w-14 sm:h-16 rounded-xl flex flex-col items-center justify-between p-1.5 cursor-grab active:cursor-grabbing transform transition-all select-none relative ${
                  isBlankWildcard
                    ? 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.7)] text-slate-950 font-black ring-2 ring-yellow-400'
                    : 'ivory-tile-3d'
                } ${
                  isTargetingBlessing
                    ? 'ring-4 ring-yellow-400 animate-pulse hover:scale-110 cursor-pointer shadow-yellow-500/50'
                    : isSelected
                    ? 'ring-4 ring-amber-500 scale-110 -translate-y-2 shadow-amber-400/50 z-20 brightness-105'
                    : 'hover:-translate-y-1 hover:scale-105'
                }`}
              >
                {/* Letter */}
                <span className="text-xl sm:text-2xl font-black font-serif text-[#2b180d] leading-none mt-1">
                  {isBlankWildcard ? '★' : tile.letter}
                </span>

                {/* Scrabble Point Subscript */}
                <span className="text-[9px] sm:text-[10px] font-black text-[#78350f] self-end mr-1 leading-none font-sans">
                  {isBlankWildcard ? 'W' : tile.points}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* RACK UTILITY PILL BUTTONS */}
      <div className="flex items-center justify-center gap-2 pt-0.5">
        <button
          onClick={onShuffle}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-[#e2d3bc] text-xs font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40 shadow-sm"
          title="Shuffle tiles on rack"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-600" />
          <span>Shuffle</span>
        </button>

        <button
          onClick={onRecall}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-[#e2d3bc] text-xs font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40 shadow-sm"
          title="Recall placed tiles from board back to rack"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span>Recall</span>
        </button>

        <button
          onClick={onOpenSwapModal}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-[#e2d3bc] text-xs font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40 shadow-sm"
          title="Swap unwanted tiles with the bag"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          <span>Swap</span>
        </button>
      </div>
    </div>
  );
}
