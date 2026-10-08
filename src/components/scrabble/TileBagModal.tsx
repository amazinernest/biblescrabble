'use client';

import React, { useState } from 'react';
import { ScrabbleTile, SCRABBLE_POINTS } from '@/lib/scrabbleEngine';
import { X, RefreshCw, Layers } from 'lucide-react';

interface TileBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tileBag: ScrabbleTile[];
  playerRack: ScrabbleTile[];
  onSwapTiles: (tilesToSwap: ScrabbleTile[]) => void;
  isSwapMode?: boolean;
}

export default function TileBagModal({
  isOpen,
  onClose,
  tileBag,
  playerRack,
  onSwapTiles,
  isSwapMode = false,
}: TileBagModalProps) {
  const [selectedForSwap, setSelectedForSwap] = useState<string[]>([]);

  if (!isOpen) return null;

  // Compute remaining distribution count
  const countsByLetter: Record<string, number> = {};
  tileBag.forEach((t) => {
    countsByLetter[t.letter] = (countsByLetter[t.letter] || 0) + 1;
  });

  const toggleSelectSwapTile = (id: string) => {
    setSelectedForSwap((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  const handleConfirmSwap = () => {
    const tiles = playerRack.filter((t) => selectedForSwap.includes(t.id));
    onSwapTiles(tiles);
    setSelectedForSwap([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#18233d] to-[#0c1222] rounded-3xl border-2 border-amber-500/60 shadow-2xl p-6 text-center text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/80 border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-black text-white">
            {isSwapMode ? 'Swap Tiles With Bag' : 'Sacred Tile Bag'}
          </h3>
        </div>

        {isSwapMode ? (
          /* SWAP TILES FROM RACK INTERFACE */
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Select the tiles from your rack you wish to trade into the bag for new letters.
            </p>

            <div className="flex flex-wrap justify-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              {playerRack.map((tile) => {
                const isSelected = selectedForSwap.includes(tile.id);
                return (
                  <button
                    key={tile.id}
                    onClick={() => toggleSelectSwapTile(tile.id)}
                    className={`w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-between p-1 transition-all ${
                      isSelected
                        ? 'bg-amber-400 border-yellow-200 text-slate-950 scale-105 ring-4 ring-amber-400/50'
                        : 'bg-slate-800 border-slate-700 text-white hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg font-black font-serif leading-none mt-1">
                      {tile.letter}
                    </span>
                    <span className="text-[8px] font-bold text-amber-900 self-end mr-1">
                      {tile.points}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmSwap}
              disabled={selectedForSwap.length === 0}
              className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl disabled:opacity-40"
            >
              Confirm Swap ({selectedForSwap.length} Tiles)
            </button>
          </div>
        ) : (
          /* TILE BAG REMAINING DISTRIBUTION */
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Total tiles remaining in bag: <strong className="text-amber-300">{tileBag.length}</strong>
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-left">
              {Object.keys(SCRABBLE_POINTS).map((char) => {
                const count = countsByLetter[char] || 0;
                return (
                  <div
                    key={char}
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      count > 0
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-serif font-black text-sm">
                      <span>{char}</span>
                      <span className="text-[9px] text-amber-400 font-sans">({SCRABBLE_POINTS[char]}p)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">×{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
