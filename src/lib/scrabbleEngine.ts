/**
 * Authentic 15x15 Scrabble Engine for Scripture Scrabble
 * Implements board coordinates, multipliers, letter bag, move validation,
 * crossword scoring, and AI opponent.
 */

import { SCRIPTURE_DICTIONARY, isValidScriptureWord } from './scrabbleDictionary';

export type MultiplierType = 'TW' | 'DW' | 'TL' | 'DL' | 'CENTER' | 'NONE';

export interface BoardSquare {
  row: number;
  col: number;
  multiplier: MultiplierType;
  tile: ScrabbleTile | null;
  isTemp?: boolean; // currently placed in the active turn
}

export interface ScrabbleTile {
  id: string;
  letter: string;
  points: number;
  isBlank?: boolean;
}

export interface PlacedTile {
  row: number;
  col: number;
  tile: ScrabbleTile;
}

export interface FormedWordResult {
  word: string;
  score: number;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  isBiblical: boolean;
}

export interface MoveValidationResult {
  isValid: boolean;
  errorMessage?: string;
  totalScore: number;
  wordsFormed: FormedWordResult[];
  isBingo: boolean;
}

// STANDARD SCRABBLE LETTER POINT VALUES
export const SCRABBLE_POINTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5,
  L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4,
  W: 4, X: 8, Y: 4, Z: 10,
};

// STANDARD 100-TILE BAG DISTRIBUTION WITH BIBLICAL ENRICHMENT
export const STANDARD_TILE_DISTRIBUTION: Record<string, number> = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 3, I: 9, J: 1, K: 1,
  L: 4, M: 3, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 5, T: 6, U: 4, V: 2,
  W: 2, X: 1, Y: 2, Z: 1,
};

export const BOARD_SIZE = 15;

/**
 * Computes standard Scrabble multiplier for a 15x15 board cell
 */
export function getSquareMultiplier(r: number, c: number): MultiplierType {
  // Center Star
  if (r === 7 && c === 7) return 'CENTER';

  // Triple Word (TW) - Red
  const twCoords = [
    [0, 0], [0, 7], [0, 14],
    [7, 0], [7, 14],
    [14, 0], [14, 7], [14, 14]
  ];
  if (twCoords.some(([tr, tc]) => tr === r && tc === c)) return 'TW';

  // Double Word (DW) - Pink
  const dwCoords = [
    [1, 1], [2, 2], [3, 3], [4, 4],
    [1, 13], [2, 12], [3, 11], [4, 10],
    [13, 1], [12, 2], [11, 3], [10, 4],
    [13, 13], [12, 12], [11, 11], [10, 10],
    [7, 7]
  ];
  if (dwCoords.some(([dr, dc]) => dr === r && dc === c)) return 'DW';

  // Triple Letter (TL) - Dark Blue
  const tlCoords = [
    [1, 5], [1, 9],
    [5, 1], [5, 5], [5, 9], [5, 13],
    [9, 1], [9, 5], [9, 9], [9, 13],
    [13, 5], [13, 9]
  ];
  if (tlCoords.some(([tlr, tlc]) => tlr === r && tlc === c)) return 'TL';

  // Double Letter (DL) - Light Blue
  const dlCoords = [
    [0, 3], [0, 11],
    [2, 6], [2, 8],
    [3, 0], [3, 7], [3, 14],
    [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11],
    [8, 2], [8, 6], [8, 8], [8, 12],
    [11, 0], [11, 7], [11, 14],
    [12, 6], [12, 8],
    [14, 3], [14, 11]
  ];
  if (dlCoords.some(([dlr, dlc]) => dlr === r && dlc === c)) return 'DL';

  return 'NONE';
}

/**
 * Creates an initial clean 15x15 board
 */
export function createEmptyBoard(): BoardSquare[][] {
  const board: BoardSquare[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: BoardSquare[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push({
        row: r,
        col: c,
        multiplier: getSquareMultiplier(r, c),
        tile: null,
      });
    }
    board.push(row);
  }
  return board;
}

/**
 * Generates a full shuffled tile bag of 100 tiles
 */
export function createTileBag(): ScrabbleTile[] {
  const bag: ScrabbleTile[] = [];
  let id = 1;

  Object.entries(STANDARD_TILE_DISTRIBUTION).forEach(([letter, count]) => {
    for (let i = 0; i < count; i++) {
      bag.push({
        id: `tile-${letter}-${id++}`,
        letter,
        points: SCRABBLE_POINTS[letter] || 1,
      });
    }
  });

  // Fisher-Yates Shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  return bag;
}

