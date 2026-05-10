// types/index.ts

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface CellPosition {
  row: number;
  col: number;
}

export interface GameState {
  board: (number | null)[][];
  solution: (number | null)[][];
  given: boolean[][];
  selected: CellPosition | null;
  notes: Set<number>[][];
  isNoteMode: boolean;
  difficulty: Difficulty;
  isComplete: boolean;
  errorCount: number;
  hintCount: number;
  highlightedNumber: number | null;
  moveHistory: MoveRecord[];
  startTime: number | null;
  elapsedSeconds: number;
  isDailyChallenge: boolean;
  score: number;
}

export interface MoveRecord {
  row: number;
  col: number;
  prevValue: number | null;
  nextValue: number | null;
  prevNotes: Set<number>;
  nextNotes: Set<number>;
  type: "number" | "note" | "clear";
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  score: number;
  time_seconds: number;
  error_count: number;
  difficulty: Difficulty;
  completed_at: string;
  rank?: number;
}

export interface DailyChallenge {
  date: string;
  seed: number;
  entries: LeaderboardEntry[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  games_played: number;
  games_won: number;
  best_time_easy: number | null;
  best_time_medium: number | null;
  best_time_hard: number | null;
  best_time_expert: number | null;
  total_score: number;
  streak: number;
  last_played: string | null;
  is_pro: boolean;
  created_at: string;
}

export interface AICoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DifficultyConfig {
  label: string;
  description: string;
  color: string;
  clues: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    description: "Perfect for warming up",
    color: "text-emerald-400",
    clues: 38,
  },
  medium: {
    label: "Medium",
    description: "A satisfying challenge",
    color: "text-sky-400",
    clues: 30,
  },
  hard: {
    label: "Hard",
    description: "Tests your logic deeply",
    color: "text-amber-400",
    clues: 24,
  },
  expert: {
    label: "Expert",
    description: "For the truly dedicated",
    color: "text-rose-400",
    clues: 17,
  },
};
