'use client';

import React, { useState, useRef } from 'react';
import { ScrabbleTile } from '@/lib/scrabbleEngine';
import { Shuffle, RotateCcw, RefreshCw, Sparkles, Hand } from 'lucide-react';

interface TileRackProps {
  rack: ScrabbleTile[];
  selectedTile: ScrabbleTile | null;
  isTargetingBlessing?: boolean;
  onSelectTile: (tile: ScrabbleTile) => void;
  onShuffle: () => void;
  onRecall: () => void;
  onOpenSwapModal: () => void;
  onDropTileOnSquare?: (row: number, col: number, tile: ScrabbleTile) => void;
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
  onDropTileOnSquare,
  disabled = false,
}: TileRackProps) {
  const [touchDraggingTile, setTouchDraggingTile] = useState<ScrabbleTile | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const activeTouchTileRef = useRef<ScrabbleTile | null>(null);

  // Desktop HTML5 Drag Start
  const handleDragStart = (e: React.DragEvent, tile: ScrabbleTile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tile));
    e.dataTransfer.setData('text/plain', JSON.stringify(tile));
    e.dataTransfer.effectAllowed = 'move';
    onSelectTile(tile);
  };

  // Mobile Touch Drag handlers
  const handleTouchStart = (e: React.TouchEvent, tile: ScrabbleTile) => {
    if (disabled || isTargetingBlessing) return;
    activeTouchTileRef.current = tile;
    const touch = e.touches[0];
    setTouchDraggingTile(tile);
    setTouchPos({ x: touch.clientX, y: touch.clientY });
    onSelectTile(tile);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!activeTouchTileRef.current) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });

    // Highlight cell under touch
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const squareEl = element?.closest('[data-board-square="true"]');
    if (squareEl) {
      squareEl.classList.add('ring-4', 'ring-amber-400');
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!activeTouchTileRef.current) return;
    const tile = activeTouchTileRef.current;
    const touch = e.changedTouches[0];

    // Find if released over a board square
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const squareEl = element?.closest('[data-board-square="true"]');
    if (squareEl && onDropTileOnSquare) {
      const row = parseInt(squareEl.getAttribute('data-square-row') || '-1', 10);
      const col = parseInt(squareEl.getAttribute('data-square-col') || '-1', 10);
      if (row >= 0 && col >= 0) {
        onDropTileOnSquare(row, col, tile);
      }
    }

    // Clean up
    setTouchDraggingTile(null);
    setTouchPos(null);
    activeTouchTileRef.current = null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none space-y-3 px-1">
      {/* FLOATING TOUCH DRAG GHOST (FOR MOBILE / TOUCHSCREENS) */}
      {touchDraggingTile && touchPos && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 w-14 h-18 sm:w-16 sm:h-20 rounded-2xl ivory-tile-3d flex flex-col items-center justify-between p-2 shadow-2xl scale-110 ring-4 ring-amber-400"
          style={{ left: touchPos.x, top: touchPos.y }}
        >
          <span className="text-2xl sm:text-3xl font-black font-serif text-[#1c1917]">
            {touchDraggingTile.isBlank ? '★' : touchDraggingTile.letter}
          </span>
          <span className="text-xs font-black text-[#92400e] self-end">
            {touchDraggingTile.isBlank ? 'W' : touchDraggingTile.points}
          </span>
        </div>
      )}

      {/* EXPANDED PURE WHITE & GOLD RACK PEDESTAL */}
      <div className="w-full p-3.5 sm:p-5 rounded-3xl temple-board-bezel relative flex items-center justify-center gap-2 sm:gap-4 shadow-xl">
        {/* Rack Gold Highlight Ridges */}
        <div className="absolute top-1.5 left-6 right-6 h-1 bg-amber-400/30 rounded-full blur-[0.5px] pointer-events-none" />
        <div className="absolute bottom-2 left-6 right-6 h-1.5 bg-amber-600/10 rounded-full pointer-events-none" />

        {rack.length === 0 ? (
          <span className="text-xs sm:text-sm text-amber-900/80 italic py-4 font-serif font-bold">
            All tiles placed on the board! Press “Play Word” to submit your score.
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
                onTouchStart={(e) => handleTouchStart(e, tile)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => !disabled && onSelectTile(tile)}
                className={`w-12 h-16 sm:w-16 sm:h-20 lg:w-18 lg:h-22 rounded-2xl flex flex-col items-center justify-between p-2 cursor-grab active:cursor-grabbing transform transition-all select-none relative ${
                  isBlankWildcard
                    ? 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 border-2 border-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.8)] text-slate-950 font-black ring-4 ring-yellow-400'
                    : 'ivory-tile-3d'
                } ${
                  isTargetingBlessing
                    ? 'ring-4 ring-yellow-400 animate-pulse hover:scale-110 cursor-pointer shadow-yellow-500/50'
                    : isSelected
                    ? 'ring-4 ring-amber-500 scale-110 -translate-y-3 shadow-amber-400/60 z-20 brightness-105'
                    : 'hover:-translate-y-1.5 hover:scale-105'
                }`}
                title={`Drag tile to board or click to select (${tile.letter} - ${tile.points} pts)`}
              >
                {/* Letter */}
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-[#1c1917] leading-none mt-1">
                  {isBlankWildcard ? '★' : tile.letter}
                </span>

                {/* Scrabble Point Subscript */}
                <span className="text-[10px] sm:text-xs lg:text-sm font-black text-[#92400e] self-end mr-1 leading-none font-sans">
                  {isBlankWildcard ? 'W' : tile.points}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* RACK UTILITY PILL BUTTONS */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
        <button
          onClick={onShuffle}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-amber-50 border border-[#e2d3bc] text-xs sm:text-sm font-serif font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40 shadow-sm"
          title="Shuffle tiles on rack"
        >
          <Shuffle className="w-4 h-4 text-amber-600" />
          <span>Shuffle</span>
        </button>

        <button
          onClick={onRecall}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-amber-50 border border-[#e2d3bc] text-xs sm:text-sm font-serif font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40 shadow-sm"
          title="Recall placed tiles from board back to rack"
        >
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <span>Recall</span>
        </button>

        <button
          onClick={onOpenSwapModal}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-amber-50 border border-[#e2d3bc] text-xs sm:text-sm font-serif font-bold text-[#78350f] transition active:scale-95 disabled:opacity-40 shadow-sm"
          title="Swap unwanted tiles with the bag"
        >
          <RefreshCw className="w-4 h-4 text-amber-600" />
          <span>Swap</span>
        </button>
      </div>
    </div>
  );
}
