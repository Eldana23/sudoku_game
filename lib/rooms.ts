// lib/rooms.ts
import { supabase } from "./supabase";
import { generatePuzzle, solveSudoku, cloneBoard } from "./sudoku";
import type { Room, RoomPlayer, RoomMove, ChatMessage } from "@/types/multiplayer";
import { PLAYER_COLORS } from "@/types/multiplayer";

/** Create a new multiplayer room */
export async function createRoom(params: {
  hostId: string;
  mode: "coop" | "race";
  difficulty: "easy" | "medium" | "hard" | "expert";
}): Promise<Room> {
  if (!supabase) throw new Error("Supabase not configured");

  const { board, solution } = generatePuzzle(params.difficulty);
  const seed = Date.now();

  // Generate a unique room code via DB function
  const { data: codeData, error: codeError } = await supabase
    .rpc("generate_room_code");
  if (codeError) throw codeError;

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      code: codeData,
      host_id: params.hostId,
      mode: params.mode,
      difficulty: params.difficulty,
      puzzle_seed: seed,
      board_state: board,
      solution: solution,
      status: "waiting",
    })
    .select()
    .single();

  if (error) throw error;

  // Add host as first player
  await joinRoom(room.id, params.hostId, true);

  return room;
}

/** Join an existing room by room ID */
export async function joinRoom(
  roomId: string,
  userId: string,
  isHost = false
): Promise<RoomPlayer> {
  if (!supabase) throw new Error("Supabase not configured");

  // Count current players to assign color
  const { count } = await supabase
    .from("room_players")
    .select("id", { count: "exact" })
    .eq("room_id", roomId);

  const colorIndex = Math.min((count ?? 0), PLAYER_COLORS.length - 1);
  const color = PLAYER_COLORS[colorIndex];

  const { data, error } = await supabase
    .from("room_players")
    .upsert({
      room_id: roomId,
      user_id: userId,
      color,
      is_host: isHost,
      is_ready: false,
      progress: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Look up a room by its 6-char code */
export async function findRoomByCode(code: string): Promise<Room | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error) return null;
  return data;
}

/** Get full room with players (joined with profile data) */
export async function getRoomWithPlayers(roomId: string): Promise<{
  room: Room;
  players: (RoomPlayer & { username: string; display_name: string; avatar_url: string | null })[];
} | null> {
  if (!supabase) return null;

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomErr || !room) return null;

  const { data: players, error: playersErr } = await supabase
    .from("room_players")
    .select(`
      *,
      profiles (username, display_name, avatar_url)
    `)
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (playersErr) return null;

  const enriched = (players ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    username: (p.profiles as Record<string, unknown>)?.username as string ?? "Unknown",
    display_name: (p.profiles as Record<string, unknown>)?.display_name as string ?? "",
    avatar_url: (p.profiles as Record<string, unknown>)?.avatar_url as string | null ?? null,
  }));

  return { room, players: enriched };
}

/** Mark a player as ready */
export async function setPlayerReady(roomId: string, userId: string, ready: boolean) {
  if (!supabase) return;
  await supabase
    .from("room_players")
    .update({ is_ready: ready })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

/** Start the game (host only) */
export async function startRoom(roomId: string) {
  if (!supabase) return;
  await supabase
    .from("rooms")
    .update({ status: "playing", started_at: new Date().toISOString() })
    .eq("id", roomId);
}

/** Submit a co-op move */
export async function submitMove(params: {
  roomId: string;
  userId: string;
  row: number;
  col: number;
  value: number | null;
  isNote: boolean;
  noteValues?: number[];
  newBoardState: (number | null)[][];
}): Promise<void> {
  if (!supabase) return;

  // Insert move record
  await supabase.from("moves").insert({
    room_id: params.roomId,
    user_id: params.userId,
    row_idx: params.row,
    col_idx: params.col,
    value: params.value,
    is_note: params.isNote,
    note_values: params.noteValues ?? null,
  });

  // Update shared board (co-op)
  await supabase
    .from("rooms")
    .update({ board_state: params.newBoardState })
    .eq("id", params.roomId);
}

/** Update race progress for a player */
export async function updateRaceProgress(
  roomId: string,
  userId: string,
  progress: number,
  raceBoard: (number | null)[][]
) {
  if (!supabase) return;
  await supabase
    .from("room_players")
    .update({ progress, race_board: raceBoard })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

/** Mark a race player as finished */
export async function finishRace(roomId: string, userId: string, rank: number) {
  if (!supabase) return;
  await supabase
    .from("room_players")
    .update({ finished_at: new Date().toISOString(), rank })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

/** Send a chat message */
export async function sendChatMessage(params: {
  roomId: string;
  userId: string;
  username: string;
  message?: string;
  emoji?: string;
}) {
  if (!supabase) return;
  await supabase.from("room_chat").insert({
    room_id: params.roomId,
    user_id: params.userId,
    username: params.username,
    message: params.message ?? null,
    emoji: params.emoji ?? null,
  });
}

/** Get recent chat messages for a room */
export async function getChatHistory(roomId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("room_chat")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(100);
  return data ?? [];
}

/** Get move history for a room */
export async function getMoveHistory(roomId: string): Promise<RoomMove[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("moves")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** Leave a room (remove player record) */
export async function leaveRoom(roomId: string, userId: string) {
  if (!supabase) return;
  await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

/** Finish a co-op room */
export async function finishRoom(roomId: string) {
  if (!supabase) return;
  await supabase
    .from("rooms")
    .update({ status: "finished", finished_at: new Date().toISOString() })
    .eq("id", roomId);
}

/** Get public waiting rooms (lobby) */
export async function getPublicRooms() {
  if (!supabase) return [];
  const { data } = await supabase
    .from("rooms")
    .select(`
      id, code, mode, difficulty, status, max_players, created_at,
      room_players (count)
    `)
    .eq("status", "waiting")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
