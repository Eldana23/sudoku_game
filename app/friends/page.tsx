"use client";
import { useEffect, useState } from "react";
import { Search, UserPlus, Check, X, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/lib/authContext";
import { searchUsers, sendFriendRequest, acceptFriendRequest, removeFriend, getFriends } from "@/lib/friends";
import type { Friendship } from "@/types/multiplayer";
import Link from "next/link";

export default function FriendsPage() {
  const { user, profile } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; username: string; display_name: string; avatar_url: string | null }[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [pendingSent, setPendingSent] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  async function load() {
    if (!user) return;
    const data = await getFriends(user.id);
    setFriends(data.friends);
    setPendingReceived(data.pending_received);
    setPendingSent(data.pending_sent);
  }

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchUsers(search);
      setResults(r.filter((u: any) => u.id !== user?.id));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, user]);

  async function sendRequest(targetId: string) {
    if (!user) return;
    await sendFriendRequest(user.id, targetId);
    load();
  }

  async function accept(fId: string) {
    await acceptFriendRequest(fId);
    load();
  }

  async function remove(fId: string) {
    await removeFriend(fId);
    load();
  }

  const getFriendName = (f: Friendship) => {
    if (f.requester_id === user?.id) return f.addressee_display_name || f.addressee_username;
    return f.requester_display_name || f.requester_username;
  };

  const getFriendUsername = (f: Friendship) => {
    if (f.requester_id === user?.id) return f.addressee_username;
    return f.requester_username;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)" }}>
      <Header />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--text-primary)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>Friends</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "36px" }}>Find players and invite them to co-op or race games.</p>

        {!user && (
          <div style={{ padding: "20px", background: "rgba(109,93,252,0.08)", border: "1px solid rgba(109,93,252,0.2)", borderRadius: "12px", marginBottom: "28px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>Sign in to add friends and join multiplayer games.</p>
            <Link href="/auth" style={{ display: "inline-block", padding: "8px 20px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", borderRadius: "8px", color: "white", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
              Sign In
            </Link>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: "32px" }}>
          <label style={labelStyle}>Search players</label>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#5a5a7a" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username…"
              style={{ width: "100%", padding: "11px 14px 11px 40px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          {results.length > 0 && (
            <div style={{ marginTop: "8px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
              {results.map(u => {
                const alreadyFriend = friends.some(f => f.requester_id === u.id || f.addressee_id === u.id);
                const sentReq = pendingSent.some(f => f.addressee_id === u.id);
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(100,100,200,0.08)", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                      {(u.display_name || u.username).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500 }}>{u.display_name || u.username}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>@{u.username}</div>
                    </div>
                    {!alreadyFriend && !sentReq && (
                      <button onClick={() => sendRequest(u.id)} style={{ padding: "6px 14px", background: "rgba(109,93,252,0.15)", border: "1px solid rgba(109,93,252,0.3)", borderRadius: "7px", color: "#818cf8", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                        <UserPlus size={13} /> Add
                      </button>
                    )}
                    {sentReq && <span style={{ fontSize: "0.78rem", color: "#5a5a7a" }}>Sent</span>}
                    {alreadyFriend && <span style={{ fontSize: "0.78rem", color: "#34d399" }}>✓ Friends</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending requests */}
        {pendingReceived.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Friend Requests ({pendingReceived.length})
            </h3>
            {pendingReceived.map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-2)", border: "1px solid rgba(109,93,252,0.15)", borderRadius: "10px", marginBottom: "8px" }}>
                <Avatar name={getFriendName(f) ?? ""} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{getFriendName(f)}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>@{getFriendUsername(f)}</div>
                </div>
                <button onClick={() => accept(f.id)} style={btnStyle("#34d399", "rgba(52,211,153,0.15)", "rgba(52,211,153,0.3)")}><Check size={13} /></button>
                <button onClick={() => remove(f.id)} style={btnStyle("#f87171", "rgba(248,113,113,0.12)", "rgba(248,113,113,0.25)")}><X size={13} /></button>
              </div>
            ))}
          </section>
        )}

        {/* Friends list */}
        <section>
          <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Friends ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <Users size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px" }} />
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.88rem" }}>No friends yet. Search by username above.</p>
            </div>
          ) : (
            friends.map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "8px" }}>
                <Avatar name={getFriendName(f) ?? ""} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{getFriendName(f)}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>@{getFriendUsername(f)}</div>
                </div>
                <Link href={`/lobby?invite=${getFriendUsername(f)}`} style={{ padding: "6px 14px", background: "rgba(109,93,252,0.12)", border: "1px solid rgba(109,93,252,0.25)", borderRadius: "7px", color: "#818cf8", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
                  Invite to game
                </Link>
                <button onClick={() => remove(f.id)} style={btnStyle("#f87171", "rgba(248,113,113,0.1)", "rgba(248,113,113,0.2)")} title="Remove friend">
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "8px", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" };

function btnStyle(color: string, bg: string, border: string): React.CSSProperties {
  return { padding: "7px", background: bg, border: `1px solid ${border}`, borderRadius: "7px", color, cursor: "pointer", display: "flex", alignItems: "center" };
}
