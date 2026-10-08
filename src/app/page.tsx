'use client';

import React, { useState, Suspense } from 'react';
import ScrabbleGame from '@/components/scrabble/ScrabbleGame';
import SettingsModal from '@/components/modals/SettingsModal';
import ToastContainer from '@/components/ui/ToastContainer';

function ScrabbleMainApp() {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950 pb-8">
      {/* Main Scrabble Experience */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <ScrabbleGame />
      </main>

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Game Settings */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-amber-400 font-black text-lg">
          Loading Scripture Scrabble...
        </div>
      }
    >
      <ScrabbleMainApp />
    </Suspense>
  );
}
