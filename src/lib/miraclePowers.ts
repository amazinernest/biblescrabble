/**
 * Divine Miracle Power-Ups System for Scripture Scrabble
 * Implements faith-based game modifiers: Prophetic Vision, Manna from Heaven,
 * Pentecostal Fire, Part the Waters, and Ark Golden Wildcard.
 */

import { ScrabbleTile, BoardSquare, PlacedTile, BOARD_SIZE, findSolomonAIMove, validateAndScoreMove } from './scrabbleEngine';
import { SCRIPTURE_DICTIONARY, isValidScriptureWord } from './scrabbleDictionary';

export type MiracleId = 
  | 'PROPHETIC_VISION'
  | 'MANNA_BLESSING'
  | 'PENTECOST_FIRE'
  | 'PART_THE_WATERS'
  | 'ARK_BLESSING';

export interface MiraclePower {
  id: MiracleId;
  name: string;
  subtitle: string;
  icon: string;
  cost: number; // Faith Points required
  description: string;
  scriptureRef: string;
  verse: string;
  color: string; // Tailwind color class for glow/badge
}

export const MIRACLE_POWERS: MiraclePower[] = [
  {
    id: 'PROPHETIC_VISION',
    name: 'Prophetic Vision',
    subtitle: 'Divine Word Revelation',
    icon: '💡',
    cost: 40,
    description: 'Divinely reveals a high-scoring Scripture word you can play right now from your rack.',
    scriptureRef: 'Habakkuk 2:2',
    verse: '“Write the vision, and make it plain upon tables...”',
    color: 'from-amber-500 to-yellow-300'
  },
  {
    id: 'PENTECOST_FIRE',
    name: 'Pentecost Fire',
    subtitle: '2× Holy Anointing Multiplier',
    icon: '🔥',
    cost: 50,
    description: 'Imbues your next played word with Holy Fire, DOUBLING (2×) its final score.',
    scriptureRef: 'Acts 2:3',
    verse: '“And there appeared unto them cloven tongues like as of fire...”',
    color: 'from-red-600 to-orange-400'
  },
  {
    id: 'MANNA_BLESSING',
    name: 'Manna from Heaven',
    subtitle: 'Free Tile Renewal',
    icon: '🌾',
    cost: 30,
    description: 'Blesses your rack with fresh premium letters and vowels from the bag without losing your turn.',
    scriptureRef: 'Exodus 16:15',
    verse: '“This is the bread which the Lord hath given you to eat.”',
    color: 'from-emerald-500 to-teal-300'
  },
  {
    id: 'ARK_BLESSING',
    name: 'Ark of the Covenant',
    subtitle: 'Golden Wildcard',
    icon: '🌟',
    cost: 35,
    description: 'Transforms any chosen letter in your rack into a Golden Wildcard tile.',
    scriptureRef: 'Exodus 25:10',
    verse: '“And they shall make an ark of shittim wood... overlaid with pure gold.”',
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'PART_THE_WATERS',
    name: 'Part the Waters',
    subtitle: 'Board Tile Cleanser',
    icon: '🌊',
    cost: 45,
    description: 'Removes a single obstructive tile from the board to open pathways for massive crosswords.',
    scriptureRef: 'Exodus 14:21',
    verse: '“And Moses stretched out his hand over the sea; and the waters were divided.”',
    color: 'from-cyan-500 to-blue-400'
  }
];

export interface PlayerFaithState {
  faithPoints: number;
  maxFaithPoints: number;
  activeBuffs: {
    pentecostFireActive: boolean;
    pentecostTurnsRemaining: number;
  };
}

export const INITIAL_FAITH_STATE: PlayerFaithState = {
  faithPoints: 100,
  maxFaithPoints: 200,
  activeBuffs: {
    pentecostFireActive: false,
    pentecostTurnsRemaining: 0,
  }
};

/**
 * Computes Prophetic Vision best move for player's current rack on board
 */
export function calculatePropheticHint(board: BoardSquare[][], rack: ScrabbleTile[]): {
  found: boolean;
  word?: string;
  score?: number;
  isBiblical?: boolean;
  explanation?: string;
  placements?: { row: number; col: number; letter: string; tileId: string }[];
} {
  const isBoardEmpty = !board.some((row) => row.some((sq) => sq.tile !== null));
  const suggestedPlacements = findSolomonAIMove(board, rack, isBoardEmpty);

  if (!suggestedPlacements || suggestedPlacements.length === 0) {
    return {
      found: false,
      explanation: 'No valid word formation found on the current board. Try using Manna from Heaven or swapping tiles!'
    };
  }

  const validation = validateAndScoreMove(board, suggestedPlacements, isBoardEmpty);
  const word = validation.wordsFormed[0]?.word || suggestedPlacements.map((p) => p.tile.letter).join('');
  const isBiblical = validation.wordsFormed.some((w) => w.isBiblical);

  return {
    found: true,
    word,
    score: validation.totalScore,
    isBiblical,
    explanation: isBiblical 
      ? `Revealed Biblical word “${word}” for ~${validation.totalScore} pts!`
      : `Revealed play “${word}” for ~${validation.totalScore} pts!`,
    placements: suggestedPlacements.map((p) => ({
      row: p.row,
      col: p.col,
      letter: p.tile.letter,
      tileId: p.tile.id,
    }))
  };
}
