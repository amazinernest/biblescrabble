'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Target,
  Shield,
  Flame,
  Zap,
  Gift,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlingshotTarget {
  id: number;
  text: string;
  isCorrect: boolean;
  baseX: number; // percentage
  baseY: number; // percentage
  speedX?: number; // oscillation speed
  speedY?: number;
  ampX?: number;
  ampY?: number;
  isBonus?: boolean; // golden jar or bonus
  hit: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

const CAMPAIGN_LEVELS = [
  {
    title: 'Trial 1: The Valley of Elah',
    boss: 'Goliath of Gath',
    bossEmoji: '🛡️',
    question: 'Where did David strike Goliath with his sling?',
    reference: '1 Samuel 17:49',
    targets: [
      { id: 1, text: 'Forehead', isCorrect: true, baseX: 50, baseY: 22, ampX: 12, speedX: 0.03, hit: false },
      { id: 2, text: 'Bronze Chestplate', isCorrect: false, baseX: 25, baseY: 42, ampX: 8, speedX: 0.02, hit: false },
      { id: 3, text: 'Iron Spear Tip', isCorrect: false, baseX: 75, baseY: 42, ampX: 8, speedX: -0.02, hit: false },
      { id: 4, text: '🪙 +50 Coins', isCorrect: false, isBonus: true, baseX: 12, baseY: 18, ampX: 20, speedX: 0.04, hit: false },
    ],
  },
  {
    title: 'Trial 2: The Brook of Smooth Stones',
    boss: 'Philistine Vanguard',
    bossEmoji: '⚔️',
    question: 'How many smooth stones did David choose from the brook?',
    reference: '1 Samuel 17:40',
    targets: [
      { id: 1, text: '7 Stones', isCorrect: false, baseX: 20, baseY: 30, ampY: 10, speedY: 0.03, hit: false },
      { id: 2, text: '5 Smooth Stones', isCorrect: true, baseX: 50, baseY: 20, ampX: 18, speedX: 0.035, hit: false },
      { id: 3, text: '3 Stones', isCorrect: false, baseX: 80, baseY: 32, ampY: 10, speedY: -0.03, hit: false },
      { id: 4, text: '12 Stones', isCorrect: false, baseX: 50, baseY: 48, ampX: 10, speedX: -0.02, hit: false },
      { id: 5, text: '🏺 Bonus Pot', isCorrect: false, isBonus: true, baseX: 88, baseY: 16, ampX: 15, speedX: 0.05, hit: false },
    ],
  },
  {
    title: 'Trial 3: The King’s Armor Refusal',
    boss: 'Saul’s Armory',
    bossEmoji: '👑',
    question: 'Whose heavy armor did David try on before taking his sling instead?',
    reference: '1 Samuel 17:38-39',
    targets: [
      { id: 1, text: 'King Saul', isCorrect: true, baseX: 50, baseY: 25, ampX: 22, speedX: 0.04, hit: false },
      { id: 2, text: 'Jonathan', isCorrect: false, baseX: 22, baseY: 40, ampX: 10, speedX: 0.02, hit: false },
      { id: 3, text: 'Samuel', isCorrect: false, baseX: 78, baseY: 40, ampX: 10, speedX: -0.02, hit: false },
      { id: 4, text: '🪙 +50 Coins', isCorrect: false, isBonus: true, baseX: 50, baseY: 12, ampX: 30, speedX: 0.06, hit: false },
    ],
  },
  {
    title: 'Trial 4: The Weapon of the Giant',
    boss: 'Philistine Champion',
    bossEmoji: '🗡️',
    question: 'What weapon did David take from Goliath after he fell?',
    reference: '1 Samuel 17:51',
    targets: [
      { id: 1, text: 'Goliath’s Sword', isCorrect: true, baseX: 50, baseY: 20, ampX: 25, speedX: 0.045, hit: false },
      { id: 2, text: 'Bronze Javelin', isCorrect: false, baseX: 25, baseY: 42, ampY: 12, speedY: 0.03, hit: false },
      { id: 3, text: 'Golden Bow', isCorrect: false, baseX: 75, baseY: 42, ampY: 12, speedY: -0.03, hit: false },
      { id: 4, text: '🪨 +2 Stones', isCorrect: false, isBonus: true, baseX: 15, baseY: 25, ampX: 20, speedX: 0.05, hit: false },
    ],
  },
  {
    title: 'Trial 5: The Victor’s Declaration',
    boss: 'Apex Goliath Battle',
    bossEmoji: '🏆',
    question: 'David said: “You come with sword and spear, but I come to you in the name of...”',
    reference: '1 Samuel 17:45',
    targets: [
      { id: 1, text: 'The Lord Almighty', isCorrect: true, baseX: 50, baseY: 18, ampX: 28, speedX: 0.05, hit: false },
      { id: 2, text: 'The Army of Judah', isCorrect: false, baseX: 20, baseY: 38, ampX: 15, speedX: 0.03, hit: false },
      { id: 3, text: 'My Father Jesse', isCorrect: false, baseX: 80, baseY: 38, ampX: 15, speedX: -0.03, hit: false },
      { id: 4, text: 'King Saul’s Decree', isCorrect: false, baseX: 50, baseY: 52, ampX: 12, speedX: -0.03, hit: false },
      { id: 5, text: '⭐ +1000 Pts', isCorrect: false, isBonus: true, baseX: 90, baseY: 14, ampX: 25, speedX: 0.07, hit: false },
    ],
  },
];

export default function SlingshotStrike({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useGame();
  const [levelIdx, setLevelIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [stonesLeft, setStonesLeft] = useState<number>(6);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Slingshot Pull & Drag State
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [slingshotPos, setSlingshotPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stoneFlight, setStoneFlight] = useState<{ x: number; y: number; vx: number; vy: number; isFever: boolean } | null>(null);

  // Floating score tags & particles
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animTime, setAnimTime] = useState<number>(0);

  const arenaRef = useRef<HTMLDivElement>(null);
  const currentLevel = CAMPAIGN_LEVELS[levelIdx % CAMPAIGN_LEVELS.length];
  const [targets, setTargets] = useState<SlingshotTarget[]>(currentLevel.targets);

  const isFeverMode = combo >= 3;

  // Initialize targets on level change
  useEffect(() => {
    setTargets(
      CAMPAIGN_LEVELS[levelIdx % CAMPAIGN_LEVELS.length].targets.map((t) => ({
        ...t,
        hit: false,
      }))
    );
  }, [levelIdx]);

  // Game Loop: Target Oscillations & Particles
  useEffect(() => {
    const loop = setInterval(() => {
      setAnimTime((t) => t + 1);

      // Update particle physics
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3, // gravity
            alpha: p.alpha - 0.04,
          }))
          .filter((p) => p.alpha > 0)
      );

      // Clean old floating texts
      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({ ...ft, y: ft.y - 1 }))
          .filter((ft) => ft.y > 0)
      );
    }, 30);

    return () => clearInterval(loop);
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count: number = 18) => {
    const newParts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      newParts.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color,
        size: Math.random() * 6 + 3,
        alpha: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParts]);
  };

  const addFloatingText = (text: string, x: number, y: number, color: string = '#fde047') => {
    setFloatingTexts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, x, y, color },
    ]);
  };

  // Trajectory Prediction Dots
  const trajectoryDots = useMemo(() => {
    if (!isAiming) return [];
    const dots: { x: number; y: number }[] = [];
    const vx = -slingshotPos.x * 0.9;
    const vy = -slingshotPos.y * 1.3 - 22;

    let px = 50;
    let py = 84;

    for (let step = 1; step <= 14; step++) {
      px += vx * 0.09;
      py += vy * 0.09 + step * 0.45; // simulated gravity curve
      dots.push({ x: px, y: py });
    }
    return dots;
  }, [isAiming, slingshotPos]);

  // Pointer Events for Slingshot Pull
  const handlePointerDown = (e: React.PointerEvent) => {
    if (stonesLeft <= 0 || stoneFlight || isGameOver || isWon) return;
    setIsAiming(true);
    updateSlingshotPull(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAiming) return;
    updateSlingshotPull(e);
  };

  const updateSlingshotPull = (e: React.PointerEvent) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height - 75;

    const pullX = Math.max(-110, Math.min(110, e.clientX - rect.left - centerX));
    const pullY = Math.max(0, Math.min(110, e.clientY - rect.top - centerY));

    setSlingshotPos({ x: pullX, y: pullY });
  };

  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 300);
  };

  const handlePointerUp = () => {
    if (!isAiming) return;
    setIsAiming(false);

    if (Math.abs(slingshotPos.x) < 12 && slingshotPos.y < 12) {
      setSlingshotPos({ x: 0, y: 0 });
      return;
    }

    // Launch Stone!
    audioEngine.playCriticalHit();
    setStonesLeft((s) => s - 1);

    const launchVx = -slingshotPos.x * 0.9;
    const launchVy = -slingshotPos.y * 1.3 - 22;
    const activeFever = isFeverMode;

    let curX = 50;
    let curY = 84;
    let step = 0;

    setStoneFlight({ x: curX, y: curY, vx: launchVx, vy: launchVy, isFever: activeFever });
    setSlingshotPos({ x: 0, y: 0 });

    const flightInterval = setInterval(() => {
      step++;
      curX += launchVx * 0.085;
      curY += launchVy * 0.085 + step * 0.42;

      setStoneFlight({ x: curX, y: curY, vx: launchVx, vy: launchVy, isFever: activeFever });

      // Spawn stone trail spark
      if (Math.random() < 0.6) {
        spawnParticles(curX, curY, activeFever ? '#f97316' : '#fef08a', 2);
      }

      // Check collision with animated targets
      targets.forEach((target) => {
        if (!target.hit) {
          // Calculate dynamic target position
          const curTargetX = target.baseX + (target.ampX ? Math.sin(animTime * (target.speedX || 0.03)) * target.ampX : 0);
          const curTargetY = target.baseY + (target.ampY ? Math.cos(animTime * (target.speedY || 0.03)) * target.ampY : 0);

          const dist = Math.hypot(curX - curTargetX, curY - curTargetY);
          if (dist < 8.5) {
            clearInterval(flightInterval);
            setStoneFlight(null);
            triggerScreenShake();

            // MARK TARGET HIT
            setTargets((prev) =>
              prev.map((t) => (t.id === target.id ? { ...t, hit: true } : t))
            );

            if (target.isBonus) {
              // BONUS POT STRUCK!
              audioEngine.playCoin();
              spawnParticles(curX, curY, '#fbbf24', 25);
              addFloatingText('BONUS 🪙 +50 & 🪨 +1', curX, curY - 5, '#fbbf24');
              setScore((s) => s + 500);
              setStonesLeft((s) => s + 1);
              updateProfile({ wisdomCoins: profile.wisdomCoins + 50 });
            } else if (target.isCorrect) {
              // CORRECT HIT!
              const nextCombo = combo + 1;
              setCombo(nextCombo);
              const comboBonus = nextCombo >= 3 ? 3 : nextCombo >= 2 ? 2 : 1;
              const ptsEarned = 350 * comboBonus;

              audioEngine.playCorrect(nextCombo);
              spawnParticles(curX, curY, '#34d399', 30);
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.4 } });

              addFloatingText(`BULLSEYE! +${ptsEarned} PTS 🎯`, curX, curY - 5, '#34d399');
              if (nextCombo >= 3) {
                addFloatingText('🔥 HOLY FIRE FEVER ACTIVE!', 50, 40, '#f97316');
              }

              setScore((s) => s + ptsEarned);

              setTimeout(() => {
                if (levelIdx + 1 < CAMPAIGN_LEVELS.length) {
                  setLevelIdx((l) => l + 1);
                  setStonesLeft((s) => Math.min(8, s + 3)); // reward extra stones on level advance
                } else {
                  setIsWon(true);
                  audioEngine.playLevelComplete();
                  confetti({ particleCount: 150, spread: 90 });
                  updateProfile({
                    wisdomCoins: profile.wisdomCoins + 350,
                    xp: profile.xp + 700,
                  });
                }
              }, 1100);
            } else {
              // WRONG TARGET
              audioEngine.playWrong();
              setCombo(0);
              spawnParticles(curX, curY, '#f87171', 20);
              addFloatingText('MISS! ⚔️', curX, curY - 5, '#f87171');

              if (stonesLeft <= 1) {
                setIsGameOver(true);
              }
            }
          }
        }
      });

      // Out of bounds
      if (curY < 4 || curY > 96 || curX < 4 || curX > 96) {
        clearInterval(flightInterval);
        setStoneFlight(null);
        setCombo(0);
        if (stonesLeft <= 1) {
          setIsGameOver(true);
        }
      }
    }, 28);
  };

  const handleRestart = () => {
    setLevelIdx(0);
    setScore(0);
    setCombo(0);
    setStonesLeft(6);
    setIsGameOver(false);
    setIsWon(false);
    setStoneFlight(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4 animate-fade-in text-slate-100">
      {/* 1. TOP HEADER HUD */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              {currentLevel.title}
            </span>
            {isFeverMode && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 animate-bounce">
                🔥 FEVER x3
              </span>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-black text-white">
            DAVID’S SLINGSHOT STRIKE
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            <span>Score: {score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200">
            <span>🪨 {stonesLeft} Stones</span>
          </div>
        </div>
      </div>

      {/* 2. SCRIPTURE QUESTION BANNER */}
      <div className="game-panel rounded-2xl p-4 text-center border border-amber-500/30 space-y-1 relative overflow-hidden">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
            {currentLevel.reference}
          </span>
          <span className="text-[10px] font-black uppercase text-slate-400">
            Boss: {currentLevel.boss} {currentLevel.bossEmoji}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-white">
          {currentLevel.question}
        </h3>
        <p className="text-[11px] text-amber-200/80 font-medium">
          Drag down the slingshot pouch, use the trajectory guide, and release to strike the bullseye!
        </p>
      </div>

      {/* 3. PHYSICAL 2D ARCADE ARENA */}
      <div
        ref={arenaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-full h-[450px] rounded-3xl bg-gradient-to-b from-[#151c38] via-[#1a122e] to-[#0d0f1c] border-2 border-amber-500/50 shadow-2xl overflow-hidden cursor-crosshair touch-none select-none ${
          isScreenShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Valley of Elah Background Aura & Boss Silhouette */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <span className="text-9xl select-none filter blur-sm">{currentLevel.bossEmoji}</span>
        </div>

        {/* FEVER MODE GLOW OVERLAY */}
        {isFeverMode && (
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-amber-500/10 pointer-events-none animate-pulse" />
        )}

        {/* FLOATING PARTICLES CANVAS/ELEMENTS */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              boxShadow: `0 0 8px ${p.color}`,
            }}
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          />
        ))}

        {/* FLOATING TEXT TOKENS */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color }}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-black text-sm uppercase drop-shadow-md pointer-events-none animate-pop z-30"
          >
            {ft.text}
          </div>
        ))}

        {/* OSCILLATING TARGETS */}
        {targets.map((target) => {
          const posX = target.baseX + (target.ampX ? Math.sin(animTime * (target.speedX || 0.03)) * target.ampX : 0);
          const posY = target.baseY + (target.ampY ? Math.cos(animTime * (target.speedY || 0.03)) * target.ampY : 0);

          return (
            <div
              key={target.id}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-2xl border-2 transition-transform shadow-xl text-center pointer-events-none ${
                target.hit
                  ? target.isCorrect || target.isBonus
                    ? 'bg-emerald-500/90 border-emerald-300 scale-125 animate-pop text-slate-950 font-black'
                    : 'bg-red-600/60 border-red-400 opacity-40 line-through'
                  : target.isBonus
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 border-yellow-200 text-slate-950 font-black ring-2 ring-yellow-300 animate-bounce'
                  : 'bg-slate-900/90 border-amber-400/80 text-white font-bold'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs">{target.isBonus ? '🏺' : '🎯'}</span>
                <span className="text-xs sm:text-sm font-black whitespace-nowrap">
                  {target.text}
                </span>
              </div>
            </div>
          );
        })}

        {/* TRAJECTORY PREDICTION DOTS */}
        {trajectoryDots.map((dot, idx) => (
          <div
            key={idx}
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, opacity: (14 - idx) / 14 }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none ${
              isFeverMode
                ? 'w-2.5 h-2.5 bg-orange-400 shadow-md shadow-orange-500'
                : 'w-2 h-2 bg-amber-300 shadow-sm shadow-amber-300'
            }`}
          />
        ))}

        {/* FLYING STONE */}
        {stoneFlight && (
          <div
            style={{ left: `${stoneFlight.x}%`, top: `${stoneFlight.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full z-30 flex items-center justify-center shadow-xl ${
              stoneFlight.isFever
                ? 'w-8 h-8 bg-gradient-to-tr from-red-500 via-orange-400 to-yellow-300 ring-4 ring-orange-300 animate-spin text-sm shadow-orange-500/80'
                : 'w-7 h-7 bg-gradient-to-tr from-amber-100 to-amber-500 border-2 border-white shadow-amber-400/60 text-xs'
            }`}
          >
            {stoneFlight.isFever ? '🔥' : '🪨'}
          </div>
        )}

        {/* SLINGSHOT RIG AT BOTTOM */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          {/* Elastic Rubber Bands */}
          <svg className="w-56 h-32 overflow-visible">
            <line
              x1="35"
              y1="45"
              x2={112 + slingshotPos.x}
              y2={45 + slingshotPos.y}
              stroke={isFeverMode ? '#f97316' : '#d97706'}
              strokeWidth={isFeverMode ? '7' : '5'}
            />
            <line
              x1="189"
              y1="45"
              x2={112 + slingshotPos.x}
              y2={45 + slingshotPos.y}
              stroke={isFeverMode ? '#f97316' : '#d97706'}
              strokeWidth={isFeverMode ? '7' : '5'}
            />
          </svg>

          {/* Leather Pouch / Held Stone */}
          <div
            style={{
              transform: `translate(${slingshotPos.x}px, ${slingshotPos.y - 82}px)`,
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-2xl transition-transform ${
              isAiming
                ? isFeverMode
                  ? 'bg-gradient-to-tr from-orange-500 to-amber-300 ring-4 ring-orange-300 scale-125'
                  : 'bg-amber-400 ring-4 ring-yellow-200 scale-110'
                : 'bg-slate-800 border-2 border-amber-400'
            }`}
          >
            {isFeverMode ? '🔥' : '🪨'}
          </div>

          {/* Wooden Fork Slingshot Post */}
          <div className="w-20 h-14 border-b-8 border-l-8 border-r-8 border-[#78350f] rounded-b-2xl shadow-2xl mt-[-50px]" />
          <div className="w-8 h-12 bg-[#78350f] rounded-b-xl shadow-lg" />
        </div>

        {/* AIM HELPER PROMPT */}
        {!isAiming && !stoneFlight && !isGameOver && !isWon && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center pointer-events-none animate-pulse">
            <span className="text-xs font-black uppercase text-amber-300 bg-slate-950/90 px-3.5 py-1.5 rounded-full border border-amber-400/50 shadow-xl">
              👇 Pull down stone & release to shoot
            </span>
          </div>
        )}

        {/* VICTORY OVERLAY */}
        {isWon && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pop z-40">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-2xl border-2 border-yellow-100">
              👑
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                ALL GIANTS DEFEATED!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                You mastered David’s slingshot across all 5 Historical Trials! Claimed <strong>+350 Coins</strong> and <strong>+700 XP</strong>.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="py-3 px-6 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="py-3 px-8 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
              >
                Return to Hub
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pop z-40">
            <div className="text-5xl">⚠️</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-red-400">OUT OF STONES!</h3>
              <p className="text-xs text-slate-300 max-w-xs">
                The giant withstood the trial. Focus your aim and strike the bullseye!
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="py-3 px-8 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="py-3 px-6 rounded-xl font-bold text-xs bg-slate-800 text-slate-300"
              >
                Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
