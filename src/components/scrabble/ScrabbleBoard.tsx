'use client';

import React from 'react';
import {
  BoardSquare,
  PlacedTile,
  ScrabbleTile,
  BOARD_SIZE,
  MultiplierType,
} from '@/lib/scrabbleEngine';

interface ScrabbleBoardProps {
  board: BoardSquare[][];
  tempPlacements: PlacedTile[];
  selectedRackTile: ScrabbleTile | null;
  highlightedSquares?: { row: number; col: number }[];
  isTargetingClear?: boolean;
  isPentecostActive?: boolean;
  onSquareClick: (row: number, col: number) => void;
  onDropTileOnSquare: (row: number, col: number, tile: ScrabbleTile) => void;
  onSelectPlacedTile: (placed: PlacedTile) => void;
}

const COLUMN_HEADERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

export default function ScrabbleBoard({
  board,
  tempPlacements,
  selectedRackTile,
  highlightedSquares = [],
  isTargetingClear = false,
  isPentecostActive = false,
  onSquareClick,
  onDropTileOnSquare,
  onSelectPlacedTile,
}: ScrabbleBoardProps) {
  // Check if a tile is currently placed as a temp placement on this turn
  const getTempPlacement = (r: number, c: number) => {
    return tempPlacements.find((p) => p.row === r && p.col === c) || null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    try {
      const tileDataStr = e.dataTransfer.getData('application/json');
      if (tileDataStr) {
        const tile: ScrabbleTile = JSON.parse(tileDataStr);
        onDropTileOnSquare(r, c, tile);
      }
    } catch (err) {
      console.warn('Drop error:', err);
    }
  };

  // Helper for multiplier badge colors
  const getMultiplierStyle = (multiplier: MultiplierType) => {
    switch (multiplier) {
      case 'TW':
        return 'bg-gradient-to-br from-red-600 via-red-500 to-rose-700 text-white border-red-400/60 shadow-inner font-black'; // Red 3W
      case 'DW':
        return 'bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 text-white border-pink-300/60 shadow-inner font-black'; // Pink 2W
      case 'TL':
        return 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-400/60 shadow-inner font-black'; // Dark Blue 3L
      case 'DL':
        return 'bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 text-slate-950 border-sky-200/80 shadow-inner font-black'; // Light Blue 2L
      case 'CENTER':
        return 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-yellow-200 shadow-inner font-black'; // Center Star (Gold)
      default:
        return 'bg-[#0f172a] border-slate-800/80 text-slate-500/70';
    }
  };

  const getMultiplierLabel = (multiplier: MultiplierType) => {
    switch (multiplier) {
      case 'TW':
        return '3W';
      case 'DW':
        return '2W';
      case 'TL':
        return '3L';
      case 'DL':
        return '2L';
      case 'CENTER':
        return '★';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-[620px] mx-auto">
      {/* COLUMN HEADERS (A-O) */}
      <div className="grid grid-cols-[20px_repeat(15,1fr)] w-full text-center text-[9px] sm:text-[10px] font-bold text-amber-300/90 mb-0.5">
        <div /> {/* Top-left empty corner */}
        {COLUMN_HEADERS.map((col) => (
          <div key={col} className="py-0.5 font-mono">
            {col}
          </div>
        ))}
      </div>

      {/* 15x15 BOARD GRID */}
      <div className={`w-full p-1.5 sm:p-2.5 rounded-2xl border-4 border-[#78350f] shadow-2xl relative transition-all duration-500 ${
        isPentecostActive
          ? 'bg-gradient-to-b from-[#1a0f08] via-[#0d0914] to-[#120703] ring-4 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.5)]'
          : 'bg-gradient-to-b from-[#1a140d] via-[#0a0f1d] to-[#0f172a] ring-1 ring-amber-500/30'
      }`}>
        {/* Golden Corner Stud Accents */}
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />

        <div className="grid grid-cols-[20px_repeat(15,1fr)] gap-[1.5px] sm:gap-[2px]">
          {board.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {/* ROW NUMBER (1-15) */}
              <div className="flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold text-amber-300/90">
                {rIdx + 1}
              </div>

              {/* 15 SQUARES IN THIS ROW */}
              {row.map((sq, cIdx) => {
                const tempPlaced = getTempPlacement(rIdx, cIdx);
                const tile = tempPlaced ? tempPlaced.tile : sq.tile;
                const isTemp = !!tempPlaced;
                const isCenter = rIdx === 7 && cIdx === 7;
                const label = getMultiplierLabel(sq.multiplier);
                const multStyle = getMultiplierStyle(sq.multiplier);

                const isHighlighted = highlightedSquares.some((h) => h.row === rIdx && h.col === cIdx);
                const canClearTile = isTargetingClear && !!sq.tile && !isTemp;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => {
                      if (tempPlaced) {
                        onSelectPlacedTile(tempPlaced);
                      } else {
                        onSquareClick(rIdx, cIdx);
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                    className={`aspect-square rounded-[3px] sm:rounded-md border flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${
                      canClearTile
                        ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400 animate-pulse hover:bg-red-900 hover:border-red-400'
                        : isHighlighted
                        ? 'ring-2 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)] z-10 animate-pulse'
                        : ''
                    } ${
                      tile
                        ? isTemp
                          ? 'scrabble-tile-temp transform scale-105 z-10'
                          : tile.isBlank
                          ? 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 border-2 border-yellow-300 text-slate-950 shadow-md ring-1 ring-yellow-400'
                          : 'scrabble-tile-3d text-slate-950'
                        : selectedRackTile
                        ? `${multStyle} hover:brightness-125 hover:border-amber-300`
                        : multStyle
                    }`}
                  >
                    {/* TILE LETTER & SCRABBLE POINTS */}
                    {tile ? (
                      <>
                        <span className="text-xs sm:text-base font-black font-serif text-slate-950 leading-none">
                          {tile.isBlank ? '★' : tile.letter}
                        </span>
                        <span className="text-[6px] sm:text-[8px] font-bold text-amber-900 absolute bottom-0.5 right-0.5 leading-none">
                          {tile.isBlank ? 'W' : tile.points}
                        </span>
                        {canClearTile && (
                          <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 rounded-full w-3.5 h-3.5 flex items-center justify-center text-white font-bold">
                            ✕
                          </span>
                        )}
                      </>
                    ) : (
                      /* EMPTY SQUARE WITH MULTIPLIER LABEL OR CENTER STAR */
                      <span
                        className={`text-[7px] sm:text-[9px] font-black leading-none ${
                          isCenter ? 'text-amber-950 text-xs sm:text-sm animate-pulse' : ''
                        }`}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