/**
 * Draws N tiles from the bag
 */
export function drawTilesFromBag(bag: ScrabbleTile[], count: number): { drawn: ScrabbleTile[]; remainingBag: ScrabbleTile[] } {
  const drawn = bag.slice(0, count);
  const remainingBag = bag.slice(count);
  return { drawn, remainingBag };
}

/**
 * Validates a player's move on the board and calculates scores
 */
export function validateAndScoreMove(
  board: BoardSquare[][],
  placedTiles: PlacedTile[],
  isFirstMove: boolean
): MoveValidationResult {
  if (placedTiles.length === 0) {
    return { isValid: false, errorMessage: 'No tiles placed on the board.', totalScore: 0, wordsFormed: [], isBingo: false };
  }

  // 1. Verify placed tiles are in a single line (row or column)
  const rows = placedTiles.map((p) => p.row);
  const cols = placedTiles.map((p) => p.col);
  const sameRow = rows.every((r) => r === rows[0]);
  const sameCol = cols.every((c) => c === cols[0]);

  if (!sameRow && !sameCol) {
    return { isValid: false, errorMessage: 'All placed tiles must be in a single straight line (horizontal or vertical).', totalScore: 0, wordsFormed: [], isBingo: false };
  }

  // Sort placed tiles in positional order
  const sortedPlacements = [...placedTiles].sort((a, b) => (sameRow ? a.col - b.col : a.row - b.row));

  // 2. Check first move covers Center Star (7, 7)
  if (isFirstMove) {
    const coversCenter = placedTiles.some((p) => p.row === 7 && p.col === 7);
    if (!coversCenter) {
      return { isValid: false, errorMessage: 'The first word of the game must cover the center star (H8).', totalScore: 0, wordsFormed: [], isBingo: false };
    }
    if (placedTiles.length < 2) {
      return { isValid: false, errorMessage: 'First word must be at least 2 letters.', totalScore: 0, wordsFormed: [], isBingo: false };
    }
  }

  // Create virtual board with placed tiles overlayed
  const virtualBoard: (ScrabbleTile | null)[][] = board.map((row) => row.map((sq) => sq.tile));
  placedTiles.forEach((p) => {
    virtualBoard[p.row][p.col] = p.tile;
  });

  // 3. Verify continuity of main line (no gaps between start and end)
  if (sameRow) {
    const r = rows[0];
    const minCol = sortedPlacements[0].col;
    const maxCol = sortedPlacements[sortedPlacements.length - 1].col;

    for (let c = minCol; c <= maxCol; c++) {
      if (!virtualBoard[r][c]) {
        return { isValid: false, errorMessage: 'Tiles must form a continuous word without empty spaces.', totalScore: 0, wordsFormed: [], isBingo: false };
      }
    }
  } else {
    const c = cols[0];
    const minRow = sortedPlacements[0].row;
    const maxRow = sortedPlacements[sortedPlacements.length - 1].row;

    for (let r = minRow; r <= maxRow; r++) {
      if (!virtualBoard[r][c]) {
        return { isValid: false, errorMessage: 'Tiles must form a continuous word without empty spaces.', totalScore: 0, wordsFormed: [], isBingo: false };
      }
    }
  }

  // 4. Verify connection to existing board tiles (if not first move)
  if (!isFirstMove) {
    let hasAdjacentConnection = false;
    placedTiles.forEach((p) => {
      const neighbors = [
        [p.row - 1, p.col],
        [p.row + 1, p.col],
        [p.row, p.col - 1],
        [p.row, p.col + 1],
      ];
      neighbors.forEach(([nr, nc]) => {
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          // If neighbor has an existing tile from previous turns
          if (board[nr][nc].tile !== null) {
            hasAdjacentConnection = true;
          }
        }
      });
    });

    if (!hasAdjacentConnection) {
      return { isValid: false, errorMessage: 'Your word must connect with at least one existing tile on the board.', totalScore: 0, wordsFormed: [], isBingo: false };
    }
  }

  // 5. Extract Main Word and all Perpendicular Crosswords
  const wordsFormed: FormedWordResult[] = [];
  const newlyPlacedCoords = new Set(placedTiles.map((p) => `${p.row},${p.col}`));

  // Helper to score a word in virtualBoard
  const scoreWordSpan = (
    startR: number,
    startC: number,
    endR: number,
    endC: number,
    direction: 'horizontal' | 'vertical'
  ): FormedWordResult => {
    let wordStr = '';
    let letterSum = 0;
    let wordMult = 1;

    if (direction === 'horizontal') {
      const r = startR;
      for (let c = startC; c <= endC; c++) {
        const t = virtualBoard[r][c]!;
        wordStr += t.letter;
        const isNew = newlyPlacedCoords.has(`${r},${c}`);
        let tileScore = t.points;

        if (isNew) {
          const mult = board[r][c].multiplier;
          if (mult === 'DL') tileScore *= 2;
          if (mult === 'TL') tileScore *= 3;
          if (mult === 'DW' || mult === 'CENTER') wordMult *= 2;
          if (mult === 'TW') wordMult *= 3;
        }
        letterSum += tileScore;
      }
    } else {
      const c = startC;
      for (let r = startR; r <= endR; r++) {
        const t = virtualBoard[r][c]!;
        wordStr += t.letter;
        const isNew = newlyPlacedCoords.has(`${r},${c}`);
        let tileScore = t.points;

        if (isNew) {
          const mult = board[r][c].multiplier;
          if (mult === 'DL') tileScore *= 2;
          if (mult === 'TL') tileScore *= 3;
          if (mult === 'DW' || mult === 'CENTER') wordMult *= 2;
          if (mult === 'TW') wordMult *= 3;
        }
        letterSum += tileScore;
      }
    }

    const isBiblical = !!SCRIPTURE_DICTIONARY[wordStr];
    // Biblical Bonus: 1.5x score bonus if the formed word is in the Scripture Lexicon!
    const biblicalMultiplier = isBiblical ? 1.5 : 1.0;
    const finalWordScore = Math.round(letterSum * wordMult * biblicalMultiplier);

    return {
      word: wordStr,
      score: finalWordScore,
      startRow: startR,
      startCol: startC,
      direction,
      isBiblical,
    };
  };

  // Find boundaries of Main Word
  if (sameRow && placedTiles.length > 1) {
    const r = rows[0];
    let startC = sortedPlacements[0].col;
    while (startC > 0 && virtualBoard[r][startC - 1] !== null) {
      startC--;
    }
    let endC = sortedPlacements[sortedPlacements.length - 1].col;
    while (endC < BOARD_SIZE - 1 && virtualBoard[r][endC + 1] !== null) {
      endC++;
    }
    if (endC - startC >= 1) {
      wordsFormed.push(scoreWordSpan(r, startC, r, endC, 'horizontal'));
    }
  } else if (sameCol && placedTiles.length > 1) {
    const c = cols[0];
    let startR = sortedPlacements[0].row;
    while (startR > 0 && virtualBoard[startR - 1][c] !== null) {
      startR--;
    }
    let endR = sortedPlacements[sortedPlacements.length - 1].row;
    while (endR < BOARD_SIZE - 1 && virtualBoard[endR + 1][c] !== null) {
      endR++;
    }
    if (endR - startR >= 1) {
      wordsFormed.push(scoreWordSpan(startR, c, endR, c, 'vertical'));
    }
  } else if (placedTiles.length === 1) {
    // Single tile placed: could complete both horizontal and vertical words
    const p = placedTiles[0];

    // Check horizontal word
    let startC = p.col;
    while (startC > 0 && virtualBoard[p.row][startC - 1] !== null) startC--;
    let endC = p.col;
    while (endC < BOARD_SIZE - 1 && virtualBoard[p.row][endC + 1] !== null) endC++;
    if (endC - startC >= 1) {
      wordsFormed.push(scoreWordSpan(p.row, startC, p.row, endC, 'horizontal'));
    }

    // Check vertical word
    let startR = p.row;
    while (startR > 0 && virtualBoard[startR - 1][p.col] !== null) startR--;
    let endR = p.row;
    while (endR < BOARD_SIZE - 1 && virtualBoard[endR + 1][p.col] !== null) endR++;
    if (endR - startR >= 1) {
      wordsFormed.push(scoreWordSpan(startR, p.col, endR, p.col, 'vertical'));
    }
  }

  // Find Perpendicular Crosswords formed by each placed tile
  if (placedTiles.length > 1) {
    placedTiles.forEach((p) => {
      if (sameRow) {
        // Look vertical for this tile
        let startR = p.row;
        while (startR > 0 && virtualBoard[startR - 1][p.col] !== null) startR--;
        let endR = p.row;
        while (endR < BOARD_SIZE - 1 && virtualBoard[endR + 1][p.col] !== null) endR++;
        if (endR - startR >= 1) {
          wordsFormed.push(scoreWordSpan(startR, p.col, endR, p.col, 'vertical'));
        }
      } else {
        // Look horizontal for this tile
        let startC = p.col;
        while (startC > 0 && virtualBoard[p.row][startC - 1] !== null) startC--;
        let endC = p.col;
        while (endC < BOARD_SIZE - 1 && virtualBoard[p.row][endC + 1] !== null) endC++;
        if (endC - startC >= 1) {
          wordsFormed.push(scoreWordSpan(p.row, startC, p.row, endC, 'horizontal'));
        }
      }
    });
  }

  if (wordsFormed.length === 0) {
    return { isValid: false, errorMessage: 'Word must be at least 2 letters long.', totalScore: 0, wordsFormed: [], isBingo: false };
  }

  // 6. Validate all formed words against dictionary
  for (const wf of wordsFormed) {
    if (!isValidScriptureWord(wf.word)) {
      return {
        isValid: false,
        errorMessage: `“${wf.word}” is not recognized in the Scripture Lexicon! Try words like MOSES, FAITH, ARK, NOAH, GRACE, EDEN...`,
        totalScore: 0,
        wordsFormed: [],
        isBingo: false,
      };
    }
  }

  // 7. Calculate Total Score + Bingo
  let totalScore = wordsFormed.reduce((sum, w) => sum + w.score, 0);
  const isBingo = placedTiles.length === 7;
  if (isBingo) {
    totalScore += 50; // +50 pts 7-Tile Bingo Bonus!
  }

  return {
    isValid: true,
    totalScore,
    wordsFormed,
    isBingo,
  };
}

