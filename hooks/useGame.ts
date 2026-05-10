"use client";
// hooks/useGame.ts — Complete game state management

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  Board,
  Difficulty,
  generatePuzzle,
  getDailyPuzzle,
  getHint,
  findConflicts,
  isSolved,
  computeScore,
} from "@/lib/sudoku";
import { MoveRecord } from "@/types";

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  board: Board;
  solution: Board;
  given: boolean[][];
  selected: { row: number; col: number } | null;
  notes: Set<number>[][];
  isNoteMode: boolean;
  difficulty: Difficulty;
  isComplete: boolean;
  errorCount: number;
  hintCount: number;
  highlightedNumber: number | null;
  history: MoveRecord[];
  startTime: number | null;
  isDailyChallenge: boolean;
  dailySeed: number | null;
  lastAnimatedCell: { row: number; col: number; type: "ok" | "error" } | null;
}

const INITIAL_NOTES = (): Set<number>[][] =>
  Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));

function buildGiven(board: Board): boolean[][] {
  return board.map((row) => row.map((cell) => cell !== null));
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "NEW_GAME"; difficulty: Difficulty }
  | { type: "LOAD_DAILY" }
  | { type: "SELECT_CELL"; row: number; col: number }
  | { type: "INPUT_NUMBER"; num: number }
  | { type: "CLEAR_CELL" }
  | { type: "TOGGLE_NOTE"; num: number }
  | { type: "TOGGLE_NOTE_MODE" }
  | { type: "HINT" }
  | { type: "UNDO" }
  | { type: "HIGHLIGHT_NUMBER"; num: number | null }
  | { type: "TICK"; seconds: number }
  | { type: "CLEAR_ANIMATION" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEW_GAME": {
      const { board, solution } = generatePuzzle(action.difficulty);
      return {
        ...state,
        board,
        solution,
        given: buildGiven(board),
        selected: null,
        notes: INITIAL_NOTES(),
        isNoteMode: false,
        difficulty: action.difficulty,
        isComplete: false,
        errorCount: 0,
        hintCount: 0,
        highlightedNumber: null,
        history: [],
        startTime: Date.now(),
        isDailyChallenge: false,
        dailySeed: null,
        lastAnimatedCell: null,
      };
    }

    case "LOAD_DAILY": {
      const { board, solution, seed } = getDailyPuzzle();
      // Restore progress from localStorage
      const savedKey = `daily-${seed}`;
      let restoredBoard = board;
      let restoredNotes = INITIAL_NOTES();
      let restoredErrors = 0;
      let restoredHints = 0;
      let restoredStart: number | null = Date.now();

      try {
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          restoredBoard = parsed.board ?? board;
          restoredErrors = parsed.errorCount ?? 0;
          restoredHints = parsed.hintCount ?? 0;
          restoredStart = parsed.startTime ?? Date.now();
          if (parsed.notes) {
            restoredNotes = parsed.notes.map((row: number[][]) =>
              row.map((cell: number[]) => new Set<number>(cell))
            );
          }
        }
      } catch {
        /* ignore */
      }

      return {
        ...state,
        board: restoredBoard,
        solution,
        given: buildGiven(board),
        selected: null,
        notes: restoredNotes,
        isNoteMode: false,
        difficulty: "medium",
        isComplete: isSolved(restoredBoard, solution),
        errorCount: restoredErrors,
        hintCount: restoredHints,
        highlightedNumber: null,
        history: [],
        startTime: restoredStart,
        isDailyChallenge: true,
        dailySeed: seed,
        lastAnimatedCell: null,
      };
    }

    case "SELECT_CELL":
      return {
        ...state,
        selected: { row: action.row, col: action.col },
        highlightedNumber:
          state.board[action.row][action.col] ?? state.highlightedNumber,
      };

    case "TOGGLE_NOTE_MODE":
      return { ...state, isNoteMode: !state.isNoteMode };

    case "HIGHLIGHT_NUMBER":
      return { ...state, highlightedNumber: action.num };

    case "CLEAR_ANIMATION":
      return { ...state, lastAnimatedCell: null };

    case "TICK":
      return state; // Timer is handled outside to avoid re-renders

    case "INPUT_NUMBER": {
      const { selected, board, solution, given, notes, isNoteMode } = state;
      if (!selected) return state;
      const { row, col } = selected;
      if (given[row][col]) return state;

      if (isNoteMode) {
        // Delegate to TOGGLE_NOTE
        const newNotes = notes.map((r) => r.map((s) => new Set(s)));
        const cell = newNotes[row][col];
        if (cell.has(action.num)) cell.delete(action.num);
        else cell.add(action.num);

        const move: MoveRecord = {
          row,
          col,
          prevValue: board[row][col],
          nextValue: board[row][col],
          prevNotes: new Set(notes[row][col]),
          nextNotes: new Set(cell),
          type: "note",
        };

        return {
          ...state,
          notes: newNotes,
          history: [...state.history, move],
        };
      }

      const prevValue = board[row][col];
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = action.num;

      // Auto-clear notes for this number in related cells
      const newNotes = notes.map((r) => r.map((s) => new Set(s)));
      // clear same row, col, box
      for (let i = 0; i < 9; i++) {
        newNotes[row][i].delete(action.num);
        newNotes[i][col].delete(action.num);
      }
      const br = Math.floor(row / 3) * 3;
      const bc = Math.floor(col / 3) * 3;
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          newNotes[r][c].delete(action.num);
        }
      }

      const isCorrect = solution[row][col] === action.num;
      const newErrors = isCorrect ? state.errorCount : state.errorCount + 1;
      const complete = isSolved(newBoard, solution);

      const move: MoveRecord = {
        row,
        col,
        prevValue,
        nextValue: action.num,
        prevNotes: new Set(notes[row][col]),
        nextNotes: new Set<number>(),
        type: "number",
      };

      return {
        ...state,
        board: newBoard,
        notes: newNotes,
        errorCount: newErrors,
        isComplete: complete,
        highlightedNumber: action.num,
        history: [...state.history, move],
        lastAnimatedCell: { row, col, type: isCorrect ? "ok" : "error" },
      };
    }

    case "CLEAR_CELL": {
      const { selected, board, given, notes } = state;
      if (!selected) return state;
      const { row, col } = selected;
      if (given[row][col]) return state;

      const move: MoveRecord = {
        row,
        col,
        prevValue: board[row][col],
        nextValue: null,
        prevNotes: new Set(notes[row][col]),
        nextNotes: new Set<number>(),
        type: "clear",
      };

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = null;
      const newNotes = notes.map((r) => r.map((s) => new Set(s)));
      newNotes[row][col] = new Set();

      return {
        ...state,
        board: newBoard,
        notes: newNotes,
        history: [...state.history, move],
        highlightedNumber: null,
        lastAnimatedCell: null,
      };
    }

    case "TOGGLE_NOTE": {
      const { selected, notes, board } = state;
      if (!selected) return state;
      const { row, col } = selected;
      if (state.given[row][col] || board[row][col] !== null) return state;

      const newNotes = notes.map((r) => r.map((s) => new Set(s)));
      const cell = newNotes[row][col];
      if (cell.has(action.num)) cell.delete(action.num);
      else cell.add(action.num);

      const move: MoveRecord = {
        row,
        col,
        prevValue: board[row][col],
        nextValue: board[row][col],
        prevNotes: new Set(notes[row][col]),
        nextNotes: new Set(cell),
        type: "note",
      };

      return { ...state, notes: newNotes, history: [...state.history, move] };
    }

    case "HINT": {
      const { board, solution, given, notes, hintCount } = state;
      const hint = getHint(board, solution, given);
      if (!hint) return state;

      const newBoard = board.map((r) => [...r]);
      newBoard[hint.row][hint.col] = hint.value;
      const newNotes = notes.map((r) => r.map((s) => new Set(s)));
      newNotes[hint.row][hint.col] = new Set();

      return {
        ...state,
        board: newBoard,
        notes: newNotes,
        hintCount: hintCount + 1,
        selected: { row: hint.row, col: hint.col },
        isComplete: isSolved(newBoard, solution),
        highlightedNumber: hint.value,
        lastAnimatedCell: { row: hint.row, col: hint.col, type: "ok" },
      };
    }

    case "UNDO": {
      if (state.history.length === 0) return state;
      const lastMove = state.history[state.history.length - 1];
      const newBoard = state.board.map((r) => [...r]);
      newBoard[lastMove.row][lastMove.col] = lastMove.prevValue;
      const newNotes = state.notes.map((r) => r.map((s) => new Set(s)));
      newNotes[lastMove.row][lastMove.col] = new Set(lastMove.prevNotes);

      return {
        ...state,
        board: newBoard,
        notes: newNotes,
        history: state.history.slice(0, -1),
        selected: { row: lastMove.row, col: lastMove.col },
        isComplete: false,
        lastAnimatedCell: null,
      };
    }

    default:
      return state;
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────

