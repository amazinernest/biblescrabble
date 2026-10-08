'use client';

import React from 'react';
import { FAITH_DIFFICULTIES, FaithDifficulty } from '@/lib/scrabbleEngine';
import { X, Sparkles, Shield, Check } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';

interface FaithLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: FaithDifficulty;
  onSelectDifficulty: (difficulty: FaithDifficulty) => void;
}

export const FaithLevelModal: React.FC<FaithLevelModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
  onSelectDifficulty,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-300 shadow-2xl p-5 sm:p-6 text-slate-800 relative space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            audioEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 text-2xl shadow-inner mb-1">
            🕊️
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faith Difficulty Level
          </h3>
          <p className="text-xs text-slate-500">
            Choose the depth of wisdom and word challenge for Solomon AI.
          </p>
        </div>

        {/* Difficulty Options List */}
        <div className="space-y-2.5 pt-1">
          {FAITH_DIFFICULTIES.map((diff) => {
            const isSelected = currentDifficulty === diff.id;

            return (
              <button
                key={diff.id}
                onClick={() => {
                  audioEngine.playPowerup();
                  onSelectDifficulty(diff.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-md'
                    : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                    {diff.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-900">{diff.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {diff.subtitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{diff.description}</p>
                    <p className="text-[9px] text-amber-700 italic font-serif mt-0.5">{diff.verse}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-sm flex-shrink-0 ml-2">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