/**
 * AI Move Finder ("Solomon AI")
 * Scans board anchor squares and evaluates valid biblical word placements
 */
export function findSolomonAIMove(
  board: BoardSquare[][],
  aiRack: ScrabbleTile[],
  isFirstMove: boolean
): PlacedTile[] | null {
  const rackLetters = aiRack.map((t) => t.letter);

  // Candidate Scripture words to test
  const candidateWords = Object.keys(SCRIPTURE_DICTIONARY).sort((a, b) => b.length - a.length);

  if (isFirstMove) {
    // Try to place a word starting or centered on (7,7)
    for (const word of candidateWords) {
      if (word.length <= rackLetters.length && word.length >= 3 && word.length <= 7) {
        // Check if rack has all letters
        const tempRack = [...rackLetters];
        let canForm = true;
        const wordTiles: ScrabbleTile[] = [];

        for (const char of word) {
          const idx = tempRack.indexOf(char);
          if (idx === -1) {
            canForm = false;
            break;
          }
          tempRack.splice(idx, 1);
          wordTiles.push(aiRack.find((t) => t.letter === char)!);
        }

        if (canForm) {
          // Place horizontally through (7,7)
          const startCol = 7 - Math.floor(word.length / 2);
          const placements: PlacedTile[] = [];
          for (let i = 0; i < word.length; i++) {
            placements.push({
              row: 7,
              col: startCol + i,
              tile: wordTiles[i],
            });
          }
          return placements;
        }
      }
    }
  } else {
    // Find anchor cells adjacent to existing board tiles
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const existingTile = board[r][c].tile;
        if (existingTile) {
          // Try to form a word using existingTile.letter
          const pivotChar = existingTile.letter;

          for (const word of candidateWords) {
            const pivotIndex = word.indexOf(pivotChar);
            if (pivotIndex !== -1 && word.length <= 6) {
              // Check if remaining letters can be supplied by rack
              const neededLetters = word.slice(0, pivotIndex) + word.slice(pivotIndex + 1);
              const tempRack = [...rackLetters];
              let canForm = true;
              const usedTiles: ScrabbleTile[] = [];

              for (const ch of neededLetters) {
                const idx = tempRack.indexOf(ch);
                if (idx === -1) {
                  canForm = false;
                  break;
                }
                tempRack.splice(idx, 1);
                usedTiles.push(aiRack.find((t) => t.letter === ch && !usedTiles.includes(t))!);
              }

              if (canForm) {
                // Try horizontal placement
                const startCol = c - pivotIndex;
                const endCol = startCol + word.length - 1;

                if (startCol >= 0 && endCol < BOARD_SIZE) {
                  const placements: PlacedTile[] = [];
                  let validSpace = true;
                  let tileIdx = 0;

                  for (let col = startCol; col <= endCol; col++) {
                    if (col === c) continue; // pivot square
                    if (board[r][col].tile !== null) {
                      validSpace = false;
                      break;
                    }
                    placements.push({
                      row: r,
                      col,
                      tile: usedTiles[tileIdx++],
                    });
                  }

                  if (validSpace && placements.length > 0) {
                    const validation = validateAndScoreMove(board, placements, false);
                    if (validation.isValid) {
                      return placements;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return null;
}
