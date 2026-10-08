'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import {
  BoardSquare,
  PlacedTile,
  ScrabbleTile,
  createEmptyBoard,
  createTileBag,
  drawTilesFromBag,
  validateAndScoreMove,
  findSolomonAIMove,
  BOARD_SIZE,
} from '@/lib/scrabbleEngine';
import { SCRIPTURE_DICTIONARY, ScriptureDefinition } from '@/lib/scrabbleDictionary';
import {
  GameModeType,
  multiplayer,
  MultiplayerMessage,
  GameSyncState,
} from '@/lib/multiplayerEngine';
import {
  MIRACLE_POWERS,
  MiraclePower,
  PlayerFaithState,
  INITIAL_FAITH_STATE,
  calculatePropheticHint,
} from '@/lib/miraclePowers';
import ScrabbleBoard from './ScrabbleBoard';
import TileRack from './TileRack';
import ScrabbleHUD from './ScrabbleHUD';
import { MiraclePowersBar } from './MiraclePowersBar';
import ScriptureWordModal from './ScriptureWordModal';
import TileBagModal from './TileBagModal';
import MultiplayerLobbyModal from './MultiplayerLobbyModal';
import PassAndPlayCurtain from './PassAndPlayCurtain';
import QuickReactions from './QuickReactions';
import { FloatingScorePop, FloatingPopEvent } from './FloatingScorePop';
import { Sparkles, Trophy, BookOpen, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScrabbleGameProps {
  onBack?: () => void;
}

export default function ScrabbleGame({ onBack }: ScrabbleGameProps) {
  const { profile, updateProfile, toggleSound } = useGame();
  const searchParams = useSearchParams();

  // 1. Core Board & Tile Bag State
  const [board, setBoard] = useState<BoardSquare[][]>(() => createEmptyBoard());
  const [tileBag, setTileBag] = useState<ScrabbleTile[]>(() => createTileBag());
  const [player1Rack, setPlayer1Rack] = useState<ScrabbleTile[]>([]);
  const [player2Rack, setPlayer2Rack] = useState<ScrabbleTile[]>([]);

  // 2. Mode & Names
  const [gameMode, setGameMode] = useState<GameModeType>('ai');
  const [player1Name, setPlayer1Name] = useState<string>('David');
  const [player2Name, setPlayer2Name] = useState<string>('Solomon AI');
  const [roomCode, setRoomCode] = useState<string>('');
  const [isOnlineConnected, setIsOnlineConnected] = useState<boolean>(false);

  // 3. Turn & Temp Move Placements
  const [tempPlacements, setTempPlacements] = useState<PlacedTile[]>([]);
  const [selectedRackTile, setSelectedRackTile] = useState<ScrabbleTile | null>(null);
  const [isFirstMove, setIsFirstMove] = useState<boolean>(true);
  const [isPlayer1Turn, setIsPlayer1Turn] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showPassCurtain, setShowPassCurtain] = useState<boolean>(false);

  // 4. Scores, Stats & Faith Points
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [player1Faith, setPlayer1Faith] = useState<PlayerFaithState>(INITIAL_FAITH_STATE);
  const [player2Faith, setPlayer2Faith] = useState<PlayerFaithState>(INITIAL_FAITH_STATE);
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // 5. Divine Miracle State
  const [targetingMode, setTargetingMode] = useState<'NONE' | 'PART_WATERS' | 'ARK_BLESSING'>('NONE');
  const [propheticHighlights, setPropheticHighlights] = useState<{ row: number; col: number }[]>([]);
  const [activePropheticWord, setActivePropheticWord] = useState<string | null>(null);

  // 6. Modals & Notifications
  const [activeRevealedLore, setActiveRevealedLore] = useState<ScriptureDefinition | null>(null);
  const [latestScoreEarned, setLatestScoreEarned] = useState<number | undefined>(undefined);
  const [activeFloatingPop, setActiveFloatingPop] = useState<FloatingPopEvent | null>(null);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(true);
  const [isBagModalOpen, setIsBagModalOpen] = useState<boolean>(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [incomingReaction, setIncomingReaction] = useState<{ emoji: string; text: string; sender: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMusic = () => {
    const next = !isMusicMuted;
    setIsMusicMuted(next);
    audioEngine.setMusicMuted(next);
  };

  // Determine current active rack based on mode & turn
  const currentActiveRack = useMemo(() => {
    if (gameMode === 'online_guest') {
      return player2Rack;
    }
    if (gameMode === 'pass_and_play') {
      return isPlayer1Turn ? player1Rack : player2Rack;
    }
    return player1Rack;
  }, [gameMode, isPlayer1Turn, player1Rack, player2Rack]);

  // Determine active player's faith state
  const currentActiveFaith = useMemo(() => {
    if (gameMode === 'online_guest') {
      return player2Faith;
    }
    if (gameMode === 'pass_and_play') {
      return isPlayer1Turn ? player1Faith : player2Faith;
    }
    return player1Faith;
  }, [gameMode, isPlayer1Turn, player1Faith, player2Faith]);

  const updateActiveFaith = (updater: (prev: PlayerFaithState) => PlayerFaithState) => {
    if (gameMode === 'online_guest') {
      setPlayer2Faith(updater);
    } else if (gameMode === 'pass_and_play') {
      if (isPlayer1Turn) setPlayer1Faith(updater);
      else setPlayer2Faith(updater);
    } else {
      setPlayer1Faith(updater);
    }
  };

  const isMyTurn = useMemo(() => {
    if (gameMode === 'ai') return isPlayer1Turn;
    if (gameMode === 'pass_and_play') return true;
    if (gameMode === 'online_host') return isPlayer1Turn;
    if (gameMode === 'online_guest') return !isPlayer1Turn;
    return true;
  }, [gameMode, isPlayer1Turn]);

  // Initialize Game Locally
  const initializeGame = useCallback(() => {
    const freshBag = createTileBag();
    const { drawn: p1Drawn, remainingBag: bag1 } = drawTilesFromBag(freshBag, 7);
    const { drawn: p2Drawn, remainingBag: bag2 } = drawTilesFromBag(bag1, 7);

    setBoard(createEmptyBoard());
    setTileBag(bag2);
    setPlayer1Rack(p1Drawn);
    setPlayer2Rack(p2Drawn);
    setPlayer1Faith(INITIAL_FAITH_STATE);
    setPlayer2Faith(INITIAL_FAITH_STATE);
    setTargetingMode('NONE');
    setPropheticHighlights([]);
    setActivePropheticWord(null);
    setTempPlacements([]);
    setSelectedRackTile(null);
    setIsFirstMove(true);
    setIsPlayer1Turn(true);
    setIsAiThinking(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setConsecutivePasses(0);
    setIsGameOver(false);
    setShowPassCurtain(false);

    // If host, sync state with guest
    if (gameMode === 'online_host') {
      multiplayer.send({
        type: 'GAME_INIT',
        senderName: player1Name,
        payload: {
          board: createEmptyBoard(),
          tileBag: bag2,
          hostRack: p1Drawn,
          guestRack: p2Drawn,
          hostScore: 0,
          guestScore: 0,
          isHostTurn: true,
          isFirstMove: true,
        },
      });
    }

    showToast('New Match Ready! Use Divine Miracles to unleash Holy Power.');
  }, [gameMode, player1Name]);

  // Handle URL ?room= query param on load
  useEffect(() => {
    const urlRoom = searchParams.get('room');
    if (urlRoom) {
      setRoomCode(urlRoom.toUpperCase());
      setGameMode('online_guest');
      setPlayer1Name('Host');
      setPlayer2Name('You');
      multiplayer.joinRoom(urlRoom).then(() => {
        setIsOnlineConnected(true);
        showToast(`Connected to Room ${urlRoom}!`);
      });
    } else {
      initializeGame();
    }
  }, [searchParams, initializeGame]);

  // Setup Multiplayer Listeners
  useEffect(() => {
    multiplayer.onConnect(() => {
      setIsOnlineConnected(true);
      showToast('🟢 Peer connected! Match is live.');
      audioEngine.playLevelComplete();
    });

    multiplayer.onDisconnect(() => {
      setIsOnlineConnected(false);
      showToast('🔴 Peer disconnected.');
    });

    multiplayer.onMessage((msg: MultiplayerMessage) => {
      if (msg.type === 'GAME_INIT') {
        const p = msg.payload as GameSyncState;
        setBoard(p.board);
        setTileBag(p.tileBag);
        setPlayer1Rack(p.hostRack);
        setPlayer2Rack(p.guestRack);
        setPlayer1Score(p.hostScore);
        setPlayer2Score(p.guestScore);
        setIsPlayer1Turn(p.isHostTurn);
        setIsFirstMove(p.isFirstMove);
        showToast(`Match synchronized with ${msg.senderName}!`);
      } else if (msg.type === 'MOVE_PLAYED') {
        const p = msg.payload;
        setBoard(p.board);
        setTileBag(p.tileBag);
        setPlayer1Score(p.hostScore);
        setPlayer2Score(p.guestScore);
        setIsPlayer1Turn(p.isHostTurn);
        setIsFirstMove(p.isFirstMove);
        setConsecutivePasses(0);
        audioEngine.playCriticalHit();

        if (p.latestLore) {
          setActiveRevealedLore(p.latestLore);
        }

        showToast(`${msg.senderName} played “${p.word}” for +${p.score} pts!`);
      } else if (msg.type === 'PASS_TURN') {
        setIsPlayer1Turn((prev) => !prev);
        audioEngine.playTick();
        showToast(`${msg.senderName} passed their turn.`);
      } else if (msg.type === 'REACTION') {
        setIncomingReaction({
          emoji: msg.payload.emoji,
          text: msg.payload.text,
          sender: msg.senderName,
        });
        audioEngine.playPowerup();
      }
    });

    return () => {
      multiplayer.cleanup();
    };
  }, []);

  // Mode Selection Handler
  const handleSelectMode = (mode: GameModeType, code?: string, p2Name?: string) => {
    setGameMode(mode);
    if (mode === 'ai') {
      setPlayer1Name('David');
      setPlayer2Name('Solomon AI');
      initializeGame();
    } else if (mode === 'pass_and_play') {
      setPlayer1Name('Player 1 (David)');
      setPlayer2Name(p2Name || 'Player 2 (Solomon)');
      initializeGame();
    } else if (mode === 'online_host' && code) {
      setRoomCode(code);
      setPlayer1Name('You (Host)');
      setPlayer2Name('Friend (Guest)');
      multiplayer.hostRoom(code).then(() => {
        initializeGame();
      });
    } else if (mode === 'online_guest' && code) {
      setRoomCode(code);
      setPlayer1Name('Host');
      setPlayer2Name('You');
      multiplayer.joinRoom(code).then(() => {
        setIsOnlineConnected(true);
        showToast(`Connected to room ${code}!`);
      });
    }
  };

  // Handle tile placement on board square
  const handlePlaceTileOnSquare = (row: number, col: number, tile: ScrabbleTile) => {
    if (!isMyTurn || isAiThinking || isGameOver) return;

    if (board[row][col].tile !== null) {
      showToast('Square is already occupied!');
      return;
    }

    const existingTemp = tempPlacements.find((p) => p.row === row && p.col === col);
    if (existingTemp) {
      updateActiveRack((prev) => [...prev.filter((t) => t.id !== tile.id), existingTemp.tile]);
      setTempPlacements((prev) => [
        ...prev.filter((p) => !(p.row === row && p.col === col)),
        { row, col, tile },
      ]);
    } else {
      updateActiveRack((prev) => prev.filter((t) => t.id !== tile.id));
      setTempPlacements((prev) => [...prev, { row, col, tile }]);
    }

    audioEngine.playClick();
    setSelectedRackTile(null);
  };

  // Helper to update active player's rack
  const updateActiveRack = (updater: (prev: ScrabbleTile[]) => ScrabbleTile[]) => {
    if (gameMode === 'online_guest') {
      setPlayer2Rack(updater);
    } else if (gameMode === 'pass_and_play') {
      if (isPlayer1Turn) setPlayer1Rack(updater);
      else setPlayer2Rack(updater);
    } else {
      setPlayer1Rack(updater);
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    // 1. Part the Waters targeting mode
    if (targetingMode === 'PART_WATERS') {
      if (board[row][col].tile !== null) {
        audioEngine.playPartWaters();
        const updatedBoard = board.map((r) => r.map((c) => ({ ...c })));
        const removedLetter = updatedBoard[row][col].tile?.letter;
        updatedBoard[row][col].tile = null;
        setBoard(updatedBoard);
        setTargetingMode('NONE');
        showToast(`🌊 Waters Parted: Dissolved tile “${removedLetter}” from board!`);
        return;
      }
      showToast('Select an occupied square to part!');
      return;
    }

    if (selectedRackTile) {
      handlePlaceTileOnSquare(row, col, selectedRackTile);
    }
  };

  const handleSelectRackTile = (tile: ScrabbleTile) => {
    // 2. Ark of the Covenant targeting mode
    if (targetingMode === 'ARK_BLESSING') {
      audioEngine.playMiracleActivate();
      updateActiveRack((prev) =>
        prev.map((t) => (t.id === tile.id ? { ...t, isBlank: true, points: 0, letter: '★' } : t))
      );
      setTargetingMode('NONE');
      showToast('🌟 Blessed: Tile transformed into a Golden Wildcard (★)!');
      return;
    }

    setSelectedRackTile((prev) => (prev?.id === tile.id ? null : tile));
  };

  // ACTIVATE DIVINE MIRACLE
  const handleActivateMiracle = (miracle: MiraclePower) => {
    if (!isMyTurn || currentActiveFaith.faithPoints < miracle.cost) return;

    // Deduct faith points
    updateActiveFaith((prev) => ({
      ...prev,
      faithPoints: Math.max(0, prev.faithPoints - miracle.cost),
    }));

    if (miracle.id === 'PROPHETIC_VISION') {
      audioEngine.playMiracleActivate();
      const hint = calculatePropheticHint(board, currentActiveRack);
      if (hint.found && hint.placements) {
        setPropheticHighlights(hint.placements.map((p) => ({ row: p.row, col: p.col })));
        setActivePropheticWord(hint.word || null);
        showToast(`💡 ${hint.explanation}`);
      } else {
        showToast(hint.explanation || 'No immediate move found. Try Manna from Heaven!');
      }
    } else if (miracle.id === 'PENTECOST_FIRE') {
      audioEngine.playPentecostFire();
      updateActiveFaith((prev) => ({
        ...prev,
        activeBuffs: { ...prev.activeBuffs, pentecostFireActive: true },
      }));
      showToast('🔥 Pentecost Fire Activated: Next word earns 2× DOUBLE HOLY SCORE!');
    } else if (miracle.id === 'MANNA_BLESSING') {
      audioEngine.playMannaBlessing();
      handleRecallTiles();
      
      // Keep best letters, swap consonants / duplicates
      const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
      const currentRack = [...currentActiveRack];
      const tilesToSwap = currentRack.filter((t) => !VOWELS.has(t.letter)).slice(0, 3);

      if (tilesToSwap.length > 0 && tileBag.length >= tilesToSwap.length) {
        const bagWithReturns = [...tileBag, ...tilesToSwap];
        const { drawn, remainingBag } = drawTilesFromBag(bagWithReturns, tilesToSwap.length);
        const swapIds = new Set(tilesToSwap.map((t) => t.id));
        updateActiveRack((prev) => [...prev.filter((t) => !swapIds.has(t.id)), ...drawn]);
        setTileBag(remainingBag);
        showToast(`🌾 Manna from Heaven: Blessed with ${drawn.length} fresh tiles!`);
      } else {
        showToast('🌾 Manna from Heaven: Grace received!');
      }
    } else if (miracle.id === 'PART_THE_WATERS') {
      audioEngine.playPowerup();
      setTargetingMode('PART_WATERS');
      showToast('🌊 Click any tile on the board to dissolve it!');
    } else if (miracle.id === 'ARK_BLESSING') {
      audioEngine.playPowerup();
      setTargetingMode('ARK_BLESSING');
      showToast('🌟 Click any tile in your rack to transform it into a Wildcard (★)!');
    }
  };

  const handleSelectPlacedTile = (placed: PlacedTile) => {
    audioEngine.playClick();
    setTempPlacements((prev) => prev.filter((p) => !(p.row === placed.row && p.col === placed.col)));
    updateActiveRack((prev) => [...prev, placed.tile]);
  };

  const handleRecallTiles = () => {
    if (tempPlacements.length === 0) return;
    audioEngine.playWrong();
    const recalled = tempPlacements.map((p) => p.tile);
    updateActiveRack((prev) => [...prev, ...recalled]);
    setTempPlacements([]);
    setSelectedRackTile(null);
  };

  const handleShuffleRack = () => {
    audioEngine.playWheelTick();
    updateActiveRack((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleSwapTiles = (tilesToSwap: ScrabbleTile[]) => {
    if (tileBag.length < tilesToSwap.length) {
      showToast('Not enough tiles remaining in bag!');
      return;
    }

    handleRecallTiles();
    audioEngine.playPowerup();

    const bagWithReturns = [...tileBag, ...tilesToSwap];
    const { drawn, remainingBag } = drawTilesFromBag(bagWithReturns, tilesToSwap.length);

    const swapIds = new Set(tilesToSwap.map((t) => t.id));
    updateActiveRack((prev) => [...prev.filter((t) => !swapIds.has(t.id)), ...drawn]);
    setTileBag(remainingBag);

    showToast(`Swapped ${tilesToSwap.length} tiles.`);
    handlePassTurn();
  };

  // PASS TURN
  const handlePassTurn = () => {
    handleRecallTiles();
    setPropheticHighlights([]);
    setActivePropheticWord(null);
    setTargetingMode('NONE');
    audioEngine.playTick();
    const passes = consecutivePasses + 1;
    setConsecutivePasses(passes);

    if (passes >= 4) {
      setIsGameOver(true);
      showToast('Match ended by consecutive passes!');
      return;
    }

    if (gameMode === 'pass_and_play') {
      setIsPlayer1Turn((prev) => !prev);
      setShowPassCurtain(true);
    } else if (gameMode === 'online_host' || gameMode === 'online_guest') {
      setIsPlayer1Turn((prev) => !prev);
      multiplayer.send({
        type: 'PASS_TURN',
        senderName: gameMode === 'online_host' ? player1Name : player2Name,
      });
    } else {
      setIsPlayer1Turn(false);
    }
  };

  // SCRIPTURE HINT (Quick)
  const handleScriptureHint = () => {
    handleActivateMiracle(MIRACLE_POWERS.find((m) => m.id === 'PROPHETIC_VISION')!);
  };

  // SUBMIT PLAYED MOVE
  const handlePlayWord = () => {
    if (tempPlacements.length === 0) return;

    const validation = validateAndScoreMove(board, tempPlacements, isFirstMove);

    if (!validation.isValid) {
      audioEngine.playWrong();
      showToast(validation.errorMessage || 'Invalid placement!');
      return;
    }

    // Apply Pentecost Fire Multiplier (2x) if active
    const isPentecostActive = currentActiveFaith.activeBuffs.pentecostFireActive;
    let earned = validation.totalScore;
    if (isPentecostActive) {
      earned = earned * 2;
    }

    let nextP1Score = player1Score;
    let nextP2Score = player2Score;

    if (gameMode === 'online_guest') {
      nextP2Score += earned;
      setPlayer2Score(nextP2Score);
    } else if (isPlayer1Turn) {
      nextP1Score += earned;
      setPlayer1Score(nextP1Score);
    } else {
      nextP2Score += earned;
      setPlayer2Score(nextP2Score);
    }

    // Award Faith Points (FP)
    const isBiblical = validation.wordsFormed.some((w) => w.isBiblical);
    const faithGained = 10 + (isBiblical ? 25 : 0) + (validation.isBingo ? 50 : 0);
    updateActiveFaith((prev) => ({
      ...prev,
      faithPoints: Math.min(prev.maxFaithPoints, prev.faithPoints + faithGained),
      activeBuffs: {
        ...prev.activeBuffs,
        pentecostFireActive: false, // consume buff
      },
    }));

    audioEngine.playCorrect(4);
    confetti({ particleCount: isBiblical ? 120 : 70, spread: 80, origin: { y: 0.5 } });

    // Commit temp tiles permanently to board
    const updatedBoard = board.map((row) => row.map((sq) => ({ ...sq })));
    tempPlacements.forEach((p) => {
      updatedBoard[p.row][p.col].tile = p.tile;
    });
    setBoard(updatedBoard);

    // Reset temporary state & prophetic vision
    setPropheticHighlights([]);
    setActivePropheticWord(null);
    setTargetingMode('NONE');

    // Check lore modal
    const biblicalWord = validation.wordsFormed.find((w) => w.isBiblical);
    let loreToSync: ScriptureDefinition | undefined = undefined;
    if (biblicalWord) {
      const entry = SCRIPTURE_DICTIONARY[biblicalWord.word];
      if (entry) {
        setActiveRevealedLore(entry);
        setLatestScoreEarned(biblicalWord.score * (isPentecostActive ? 2 : 1));
        loreToSync = entry;
      }
    }

    // Refill active rack
    const placedCount = tempPlacements.length;
    const { drawn, remainingBag } = drawTilesFromBag(tileBag, placedCount);
    updateActiveRack((prev) => [...prev, ...drawn]);
    setTileBag(remainingBag);
    setTempPlacements([]);
    setIsFirstMove(false);
    setConsecutivePasses(0);

    const mainWord = validation.wordsFormed[0]?.word || 'Word';
    setActiveFloatingPop({
      id: Date.now().toString(),
      score: earned,
      word: mainWord,
      isBiblical: !!biblicalWord,
      isPentecost: isPentecostActive,
    });

    showToast(
      isPentecostActive
        ? `🔥 +${earned} PTS (2× PENTECOST FIRE!) for “${mainWord}” (+${faithGained} FP)`
        : `+${earned} PTS for “${mainWord}”! (+${faithGained} FP)`
    );

    // Synchronize or Switch Turns
    if (gameMode === 'pass_and_play') {
      setIsPlayer1Turn((prev) => !prev);
      setShowPassCurtain(true);
    } else if (gameMode === 'online_host' || gameMode === 'online_guest') {
      const nextTurn = !isPlayer1Turn;
      setIsPlayer1Turn(nextTurn);
      multiplayer.send({
        type: 'MOVE_PLAYED',
        senderName: gameMode === 'online_host' ? player1Name : player2Name,
        payload: {
          board: updatedBoard,
          tileBag: remainingBag,
          hostScore: nextP1Score,
          guestScore: nextP2Score,
          isHostTurn: nextTurn,
          isFirstMove: false,
          word: mainWord,
          score: earned,
          latestLore: loreToSync,
        },
      });
    } else {
      // AI Mode: switch to AI
      setIsPlayer1Turn(false);
    }
  };

  // AI TURN ("Solomon AI")
  useEffect(() => {
    if (isPlayer1Turn || gameMode !== 'ai' || isGameOver) return;

    setIsAiThinking(true);

    const aiTimer = setTimeout(() => {
      const aiPlacements = findSolomonAIMove(board, player2Rack, isFirstMove);

      if (aiPlacements && aiPlacements.length > 0) {
        const validation = validateAndScoreMove(board, aiPlacements, isFirstMove);

        if (validation.isValid) {
          const earned = validation.totalScore;
          setPlayer2Score((s) => s + earned);
          setConsecutivePasses(0);
          audioEngine.playCriticalHit();

          setBoard((prev) => {
            const next = prev.map((row) => row.map((sq) => ({ ...sq })));
            aiPlacements.forEach((p) => {
              next[p.row][p.col].tile = p.tile;
            });
            return next;
          });

          const placedIds = new Set(aiPlacements.map((p) => p.tile.id));
          const remainingAiRack = player2Rack.filter((t) => !placedIds.has(t.id));
          const { drawn, remainingBag } = drawTilesFromBag(tileBag, aiPlacements.length);
          setPlayer2Rack([...remainingAiRack, ...drawn]);
          setTileBag(remainingBag);
          setIsFirstMove(false);

          const mainWord = validation.wordsFormed[0]?.word || 'Word';
          showToast(`Solomon AI played “${mainWord}” for +${earned} pts!`);
        }
      } else {
        setConsecutivePasses((p) => p + 1);
        showToast('Solomon AI passed.');
      }

      setIsAiThinking(false);
      setIsPlayer1Turn(true);
    }, 1400);

    return () => clearTimeout(aiTimer);
  }, [isPlayer1Turn, gameMode, isGameOver, board, player2Rack, isFirstMove, tileBag]);

  const handleSendReaction = (emoji: string, text: string) => {
    multiplayer.send({
      type: 'REACTION',
      senderName: isPlayer1Turn ? player1Name : player2Name,
      payload: { emoji, text },
    });
    setIncomingReaction({
      emoji,
      text,
      sender: 'You',
    });
  };

  return (
    <div className="w-full min-h-screen celestial-bg px-2 sm:px-4 py-4 space-y-3.5 animate-fade-in text-slate-100 text-center relative overflow-x-hidden">
      {/* FLOATING SCORE POP ANIMATION */}
      <FloatingScorePop activePop={activeFloatingPop} />

      {/* 1. TOP HEADER HUD */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 bg-slate-900/90 border border-amber-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md border border-amber-200 animate-pulse">
            🔤
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-white tracking-wider">
                SCRIPTURE <span className="gold-gradient-text">SCRABBLE</span>
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm">
                15×15 DELUXE
              </span>
            </div>
            <p className="text-[10px] text-amber-200/80 hidden sm:block font-serif">
              “Thy word is a lamp unto my feet, and a light unto my path.” (Psalm 119:105)
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLobbyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition"
          >
            👥 Mode
          </button>

          <button
            onClick={initializeGame}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shadow active:scale-95"
            title="Start New Game"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* 2. HUD: SCORES & TURN CONTROLS */}
      <ScrabbleHUD
        playerScore={player1Score}
        opponentScore={player2Score}
        player1Name={player1Name}
        player2Name={player2Name}
        player1FaithPoints={player1Faith.faithPoints}
        player2FaithPoints={player2Faith.faithPoints}
        gameMode={gameMode}
        isPlayerTurn={isPlayer1Turn}
        tilesLeftInBag={tileBag.length}
        isMusicMuted={isMusicMuted}
        onToggleMusic={handleToggleMusic}
        onPlayWord={handlePlayWord}
        onScriptureHint={handleScriptureHint}
        onPassTurn={handlePassTurn}
        onOpenBagModal={() => setIsBagModalOpen(true)}
        onOpenLobbyModal={() => setIsLobbyModalOpen(true)}
        onNewGame={initializeGame}
        isAiThinking={isAiThinking}
        hasTempPlacements={tempPlacements.length > 0}
        roomCode={roomCode}
        isOnlineConnected={isOnlineConnected}
      />

      {/* QUICK REACTIONS BAR */}
      <QuickReactions
        onSendReaction={handleSendReaction}
        incomingReaction={incomingReaction}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="py-2 px-5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs inline-block animate-pop shadow-xl border border-yellow-200">
          {toastMessage}
        </div>
      )}

      {/* 3. 15x15 SCRABBLE BOARD */}
      <ScrabbleBoard
        board={board}
        tempPlacements={tempPlacements}
        selectedRackTile={selectedRackTile}
        highlightedSquares={propheticHighlights}
        isTargetingClear={targetingMode === 'PART_WATERS'}
        isPentecostActive={currentActiveFaith.activeBuffs.pentecostFireActive}
        onSquareClick={handleSquareClick}
        onDropTileOnSquare={handlePlaceTileOnSquare}
        onSelectPlacedTile={handleSelectPlacedTile}
      />

      {/* 4. DIVINE MIRACLES DOCK */}
      <MiraclePowersBar
        faithState={currentActiveFaith}
        isMyTurn={isMyTurn && !isAiThinking && !isGameOver}
        onActivateMiracle={handleActivateMiracle}
        targetingMode={targetingMode}
        onCancelTargeting={() => setTargetingMode('NONE')}
        activePropheticWord={activePropheticWord}
      />

      {/* 5. PLAYER TILE RACK */}
      <TileRack
        rack={currentActiveRack}
        selectedTile={selectedRackTile}
        isTargetingBlessing={targetingMode === 'ARK_BLESSING'}
        onSelectTile={handleSelectRackTile}
        onShuffle={handleShuffleRack}
        onRecall={handleRecallTiles}
        onOpenSwapModal={() => setIsSwapModalOpen(true)}
        disabled={!isMyTurn || isAiThinking || isGameOver}
      />

      {/* 5. MULTIPLAYER LOBBY MODAL */}
      <MultiplayerLobbyModal
        isOpen={isLobbyModalOpen}
        onClose={() => setIsLobbyModalOpen(false)}
        currentMode={gameMode}
        onSelectMode={handleSelectMode}
        currentRoomCode={roomCode}
        isHostConnected={isOnlineConnected}
      />

      {/* 6. PASS & PLAY PRIVACY CURTAIN */}
      {showPassCurtain && (
        <PassAndPlayCurtain
          nextPlayerName={isPlayer1Turn ? player1Name : player2Name}
          onReveal={() => setShowPassCurtain(false)}
        />
      )}

      {/* 7. SCRIPTURE LORE REVEAL MODAL */}
      <ScriptureWordModal
        entry={activeRevealedLore}
        scoreEarned={latestScoreEarned}
        onClose={() => setActiveRevealedLore(null)}
      />

      {/* 8. TILE BAG & SWAP MODAL */}
      <TileBagModal
        isOpen={isBagModalOpen || isSwapModalOpen}
        onClose={() => {
          setIsBagModalOpen(false);
          setIsSwapModalOpen(false);
        }}
        tileBag={tileBag}
        playerRack={currentActiveRack}
        onSwapTiles={handleSwapTiles}
        isSwapMode={isSwapModalOpen}
      />

      {/* 9. GAME OVER CELEBRATION MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-[#18233d] to-[#0c1222] rounded-3xl border-2 border-amber-500/60 shadow-2xl p-6 sm:p-8 text-center text-slate-100 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-xl">
              👑
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {player1Score >= player2Score ? `${player1Name} WINS!` : `${player2Name} WINS!`}
            </h3>
            <p className="text-xs text-slate-300">
              A glorious match of wisdom, strategy, and Scripture!
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-around text-center">
              <div>
                <span className="text-[10px] uppercase text-amber-400 font-bold block">{player1Name}</span>
                <span className="text-2xl font-black text-white">{player1Score}</span>
              </div>
              <div className="border-r border-slate-800" />
              <div>
                <span className="text-[10px] uppercase text-purple-400 font-bold block">{player2Name}</span>
                <span className="text-2xl font-black text-white">{player2Score}</span>
              </div>
            </div>

            <button
              onClick={initializeGame}
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
            >
              Start New Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
