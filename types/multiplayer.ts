// types/multiplayer.ts

export type RoomMode = "coop" | "race";
export type RoomStatus = "waiting" | "playing" | "finished";
export type FriendshipStatus = "pending" | "accepted" | "blocked";

export const PLAYER_COLORS = [
  "#6d5dfc", // indigo  (host)
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
] as const;

export interface Room {
  id: string;
  code: string;
  host_id: string;
  mode: RoomMode;
  difficulty: "easy" | "medium" | "hard" | "expert";
  puzzle_seed: number;
  board_state: (number | null)[][] | null;
  solution: (number | null)[][] | null;
  status: RoomStatus;
  max_players: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  color: string;
  is_host: boolean;
  is_ready: boolean;
  race_board: (number | null)[][] | null;
  progress: number;
  finished_at: string | null;
  rank: number | null;
  joined_at: string;
}

export interface RoomMove {
  id: string;
  room_id: string;
  user_id: string;
  row_idx: number;
  col_idx: number;
  value: number | null;
  is_note: boolean;
  note_values: number[] | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string | null;
  username: string;
  message: string | null;
  emoji: string | null;
  created_at: string;
}

export interface CursorPosition {
  userId: string;
  username: string;
  color: string;
  row: number;
  col: number;
}

export interface BroadcastMove {
  userId: string;
  color: string;
  row: number;
  col: number;
  value: number | null;
  isNote: boolean;
  noteValues?: number[];
}

export interface BroadcastCursor {
  userId: string;
  username: string;
  color: string;
  row: number | null;
  col: number | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  // from view
  requester_username?: string;
  requester_display_name?: string;
  requester_avatar_url?: string | null;
  addressee_username?: string;
  addressee_display_name?: string;
  addressee_avatar_url?: string | null;
}

export interface PlayerStats {
  user_id: string;
  games_played: number;
  games_completed: number;
  total_solve_time: number;
  total_errors: number;
  hints_used: number;
  best_time_easy: number | null;
  best_time_medium: number | null;
  best_time_hard: number | null;
  best_time_expert: number | null;
  rooms_created: number;
  coop_wins: number;
  races_played: number;
  races_won: number;
  daily_streak: number;
  longest_streak: number;
  last_daily_date: string | null;
  total_score: number;
}

export interface RoomState {
  room: Room | null;
  players: RoomPlayer[];
  board: (number | null)[][];
  given: boolean[][];
  notes: Set<number>[][];
  cursors: CursorPosition[];
  chat: ChatMessage[];
  myColor: string;
  isLoading: boolean;
  error: string | null;
}
