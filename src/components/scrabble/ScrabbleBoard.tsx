'use client';

import React, { useState } from 'react';
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
  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null);

  // Check if a tile is currently placed as a temp placement on this turn
  const getTempPlacement = (r: number, c: number) => {
    return tempPlacements.find((p) => p.row === r && p.col === c) || null;
  };

  const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverCell || dragOverCell.row !== r || dragOverCell.col !== c) {
      setDragOverCell({ row: r, col: c });
    }
  };

  const handleDragLeave = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    if (dragOverCell?.row === r && dragOverCell?.col === c) {
      setDragOverCell(null);
    }
  };

  const handleDrop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    setDragOverCell(null);
    try {
      const tileDataStr =
        e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (tileDataStr) {
        const tile: ScrabbleTile = JSON.parse(tileDataStr);
        onDropTileOnSquare(r, c, tile);
      }
    } catch (err) {
      console.warn('Drop error:', err);
    }
  };

  // Multiplier badge styling - Extra vibrant & legible on white
  const getMultiplierStyle = (multiplier: MultiplierType) => {
    switch (multiplier) {
      case 'TW':
        return 'neon-tw-tile'; // 3W Red
      case 'DW':
        return 'neon-dw-tile'; // 2W Pink
      case 'TL':
        return 'neon-tl-tile'; // 3L Royal Blue
      case 'DL':
        return 'neon-dl-tile'; // 2L Sky Blue
      case 'CENTER':
        return 'neon-center-star'; // Gold Star
      default:
        return 'white-grid-square text-amber-900/50';
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
    <div className="flex flex-col items-center justify-center select-none w-full max-w-[840px] mx-auto px-1 sm:px-2">
      {/* COLUMN HEADERS (A-O) - BOLDER & LARGER */}
      <div className="grid grid-cols-[24px_repeat(15,1fr)] sm:grid-cols-[28px_repeat(15,1fr)] w-full text-center text-xs sm:text-sm font-serif font-black text-[#854d0e] mb-1">
        <div /> {/* Top-left empty corner */}
        {COLUMN_HEADERS.map((col) => (
          <div key={col} className="py-0.5 tracking-wider font-extrabold">
            {col}
          </div>
        ))}
      </div>

      {/* 15x15 BOARD GRID WITH EXPANDED PURE WHITE MARBLE & GOLD FRAME */}
      <div
        className={`w-full p-2.5 sm:p-4 rounded-3xl temple-board-bezel relative transition-all duration-500 shadow-2xl ${
          isPentecostActive
            ? 'ring-4 ring-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.6)]'
            : ''
        }`}
      >
        {/* Golden Corner Stud Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-400 border border-yellow-200 shadow-sm pointer-events-none" />

        <div className="grid grid-cols-[24px_repeat(15,1fr)] sm:grid-cols-[28px_repeat(15,1fr)] gap-[2px] sm:gap-[3.5px]">
          {board.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {/* ROW NUMBER (1-15) - BOLDER & LARGER */}
              <div className="flex items-center justify-center text-xs sm:text-sm font-serif font-black text-[#854d0e] pr-1">
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
                const isHoveredDrag = dragOverCell?.row === rIdx && dragOverCell?.col === cIdx;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    data-board-square="true"
                    data-square-row={rIdx}
                    data-square-col={cIdx}
                    onClick={() => {
                      if (tempPlaced) {
                        onSelectPlacedTile(tempPlaced);
                      } else {
                        onSquareClick(rIdx, cIdx);
                      }
                    }}
                    onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
                    onDragLeave={(e) => handleDragLeave(e, rIdx, cIdx)}
                    onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                    className={`aspect-square rounded-[4px] sm:rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer select-none border ${
                      isHoveredDrag
                        ? 'ring-4 ring-amber-400 bg-amber-100 scale-105 z-30 shadow-lg shadow-amber-400/50'
                        : canClearTile
                        ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400 animate-pulse hover:bg-red-900 z-20'
                        : isHighlighted
                        ? 'ring-4 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.95)] z-20 animate-pulse'
                        : ''
                    } ${
                      tile
                        ? isTemp
                          ? 'ivory-tile-3d ivory-tile-temp transform scale-105 z-10'
                          : tile.isBlank
                          ? 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 border-2 border-yellow-300 text-slate-950 shadow-md ring-2 ring-yellow-400'
                          : 'ivory-tile-3d shadow-sm'
                        : selectedRackTile
                        ? `${multStyle} hover:brightness-110 hover:border-amber-400 hover:scale-105`
                        : multStyle
                    }`}
                  >
                    {/* TILE LETTER & SCRABBLE POINTS */}
                    {tile ? (
                      <>
                        <span className="text-sm sm:text-xl lg:text-2xl font-black font-serif text-[#1c1917] leading-none">
                          {tile.isBlank ? '★' : tile.letter}
                        </span>
                        <span className="text-[7px] sm:text-[10px] lg:text-xs font-black text-[#92400e] absolute bottom-0.5 right-0.5 leading-none font-sans">
                          {tile.isBlank ? 'W' : tile.points}
                        </span>
                        {canClearTile && (
                          <span className="absolute -top-1 -right-1 text-xs bg-red-600 rounded-full w-4 h-4 flex items-center justify-center text-white font-bold">
                            ✕
                          </span>
                        )}
                      </>
                    ) : (
                      /* EMPTY SQUARE WITH MULTIPLIER LABEL OR CENTER STAR */
                      <span
                        className={`text-[9px] sm:text-xs lg:text-sm font-black leading-none ${
                          isCenter ? 'text-amber-950 text-sm sm:text-lg animate-pulse' : ''
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
