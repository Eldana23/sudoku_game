"use client";
// hooks/useRoom.ts — Real-time multiplayer room state
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getRoomWithPlayers, submitMove, sendChatMessage, setPlayerReady, startRoom, leaveRoom, updateRaceProgress, finishRace, finishRoom } from "@/lib/rooms";
import { findConflicts, isSolved, cloneBoard, emptyBoard } from "@/lib/sudoku";
import type { Room, RoomPlayer, ChatMessage, CursorPosition, BroadcastMove, BroadcastCursor } from "@/types/multiplayer";

interface UseRoomReturn {
  room: Room | null;
  players: (RoomPlayer & { username: string; display_name: string; avatar_url: string | null })[];
  board: (number | null)[][];
  given: boolean[][];
  conflicts: boolean[][];
  notes: Set<number>[][];
  cursors: CursorPosition[];
  chat: ChatMessage[];
  myColor: string;
  isLoading: boolean;
  error: string | null;
  // actions
  placeNumber: (row: number, col: number, value: number | null) => Promise<void>;
  toggleNote: (row: number, col: number, num: number) => void;
  moveCursor: (row: number | null, col: number | null) => void;
  sendMessage: (message: string) => Promise<void>;
  sendEmoji: (emoji: string) => Promise<void>;
  markReady: () => Promise<void>;
  beginGame: () => Promise<void>;
  leave: () => Promise<void>;
}

