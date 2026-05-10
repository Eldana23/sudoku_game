"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Check, Send, Users, Trophy, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { useRoom } from "@/hooks/useRoom";
import { formatTime } from "@/lib/utils";

const QUICK_EMOJIS = ["🎉", "💪", "🧠", "🔥", "👏", "😅"];

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const roomId = params.roomId as string;

  const {
    room, players, board, given, conflicts, notes, cursors,
    chat, myColor, isLoading, error,
    placeNumber, toggleNote, moveCursor, sendMessage, sendEmoji,
    markReady, beginGame, leave,
  } = useRoom(roomId, user?.id ?? "", profile?.username ?? "Guest");

  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (room?.status !== "playing") return;
    const start = room.started_at ? new Date(room.started_at).getTime() : Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [room?.status, room?.started_at]);

  // Keyboard handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selected || room?.status !== "playing") return;
      const { row, col } = selected;
      if (e.key >= "1" && e.key <= "9") {
        const num = parseInt(e.key);
        if (isNoteMode) toggleNote(row, col, num);
        else placeNumber(row, col, num);
      }
      if (e.key === "Backspace" || e.key === "0" || e.key === "Delete") placeNumber(row, col, null);
      if (e.key === "n" || e.key === "N") setIsNoteMode(n => !n);
      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
      };
      if (moves[e.key]) {
        e.preventDefault();
        const [dr, dc] = moves[e.key];
        const nr = Math.max(0, Math.min(8, row + dr));
        const nc = Math.max(0, Math.min(8, col + dc));
        setSelected({ row: nr, col: nc });
        moveCursor(nr, nc);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, room?.status, isNoteMode, placeNumber, toggleNote, moveCursor]);

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    await sendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleLeave = async () => {
    await leave();
    router.push("/lobby");
  };

  const me = players.find(p => p.user_id === (user?.id ?? ""));
  const isHost = me?.is_host ?? false;
  const allReady = players.length > 1 && players.every(p => p.is_ready || p.is_host);

  if (isLoading) return <LoadingScreen />;
  if (error || !room) return <ErrorScreen msg={error ?? "Room not found"} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ height: "56px", background: "rgba(7,7,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(100,100,200,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={handleLeave} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
            <ArrowLeft size={15} /> Leave
          </button>
          <div style={{ width: "1px", height: "20px", background: "rgba(100,100,200,0.2)" }} />
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
            {room.mode === "coop" ? "🤝 Co-op" : "⚡ Race"} · {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {room.status === "playing" && (
            <div style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "1rem", color: "var(--text-primary)", background: "rgba(109,93,252,0.12)", border: "1px solid rgba(109,93,252,0.2)", borderRadius: "8px", padding: "4px 12px" }}>
              {formatTime(elapsed)}
            </div>
          )}
          <button onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "var(--bg-2)", border: "1px solid rgba(100,100,200,0.2)", borderRadius: "8px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            {copied ? <><Check size={13} color="#34d399" /> Copied!</> : <><Copy size={13} /> {room.code}</>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Players / Chat */}
        <div style={{ width: "240px", borderRight: "1px solid rgba(100,100,200,0.1)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Players */}
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(100,100,200,0.1)" }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Players ({players.length})</p>
            {players.map(p => (
              <div key={p.user_id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.85rem", color: p.user_id === user?.id ? "#e8e8f4" : "#9090b8", fontWeight: p.user_id === user?.id ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.display_name || p.username}
                </span>
                {p.is_host && <Crown size={11} color="#f59e0b" />}
                {room.mode === "race" && room.status === "playing" && (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{p.progress}/81</span>
                )}
                {room.status === "waiting" && !p.is_host && (
                  <span style={{ fontSize: "0.7rem", color: p.is_ready ? "#34d399" : "#5a5a7a" }}>{p.is_ready ? "✓" : "…"}</span>
                )}
                {p.rank && <span style={{ fontSize: "0.72rem", color: "#f59e0b" }}>#{p.rank}</span>}
              </div>
            ))}
          </div>

          {/* Chat */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {chat.map(m => (
                <div key={m.id} style={{ marginBottom: "8px" }}>
                  {m.emoji ? (
                    <span style={{ fontSize: "1.4rem" }}>{m.emoji}</span>
                  ) : (
                    <>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>{m.username}: </span>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{m.message}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(100,100,200,0.1)", padding: "8px" }}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "6px", flexWrap: "wrap" }}>
                {QUICK_EMOJIS.map(e => (
                  <button key={e} onClick={() => sendEmoji(e)} style={{ fontSize: "1rem", background: "none", border: "none", cursor: "pointer", padding: "2px" }}>{e}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendChat(); }}
                  placeholder="Message…" style={{ flex: 1, background: "var(--bg-3)", border: "1px solid rgba(100,100,200,0.15)", borderRadius: "6px", padding: "7px 10px", color: "var(--text-primary)", fontSize: "0.8rem", outline: "none" }} />
                <button onClick={handleSendChat} style={{ background: "rgba(109,93,252,0.15)", border: "1px solid rgba(109,93,252,0.3)", borderRadius: "6px", padding: "7px 10px", cursor: "pointer", color: "#818cf8" }}>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Board */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          {room.status === "waiting" ? (
            <WaitingScreen room={room} players={players} me={me} isHost={isHost} allReady={allReady} onReady={markReady} onStart={beginGame} />
          ) : room.status === "finished" ? (
            <FinishedScreen players={players} room={room} onLeave={handleLeave} />
          ) : (
            <MultiplayerBoard
              board={board} given={given} conflicts={conflicts} notes={notes}
              selected={selected} cursors={cursors} isNoteMode={isNoteMode}
              myColor={myColor}
              onSelect={(r, c) => { setSelected({ row: r, col: c }); moveCursor(r, c); }}
              onNumber={(n) => { if (selected) { if (isNoteMode) toggleNote(selected.row, selected.col, n); else placeNumber(selected.row, selected.col, n); } }}
              onToggleNotes={() => setIsNoteMode(n => !n)}
              onClear={() => { if (selected) placeNumber(selected.row, selected.col, null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WaitingScreen({ room, players, me, isHost, allReady, onReady, onStart }: {
  room: any; players: any[]; me: any; isHost: boolean; allReady: boolean;
  onReady: () => void; onStart: () => void;
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: "400px" }}>
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{room.mode === "coop" ? "🤝" : "⚡"}</div>
      <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "var(--text-primary)", margin: "0 0 8px" }}>
        Waiting for players…
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
        {players.length} / {room.max_players} joined
      </p>
      {!isHost && (
        <button onClick={onReady} style={{ padding: "11px 28px", background: me?.is_ready ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg,#6d5dfc,#818cf8)", border: me?.is_ready ? "1px solid rgba(52,211,153,0.4)" : "none", borderRadius: "10px", color: me?.is_ready ? "#34d399" : "white", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", marginBottom: "16px" }}>
          {me?.is_ready ? "✓ Ready!" : "Mark Ready"}
        </button>
      )}
      {isHost && (
        <button onClick={onStart} disabled={!allReady && players.length < 2} style={{ padding: "11px 28px", background: allReady || players.length >= 1 ? "linear-gradient(135deg,#6d5dfc,#818cf8)" : "rgba(100,100,200,0.12)", border: "none", borderRadius: "10px", color: allReady || players.length >= 1 ? "white" : "#5a5a7a", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
          Start Game
        </button>
      )}
      <p style={{ marginTop: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        Share code <strong style={{ color: "#818cf8", fontFamily: "monospace" }}>{room.code}</strong> with friends
      </p>
    </div>
  );
}

function FinishedScreen({ players, room, onLeave }: { players: any[]; room: any; onLeave: () => void }) {
  const sorted = [...players].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  return (
    <div style={{ textAlign: "center", maxWidth: "360px" }}>
      <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏁</div>
      <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "var(--text-primary)", margin: "0 0 24px" }}>
        {room.mode === "coop" ? "Puzzle Solved!" : "Race Finished!"}
      </h2>
      {room.mode === "race" && sorted.map((p, i) => (
        <div key={p.user_id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", marginBottom: "8px", background: "var(--bg-2)", border: "1px solid rgba(100,100,200,0.12)", borderRadius: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>{["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`}</span>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
          <span style={{ flex: 1, textAlign: "left", color: "var(--text-primary)", fontSize: "0.9rem" }}>{p.display_name || p.username}</span>
          {p.finished_at && <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>✓</span>}
        </div>
      ))}
      <button onClick={onLeave} style={{ marginTop: "20px", padding: "11px 28px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", border: "none", borderRadius: "10px", color: "white", fontFamily: "Syne,sans-serif", fontWeight: 700, cursor: "pointer" }}>
        Back to Lobby
      </button>
    </div>
  );
}

function MultiplayerBoard({ board, given, conflicts, notes, selected, cursors, isNoteMode, myColor, onSelect, onNumber, onToggleNotes, onClear }: {
  board: (number | null)[][];
  given: boolean[][];
  conflicts: boolean[][];
  notes: Set<number>[][];
  selected: { row: number; col: number } | null;
  cursors: any[];
  isNoteMode: boolean;
  myColor: string;
  onSelect: (r: number, c: number) => void;
  onNumber: (n: number) => void;
  onToggleNotes: () => void;
  onClear: () => void;
}) {
  const getHighlight = (row: number, col: number) => {
    if (!selected) return "none";
    if (selected.row === row && selected.col === col) return "selected";
    if (selected.row === row || selected.col === col ||
      (Math.floor(selected.row / 3) === Math.floor(row / 3) && Math.floor(selected.col / 3) === Math.floor(col / 3)))
      return "related";
    return "none";
  };

  const getCursorColor = (row: number, col: number) => {
    const c = cursors.find(cu => cu.row === row && cu.col === col);
    return c?.color ?? null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(9,1fr)", width: "min(480px, 90vw)", aspectRatio: "1", border: "2px solid rgba(109,93,252,0.5)", borderRadius: "12px", overflow: "hidden", gap: 0 }}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const hl = getHighlight(r, c);
            const isError = conflicts[r][c] && val !== null;
            const cursorColor = getCursorColor(r, c);
            const borderRight = (c + 1) % 3 === 0 && c < 8 ? "2px solid rgba(109,93,252,0.4)" : "1px solid rgba(100,100,200,0.12)";
            const borderBottom = (r + 1) % 3 === 0 && r < 8 ? "2px solid rgba(109,93,252,0.4)" : "1px solid rgba(100,100,200,0.12)";

            let bg = "transparent";
            if (hl === "selected") bg = `${myColor}22`;
            else if (hl === "related") bg = "rgba(109,93,252,0.05)";
            if (isError) bg = "rgba(248,113,113,0.12)";
            if (cursorColor) bg = `${cursorColor}22`;

            const noteGrid = notes[r][c];

            return (
              <div key={`${r}-${c}`}
                onClick={() => onSelect(r, c)}
                style={{ position: "relative", cursor: "pointer", background: bg, borderRight, borderBottom, display: "flex", alignItems: "center", justifyContent: "center", outline: cursorColor ? `2px solid ${cursorColor}` : hl === "selected" ? `2px solid ${myColor}` : "none", outlineOffset: "-1px" }}>
                {val !== null ? (
                  <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "clamp(14px,2vw,20px)", fontWeight: given[r][c] ? 700 : 500, color: given[r][c] ? "#a5b4fc" : isError ? "#f87171" : "#e8e8f4" }}>
                    {val}
                  </span>
                ) : noteGrid.size > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", width: "90%", height: "90%", gap: "1px" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span key={n} style={{ fontSize: "clamp(7px,1vw,10px)", color: "#6d5dfc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono,monospace" }}>
                        {noteGrid.has(n) ? n : ""}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Number pad */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} onClick={() => onNumber(n)}
            style={{ width: "44px", height: "44px", borderRadius: "9px", background: "var(--bg-2)", border: "1px solid rgba(100,100,200,0.15)", color: "var(--text-primary)", fontFamily: "JetBrains Mono,monospace", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}>
            {n}
          </button>
        ))}
        <button onClick={onClear} style={{ width: "44px", height: "44px", borderRadius: "9px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>✕</button>
        <button onClick={onToggleNotes} style={{ width: "44px", height: "44px", borderRadius: "9px", background: isNoteMode ? "rgba(109,93,252,0.2)" : "rgba(13,13,26,0.9)", border: `1px solid ${isNoteMode ? "rgba(109,93,252,0.5)" : "rgba(100,100,200,0.15)"}`, color: isNoteMode ? "#818cf8" : "#9090b8", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>✏️</button>
      </div>

      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Keys: 1–9 · N = notes · Backspace = clear · Arrow keys</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(109,93,252,0.2)", borderTop: "3px solid #6d5dfc", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-secondary)" }}>Connecting…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ msg }: { msg: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <p style={{ color: "#f87171", fontSize: "1rem" }}>{msg}</p>
      <Link href="/lobby" style={{ color: "#818cf8", textDecoration: "none", fontSize: "0.9rem" }}>← Back to Lobby</Link>
    </div>
  );
}
