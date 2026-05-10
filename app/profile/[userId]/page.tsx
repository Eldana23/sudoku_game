"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import { formatTime, getDifficultyColor } from "@/lib/utils";
import type { PlayerStats } from "@/types/multiplayer";
import { Trophy, Target, Clock, Flame, Users, Zap } from "lucide-react";

interface Profile {
  id: string; username: string; display_name: string;
  avatar_url: string | null; city: string; country: string;
  is_pro: boolean; created_at: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !userId) return;
    async function load() {
      const [{ data: p }, { data: s }, { data: g }] = await Promise.all([
        supabase!.from("profiles").select("*").eq("id", userId).single(),
        supabase!.from("player_stats").select("*").eq("user_id", userId).single(),
        supabase!.from("scores").select("*").eq("user_id", userId).order("played_at", { ascending: false }).limit(10),
      ]);
      setProfile(p); setStats(s); setRecentGames(g ?? []);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--text-secondary)" }}>Loading…</div></div>;
  if (!profile) return <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#f87171" }}>Player not found.</div></div>;

  const winRate = stats && stats.races_played > 0 ? Math.round((stats.races_won / stats.races_played) * 100) : 0;
  const avgTime = stats && stats.games_completed > 0 ? Math.round(stats.total_solve_time / stats.games_completed) : null;
  const accuracy = stats && stats.games_played > 0 ? Math.round((1 - stats.total_errors / Math.max(stats.games_played * 20, 1)) * 100) : 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)" }}>
      <Header />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: "white", flexShrink: 0, boxShadow: "0 4px 20px rgba(109,93,252,0.4)" }}>
            {(profile.display_name || profile.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "var(--text-primary)", margin: 0 }}>
                {profile.display_name || profile.username}
              </h1>
              {profile.is_pro && <span style={{ padding: "2px 8px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "20px", color: "#f59e0b", fontSize: "0.72rem", fontWeight: 700 }}>PRO</span>}
            </div>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              @{profile.username} · {profile.city}, {profile.country}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { icon: <Trophy size={16} />, label: "Total Score", value: (stats?.total_score ?? 0).toLocaleString(), color: "#f59e0b" },
            { icon: <Target size={16} />, label: "Games Completed", value: stats?.games_completed ?? 0, color: "#34d399" },
            { icon: <Clock size={16} />, label: "Avg. Solve Time", value: avgTime ? formatTime(avgTime) : "—", color: "#38bdf8" },
            { icon: <Flame size={16} />, label: "Daily Streak", value: `${stats?.daily_streak ?? 0} 🔥`, color: "#f87171" },
            { icon: <Users size={16} />, label: "Race Win Rate", value: `${winRate}%`, color: "#818cf8" },
            { icon: <Zap size={16} />, label: "Accuracy", value: `${Math.min(accuracy, 100)}%`, color: "#a78bfa" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: s.color, marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Best times */}
        <div style={{ marginBottom: "28px", padding: "20px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "14px" }}>
          <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Personal Bests</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
            {(["easy", "medium", "hard", "expert"] as const).map(d => {
              const key = `best_time_${d}` as keyof PlayerStats;
              const t = stats?.[key] as number | null;
              return (
                <div key={d} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: getDifficultyColor(d), marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
                  <div style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "1.1rem", color: t ? "var(--text-primary)" : "var(--text-muted)" }}>{t ? formatTime(t) : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent games */}
        <div>
          <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Games</h3>
          {recentGames.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No games played yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentGames.map(g => (
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: getDifficultyColor(g.difficulty), textTransform: "uppercase", width: "52px" }}>{g.difficulty}</span>
                  {g.is_daily && <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "rgba(109,93,252,0.15)", borderRadius: "4px", color: "#818cf8" }}>Daily</span>}
                  <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "0.9rem", color: "var(--text-primary)", flex: 1 }}>{formatTime(g.time_secs)}</span>
                  <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: "0.88rem", color: "#f59e0b" }}>{g.score.toLocaleString()} pts</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{new Date(g.played_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