export function useRoom(
  roomId: string,
  userId: string,
  username: string,
): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<UseRoomReturn["players"]>([]);
  const [board, setBoard] = useState<(number | null)[][]>(emptyBoard());
  const [given, setGiven] = useState<boolean[][]>(Array.from({ length: 9 }, () => Array(9).fill(false)));
  const [notes, setNotes] = useState<Set<number>[][]>(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()))
  );
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [myColor, setMyColor] = useState("#6d5dfc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Derived state
  const conflicts = findConflicts(board);

  // Load initial state
  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }

    async function init() {
      try {
        const result = await getRoomWithPlayers(roomId);
        if (!result) { setError("Room not found"); return; }

        const { room: r, players: p } = result;
        setRoom(r);
        setPlayers(p);

        // Set board from room state (co-op: shared; race: own board)
        if (r.board_state) {
          const b = r.board_state as (number | null)[][];
          setBoard(b);
          setGiven(b.map(row => row.map(cell => cell !== null)));
        }

        // Find my color
        const me = p.find(pl => pl.user_id === userId);
        if (me) setMyColor(me.color);
      } catch (e) {
        setError("Failed to load room");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [roomId, userId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    // Co-op moves from DB
    channel.on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "moves",
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      const move = payload.new as { user_id: string; row_idx: number; col_idx: number; value: number | null; is_note: boolean; note_values: number[] | null };
      if (move.user_id === userId) return; // own moves applied locally

      if (move.is_note) {
        setNotes(prev => {
          const n = prev.map(r => r.map(s => new Set(s)));
          const nums = move.note_values ?? [];
          nums.forEach(num => {
            if (n[move.row_idx][move.col_idx].has(num)) n[move.row_idx][move.col_idx].delete(num);
            else n[move.row_idx][move.col_idx].add(num);
          });
          return n;
        });
      } else {
        setBoard(prev => {
          const b = prev.map(r => [...r]);
          b[move.row_idx][move.col_idx] = move.value;
          return b;
        });
        if (move.value !== null) {
          setNotes(prev => {
            const n = prev.map(r => r.map(s => new Set(s)));
            // Clear notes in row / col / box
            for (let i = 0; i < 9; i++) {
              n[move.row_idx][i].delete(move.value!);
              n[i][move.col_idx].delete(move.value!);
            }
            const br = Math.floor(move.row_idx / 3) * 3, bc = Math.floor(move.col_idx / 3) * 3;
            for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) n[r][c].delete(move.value!);
            return n;
          });
        }
      }
    });

    // Room players changes
    channel.on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "room_players",
      filter: `room_id=eq.${roomId}`,
    }, async () => {
      const result = await getRoomWithPlayers(roomId);
      if (result) setPlayers(result.players);
    });

    // Room status changes
    channel.on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "rooms",
      filter: `id=eq.${roomId}`,
    }, (payload) => {
      setRoom(payload.new as Room);
    });

    // Chat messages
    channel.on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "room_chat",
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      setChat(prev => [...prev, payload.new as ChatMessage]);
    });

    // Broadcast: cursor positions
    channel.on("broadcast", { event: "cursor" }, ({ payload }) => {
      const p = payload as BroadcastCursor;
      setCursors(prev => {
        const filtered = prev.filter(c => c.userId !== p.userId);
        if (p.row === null) return filtered;
        return [...filtered, { userId: p.userId, username: p.username, color: p.color, row: p.row, col: p.col ?? 0 }];
      });
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, userId]);

  // Place a number (local + broadcast + persist)
  const placeNumber = useCallback(async (row: number, col: number, value: number | null) => {
    if (!room) return;
    if (given[row][col]) return; // can't overwrite given cells

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);

    // Clear notes in row/col/box when placing a number
    if (value !== null) {
      setNotes(prev => {
        const n = prev.map(r => r.map(s => new Set(s)));
        for (let i = 0; i < 9; i++) { n[row][i].delete(value); n[i][col].delete(value); }
        const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) n[r][c].delete(value);
        return n;
      });
    }

    // Persist to DB
    await submitMove({ roomId, userId, row, col, value, isNote: false, newBoardState: newBoard });

    // Race mode: update progress
    if (room.mode === "race") {
      const filled = newBoard.flat().filter(v => v !== null).length;
      await updateRaceProgress(roomId, userId, filled, newBoard);
      setPlayers(prev => prev.map(p => p.user_id === userId ? { ...p, progress: filled } : p));
    }

    // Check completion
    if (isSolved(newBoard)) {
      if (room.mode === "race") {
        const finishedCount = players.filter(p => p.finished_at !== null).length;
        await finishRace(roomId, userId, finishedCount + 1);
      } else {
        await finishRoom(roomId);
      }
    }
  }, [room, board, given, roomId, userId, players]);

  const toggleNote = useCallback((row: number, col: number, num: number) => {
    if (given[row][col] || board[row][col] !== null) return;
    setNotes(prev => {
      const n = prev.map(r => r.map(s => new Set(s)));
      if (n[row][col].has(num)) n[row][col].delete(num);
      else n[row][col].add(num);
      return n;
    });
    // Broadcast note (not persisted for performance)
    channelRef.current?.send({
      type: "broadcast",
      event: "cursor",
      payload: { userId, username, color: myColor, row, col } as BroadcastCursor,
    });
  }, [given, board, userId, username, myColor]);

  const moveCursor = useCallback((row: number | null, col: number | null) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "cursor",
      payload: { userId, username, color: myColor, row, col } as BroadcastCursor,
    });
  }, [userId, username, myColor]);

  const sendMessage = useCallback(async (message: string) => {
    await sendChatMessage({ roomId, userId, username, message });
  }, [roomId, userId, username]);

  const sendEmoji = useCallback(async (emoji: string) => {
    await sendChatMessage({ roomId, userId, username, emoji });
  }, [roomId, userId, username]);

  const markReady = useCallback(async () => {
    const me = players.find(p => p.user_id === userId);
    await setPlayerReady(roomId, userId, !(me?.is_ready ?? false));
  }, [roomId, userId, players]);

  const beginGame = useCallback(async () => {
    await startRoom(roomId);
  }, [roomId]);

  const leave = useCallback(async () => {
    await leaveRoom(roomId, userId);
    channelRef.current?.unsubscribe();
  }, [roomId, userId]);

  return {
    room, players, board, given, conflicts, notes, cursors, chat,
    myColor, isLoading, error,
    placeNumber, toggleNote, moveCursor, sendMessage, sendEmoji,
    markReady, beginGame, leave,
  };
}