function createInitialState(difficulty: Difficulty = "medium"): State {
  const { board, solution } = generatePuzzle(difficulty);
  return {
    board,
    solution,
    given: buildGiven(board),
    selected: null,
    notes: INITIAL_NOTES(),
    isNoteMode: false,
    difficulty,
    isComplete: false,
    errorCount: 0,
    hintCount: 0,
    highlightedNumber: null,
    history: [],
    startTime: null,
    isDailyChallenge: false,
    dailySeed: null,
    lastAnimatedCell: null,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(initialDifficulty: Difficulty = "medium") {
  const [state, dispatch] = useReducer(reducer, initialDifficulty, createInitialState);
  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useElapsedSeconds(state.startTime, state.isComplete);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        dispatch({ type: "INPUT_NUMBER", num });
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        dispatch({ type: "CLEAR_CELL" });
        return;
      }
      if (e.key === "n" || e.key === "N") {
        dispatch({ type: "TOGGLE_NOTE_MODE" });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }
      // Arrow key navigation
      if (!state.selected) return;
      const { row, col } = state.selected;
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      if (dirs[e.key]) {
        e.preventDefault();
        const [dr, dc] = dirs[e.key];
        const nr = Math.max(0, Math.min(8, row + dr));
        const nc = Math.max(0, Math.min(8, col + dc));
        dispatch({ type: "SELECT_CELL", row: nr, col: nc });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.selected]);

  // Persist daily progress
  useEffect(() => {
    if (!state.isDailyChallenge || !state.dailySeed) return;
    const savedKey = `daily-${state.dailySeed}`;
    try {
      const serializable = {
        board: state.board,
        errorCount: state.errorCount,
        hintCount: state.hintCount,
        startTime: state.startTime,
        notes: state.notes.map((row) => row.map((s) => Array.from(s))),
      };
      localStorage.setItem(savedKey, JSON.stringify(serializable));
    } catch {
      /* ignore */
    }
  }, [state.board, state.isDailyChallenge, state.dailySeed, state.errorCount, state.hintCount, state.startTime, state.notes]);

  const conflicts = findConflicts(state.board);
  const score = state.isComplete
    ? computeScore(elapsed, state.difficulty, state.errorCount)
    : 0;

  return {
    ...state,
    elapsed,
    conflicts,
    score,
    dispatch,
    // Convenience actions
    newGame: (difficulty: Difficulty) => dispatch({ type: "NEW_GAME", difficulty }),
    loadDaily: () => dispatch({ type: "LOAD_DAILY" }),
    selectCell: (row: number, col: number) => dispatch({ type: "SELECT_CELL", row, col }),
    inputNumber: (num: number) => dispatch({ type: "INPUT_NUMBER", num }),
    clearCell: () => dispatch({ type: "CLEAR_CELL" }),
    toggleNoteMode: () => dispatch({ type: "TOGGLE_NOTE_MODE" }),
    getHintAction: () => dispatch({ type: "HINT" }),
    undo: () => dispatch({ type: "UNDO" }),
    setHighlight: (num: number | null) => dispatch({ type: "HIGHLIGHT_NUMBER", num }),
  };
}

// ─── Elapsed Timer Hook ───────────────────────────────────────────────────────

function useElapsedSeconds(startTime: number | null, paused: boolean): [number, (n: number) => void] {
  const [elapsed, setElapsed] = useStateWithRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startTime || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime, paused]);

  return [elapsed, setElapsed];
}

function useStateWithRef<T>(initial: T): [T, (v: T) => void] {
  const [value, setValue] = require("react").useState<T>(initial);
  return [value, setValue];
}
