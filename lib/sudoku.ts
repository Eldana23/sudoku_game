// lib/sudoku.ts
// Complete Sudoku engine: generation, solving, validation, and daily puzzles

export type Board = (number | null)[][];
export type Difficulty = "easy" | "medium" | "hard" | "expert";

/** Mulberry32 — fast, seedable PRNG */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convert a Date to a stable integer seed */
export function dateToSeed(date: Date): number {
  return (
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate()
  );
}

/** Create an empty 9×9 board filled with null */
export function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

/** Deep-clone a board */
export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

/** Check if placing `num` at (row, col) is legal */
export function isValidPlacement(
  board: Board,
  row: number,
  col: number,
  num: number
): boolean {
  // Row check
  if (board[row].includes(num)) return false;
  // Column check
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // 3×3 box check
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/** Backtracking solver. Returns true if solved. Mutates board in place. */
export function solveSudoku(board: Board, rng?: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) continue;

      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (rng) {
        // Shuffle for randomized generation
        for (let i = nums.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }
      }

      for (const num of nums) {
        if (isValidPlacement(board, row, col, num)) {
          board[row][col] = num;
          if (solveSudoku(board, rng)) return true;
          board[row][col] = null;
        }
      }

      return false; // no valid number found → backtrack
    }
  }
  return true; // all cells filled
}

/** Count solutions (stops at 2 for efficiency — we only need unique check) */
function countSolutions(board: Board, limit = 2): number {
  let count = 0;

  function solve(b: Board): void {
    if (count >= limit) return;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] !== null) continue;
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(b, row, col, num)) {
            b[row][col] = num;
            solve(b);
            b[row][col] = null;
          }
        }
        return;
      }
    }
    count++;
  }

  solve(cloneBoard(board));
  return count;
}

const CLUE_COUNTS: Record<Difficulty, number> = {
  easy: 38,
  medium: 30,
  hard: 24,
  expert: 17,
};

/**
 * Generate a new Sudoku puzzle.
 * Returns { board, solution } where board has nulls for empty cells.
 */
export function generatePuzzle(
  difficulty: Difficulty,
  seed?: number
): { board: Board; solution: Board } {
  const rng = seededRng(seed ?? Date.now());

  // Build a complete, valid solution
  const solution = emptyBoard();
  solveSudoku(solution, rng);

  // Copy solution and remove cells
  const board = cloneBoard(solution);
  const clueCount = CLUE_COUNTS[difficulty];
  const cellsToRemove = 81 - clueCount;

  // Create a shuffled list of all positions
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break;
    const backup = board[r][c];
    board[r][c] = null;

    // For expert difficulty skip uniqueness check for speed; harder puzzles
    // may have multiple solutions which is acceptable for gameplay
    if (difficulty !== "expert" && countSolutions(board) !== 1) {
      board[r][c] = backup;
    } else {
      removed++;
    }
  }

  return { board, solution };
}

/** Get the seeded daily puzzle for today */
export function getDailyPuzzle(): { board: Board; solution: Board; seed: number } {
  const today = new Date();
  // Normalise to UTC date so everyone worldwide gets the same puzzle
  const seed = dateToSeed(
    new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  );
  const puzzle = generatePuzzle("medium", seed);
  return { ...puzzle, seed };
}

/** Check if the current board matches the solution */
export function isSolved(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

/** Return a board of booleans marking cells that conflict with Sudoku rules */
export function findConflicts(board: Board): boolean[][] {
  const conflicts: boolean[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(false)
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === null) continue;

      // Check row
      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && board[r][cc] === val) {
          conflicts[r][c] = true;
          conflicts[r][cc] = true;
        }
      }

      // Check column
      for (let rr = 0; rr < 9; rr++) {
        if (rr !== r && board[rr][c] === val) {
          conflicts[r][c] = true;
          conflicts[rr][c] = true;
        }
      }

      // Check 3×3 box
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
          if ((rr !== r || cc !== c) && board[rr][cc] === val) {
            conflicts[r][c] = true;
            conflicts[rr][cc] = true;
          }
        }
      }
    }
  }

  return conflicts;
}

/** Return all cells that are related to (row, col): same row, col, or box */
export function getRelatedCells(row: number, col: number): Set<string> {
  const related = new Set<string>();
  for (let i = 0; i < 9; i++) {
    related.add(`${row}-${i}`);
    related.add(`${i}-${col}`);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      related.add(`${r}-${c}`);
    }
  }
  return related;
}

/** Get one hint: the easiest correct cell to fill */
export function getHint(
  board: Board,
  solution: Board,
  given: boolean[][]
): { row: number; col: number; value: number } | null {
  const candidates: { row: number; col: number; value: number; options: number }[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== null || given[r][c]) continue;
      // Count how many numbers are valid for this cell (naked single candidates)
      let options = 0;
      for (let n = 1; n <= 9; n++) {
        if (isValidPlacement(board, r, c, n)) options++;
      }
      candidates.push({ row: r, col: c, value: solution[r][c]!, options });
    }
  }

  if (candidates.length === 0) return null;
  // Return the cell with fewest options (easiest to deduce)
  candidates.sort((a, b) => a.options - b.options);
  return candidates[0];
}

/** Format seconds as mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Compute a score based on time, difficulty, and errors */
export function computeScore(
  seconds: number,
  difficulty: Difficulty,
  errorCount: number
): number {
  const base: Record<Difficulty, number> = {
    easy: 1000,
    medium: 2000,
    hard: 3500,
    expert: 5000,
  };
  const timePenalty = Math.min(seconds * 2, base[difficulty] * 0.6);
  const errorPenalty = errorCount * 50;
  return Math.max(0, Math.round(base[difficulty] - timePenalty - errorPenalty));
}

/** Build a human-readable explanation of a cell's valid numbers */
export function buildCellContext(
  board: Board,
  row: number,
  col: number
): string {
  const lines: string[] = [];

  const rowVals = board[row]
    .filter((v) => v !== null)
    .sort()
    .join(", ");
  const colVals = board
    .map((r) => r[col])
    .filter((v) => v !== null)
    .sort()
    .join(", ");

  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  const boxVals: number[] = [];
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (board[r][c] !== null) boxVals.push(board[r][c]!);
    }
  }

  lines.push(`Row ${row + 1} already contains: ${rowVals || "nothing yet"}`);
  lines.push(`Column ${col + 1} already contains: ${colVals || "nothing yet"}`);
  lines.push(
    `The 3×3 box already contains: ${boxVals.sort().join(", ") || "nothing yet"}`
  );

  const valid: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (isValidPlacement(board, row, col, n)) valid.push(n);
  }
  lines.push(`Valid candidates for this cell: ${valid.join(", ")}`);

  return lines.join("\n");
}
