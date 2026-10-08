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

  // Helper for multiplier badge colors matching the Twitter showcase mockup
  const getMultiplierStyle = (multiplier: MultiplierType) => {
    switch (multiplier) {
      case 'TW':
        return 'neon-tw-tile'; // Red 3W
      case 'DW':
        return 'neon-dw-tile'; // Pink 2W
      case 'TL':
        return 'neon-tl-tile'; // Dark Blue 3L
      case 'DL':
        return 'neon-dl-tile'; // Light Blue 2L
      case 'CENTER':
        return 'neon-center-star'; // Gold Center Star
      default:
        return 'wood-grid-square text-amber-200/40';
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
      <div className="grid grid-cols-[20px_repeat(15,1fr)] w-full text-center text-[10px] sm:text-xs font-serif font-black text-[#854d0e] mb-1">
        <div /> {/* Top-left empty corner */}
        {COLUMN_HEADERS.map((col) => (
          <div key={col} className="py-0.5 tracking-wider">
            {col}
          </div>
        ))}
      </div>

      {/* 15x15 BOARD GRID WITH 3D WALNUT WOOD FRAME */}
      <div
        className={`w-full p-2 sm:p-3 rounded-2xl wood-board-bezel relative transition-all duration-500 ${
          isPentecostActive
            ? 'ring-4 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.6)]'
            : ''
        }`}
      >
        {/* Golden Corner Stud Accents */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />

        <div className="grid grid-cols-[20px_repeat(15,1fr)] gap-[1.5px] sm:gap-[2.5px]">
          {board.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {/* ROW NUMBER (1-15) */}
              <div className="flex items-center justify-center text-[10px] sm:text-xs font-serif font-black text-amber-400/90 pr-0.5">
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
                    className={`aspect-square rounded-[3px] sm:rounded-md flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${
                      canClearTile
                        ? 'bg-cyan-950/90 border border-cyan-400 ring-2 ring-cyan-400 animate-pulse hover:bg-red-900 hover:border-red-400 z-20'
                        : isHighlighted
                        ? 'ring-2 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.95)] z-20 animate-pulse'
                        : ''
                    } ${
                      tile
                        ? isTemp
                          ? 'ivory-tile-3d ivory-tile-temp transform scale-105 z-10'
                          : tile.isBlank
                          ? 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 border-2 border-yellow-300 text-slate-950 shadow-md ring-1 ring-yellow-400'
                          : 'ivory-tile-3d'
                        : selectedRackTile
                        ? `${multStyle} hover:brightness-125 hover:border-amber-300`
                        : multStyle
                    }`}
                  >
                    {/* TILE LETTER & SCRABBLE POINTS */}
                    {tile ? (
                      <>
                        <span className="text-xs sm:text-base font-black font-serif text-[#2b180d] leading-none">
                          {tile.isBlank ? '★' : tile.letter}
                        </span>
                        <span className="text-[6px] sm:text-[8px] font-bold text-[#78350f] absolute bottom-0.5 right-0.5 leading-none font-sans">
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
                        className={`text-[8px] sm:text-[10px] font-black leading-none ${
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
