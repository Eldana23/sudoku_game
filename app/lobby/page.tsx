"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Zap, Copy, Check, Plus, Search, Globe, Lock } from "lucide-react";
import Header from "@/components/layout/Header";
import { createRoom, findRoomByCode, joinRoom } from "@/lib/rooms";
import { useAuth } from "@/lib/authContext";

const DIFF_COLORS: Record<string, string> = {
  easy: "#34d399", medium: "#38bdf8", hard: "#fbbf24", expert: "#f87171",
};

export default function LobbyPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [mode, setMode] = useState<"coop" | "race">("coop");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("medium");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  async function handleCreate() {
    if (!user) { router.push("/auth"); return; }
    setLoading(true); setError("");
    try {
      const room = await createRoom({ hostId: user.id, mode, difficulty });
      router.push(`/rooms/${room.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally { setLoading(false); }
  }

  async function handleJoin() {
    if (!user) { router.push("/auth"); return; }
    if (joinCode.length !== 6) { setError("Enter a 6-character room code"); return; }
    setLoading(true); setError("");
    try {
      const room = await findRoomByCode(joinCode);
      if (!room) throw new Error("Room not found. Check the code and try again.");
      if (room.status === "finished") throw new Error("This game has already ended.");
      await joinRoom(room.id, user.id);
      router.push(`/rooms/${room.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join room");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)" }}>
      <Header />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(109,93,252,0.1)", border: "1px solid rgba(109,93,252,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "16px" }}>
            <Users size={14} color="#818cf8" />
            <span style={{ color: "#818cf8", fontSize: "0.82rem", fontWeight: 600 }}>Multiplayer</span>
          </div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "2.4rem", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>
            Play Together
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "12px", fontSize: "1rem" }}>
            Solve together in Co-op, or race head-to-head against friends.
          </p>
        </div>

        {/* Mode explanation cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "36px" }}>
          {[
            { id: "coop", icon: "🤝", title: "Co-op", desc: "One shared board. Work together to solve the puzzle. Every move is synced in real time.", color: "#6d5dfc" },
            { id: "race", icon: "⚡", title: "Race", desc: "Same puzzle, separate boards. First to complete wins. Track each other's progress live.", color: "#f59e0b" },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as "coop" | "race")}
              style={{ padding: "20px", background: mode === m.id ? `rgba(${m.id === "coop" ? "109,93,252" : "245,158,11"},0.1)` : "var(--bg-2)", border: `1px solid ${mode === m.id ? `${m.color}44` : "var(--border)"}`, borderRadius: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "8px" }}>{m.icon}</div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "1rem", color: mode === m.id ? m.color : "var(--text-primary)", marginBottom: "4px" }}>{m.title}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Create / Join tabs */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            {(["create", "join"] as const).map(t => (
              <button key={t} onClick={() => { setActiveTab(t); setError(""); }}
                style={{ flex: 1, padding: "16px", border: "none", cursor: "pointer", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s",
                  background: activeTab === t ? "rgba(109,93,252,0.1)" : "transparent",
                  color: activeTab === t ? "#818cf8" : "var(--text-secondary)",
                  borderBottom: activeTab === t ? "2px solid #6d5dfc" : "2px solid transparent" }}>
                {t === "create" ? <><Plus size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Create Room</> : <><Search size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Join by Code</>}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px" }}>
            {activeTab === "create" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(["easy", "medium", "hard", "expert"] as const).map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        style={{ padding: "8px 18px", borderRadius: "8px", border: `1px solid ${difficulty === d ? DIFF_COLORS[d] + "66" : "var(--border)"}`, background: difficulty === d ? `${DIFF_COLORS[d]}18` : "transparent", color: difficulty === d ? DIFF_COLORS[d] : "var(--text-secondary)", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s" }}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <ErrorMsg msg={error} />}

                <button onClick={handleCreate} disabled={loading}
                  style={{ padding: "13px 28px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", border: "none", borderRadius: "10px", color: "white", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, alignSelf: "flex-start" }}>
                  {loading ? "Creating…" : `Create ${mode === "coop" ? "Co-op" : "Race"} Room`}
                </button>

                {!user && (
                  <p style={{ fontSize: "0.82rem", color: "#5a5a7a" }}>
                    <Link href="/auth" style={{ color: "#818cf8" }}>Sign in</Link> to create a room and invite friends.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={labelStyle}>Room Code</label>
                  <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="XK7P3Q" maxLength={6}
                    style={{ width: "100%", padding: "12px 16px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "1.4rem", fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.15em", outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                </div>

                {error && <ErrorMsg msg={error} />}

                <button onClick={handleJoin} disabled={loading || joinCode.length !== 6}
                  style={{ padding: "13px 28px", background: joinCode.length === 6 ? "linear-gradient(135deg,#6d5dfc,#818cf8)" : "rgba(100,100,200,0.12)", border: "none", borderRadius: "10px", color: joinCode.length === 6 ? "white" : "#5a5a7a", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: joinCode.length === 6 ? "pointer" : "default", alignSelf: "flex-start" }}>
                  {loading ? "Joining…" : "Join Room"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick tips */}
        <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
          {[
            { icon: "🔗", text: "Share the 6-char room code with friends" },
            { icon: "👥", text: "Up to 4 players per room" },
            { icon: "⚡", text: "Moves sync in under 100ms" },
          ].map((tip, i) => (
            <div key={i} style={{ padding: "14px", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{tip.icon}</div>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#f87171", fontSize: "0.84rem" }}>
      {msg}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: "8px", fontSize: "0.82rem",
  fontWeight: 600, color: "var(--text-secondary)", fontFamily: "Plus Jakarta Sans,sans-serif",
};
