"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { Trophy, Globe, Calendar, MapPin, Clock, ChevronUp } from "lucide-react";
import { formatTime } from "@/lib/utils";
import Link from "next/link";

type Tab = "global" | "daily" | "city";
type DiffFilter = "all" | "easy" | "medium" | "hard" | "expert";

// Mock data — replace with real Supabase queries
const generateMockData = (count: number) => {
  const cities = [
    "Almaty", "Astana", "Moscow", "London", "Seoul", "Tokyo",
    "New York", "Berlin", "Paris", "Singapore",
  ];
  const names = [
    "Aizhan K.", "Pavel M.", "Sarah L.", "Yerlan B.", "Min J.",
    "Anna S.", "David R.", "Yuki T.", "Ahmed H.", "Sofia P.",
    "Arman N.", "Elena V.", "James W.", "Nadia F.", "Lucas M.",
    "Zara Q.", "Ivan P.", "Mei C.", "Omar A.", "Hana B.",
  ];
  const diffs = ["easy", "medium", "hard", "expert"];

  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    username: names[i % names.length],
    city: cities[Math.floor(Math.random() * cities.length)],
    country: "—",
    score: Math.max(500, 5000 - i * 85 + Math.floor(Math.random() * 80)),
    time: 300 + Math.floor(i * 40 + Math.random() * 60),
    errorCount: Math.floor(Math.random() * 4),
    difficulty: diffs[Math.floor(Math.random() * diffs.length)],
    completedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }));
};

const GLOBAL_DATA = generateMockData(25);
const DAILY_DATA = generateMockData(20);

const CITY_DATA: Record<string, ReturnType<typeof generateMockData>> = {
  Almaty: generateMockData(8).map((d, i) => ({
    ...d,
    city: "Almaty",
    score: 5000 - i * 120,
  })),
  Moscow: generateMockData(8).map((d, i) => ({
    ...d,
    city: "Moscow",
    score: 4800 - i * 110,
  })),
  London: generateMockData(8).map((d, i) => ({
    ...d,
    city: "London",
    score: 4700 - i * 100,
  })),
};

const CITIES = Object.keys(CITY_DATA);

const DIFF_COLORS: Record<string, string> = {
  easy: "#34d399",
  medium: "#38bdf8",
  hard: "#fbbf24",
  expert: "#f87171",
};

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1 ? { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", color: "#fbbf24", text: "🥇" }
    : rank === 2 ? { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.35)", color: "#94a3b8", text: "🥈" }
    : rank === 3 ? { bg: "rgba(194,161,105,0.15)", border: "rgba(194,161,105,0.35)", color: "#c2a169", text: "🥉" }
    : null;

  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: medal?.bg ?? "transparent",
        border: medal ? `1px solid ${medal.border}` : "none",
        fontFamily: "JetBrains Mono, monospace",
        fontWeight: 700,
        fontSize: medal ? "1rem" : "0.82rem",
        color: medal?.color ?? "#4a4a72",
        flexShrink: 0,
      }}
    >
      {medal ? medal.text : rank}
    </div>
  );
}

interface LeaderRow {
  rank: number;
  username: string;
  city: string;
  score: number;
  time: number;
  errorCount: number;
  difficulty: string;
}

function LeaderboardTable({ data }: { data: LeaderRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 80px 80px 60px 90px",
          gap: "12px",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(100, 100, 200, 0.12)",
        }}
      >
        {["#", "Player", "Diff", "Time", "Err.", "Score"].map((h) => (
          <div
            key={h}
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              textAlign: h === "Score" || h === "Time" || h === "Err." ? "right" : "left",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {data.map((entry, i) => (
        <div
          key={`${entry.username}-${i}`}
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 80px 80px 60px 90px",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "10px",
            alignItems: "center",
            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
            transition: "background 0.15s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(109, 93, 252, 0.07)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)";
          }}
        >
          <RankBadge rank={entry.rank} />

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {entry.username}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              📍 {entry.city}
            </div>
          </div>

          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: DIFF_COLORS[entry.difficulty] ?? "#94a3b8",
                fontFamily: "Syne, sans-serif",
                textTransform: "capitalize",
              }}
            >
              {entry.difficulty}
            </span>
          </div>

          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              textAlign: "right",
            }}
          >
            {formatTime(entry.time)}
          </div>

          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.82rem",
              color: entry.errorCount === 0 ? "#34d399" : "#f87171",
              textAlign: "right",
            }}
          >
            {entry.errorCount}
          </div>

          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: entry.rank === 1 ? "#fbbf24" : entry.rank <= 3 ? "#a78bfa" : "#9090b8",
              textAlign: "right",
            }}
          >
            {entry.score.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("all");
  const [selectedCity, setSelectedCity] = useState("Almaty");

  const tabs = [
    { id: "daily" as Tab, label: "Daily", icon: Calendar },
    { id: "global" as Tab, label: "All-time", icon: Globe },
    { id: "city" as Tab, label: "By City", icon: MapPin },
  ];

  const filterData = (data: LeaderRow[]) =>
    diffFilter === "all"
      ? data
      : data.filter((d) => d.difficulty === diffFilter);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-0)" }}>
      <Header />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 16px 60px" }}>
        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              background: "rgba(109, 93, 252, 0.1)",
              border: "1px solid rgba(109, 93, 252, 0.25)",
              borderRadius: "100px",
              marginBottom: "14px",
            }}
          >
            <Trophy size={13} color="#818cf8" />
            <span
              style={{
                color: "#818cf8",
                fontSize: "0.78rem",
                fontWeight: 700,
                fontFamily: "Syne, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              RANKINGS
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}
          >
            Global Leaderboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Compete with players around the world. Updated in real-time.
          </p>
        </div>

        {/* Tab navigation */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "20px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "4px",
            width: "fit-content",
          }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                background:
                  activeTab === id
                    ? "rgba(109, 93, 252, 0.2)"
                    : "transparent",
                border:
                  activeTab === id
                    ? "1px solid rgba(109, 93, 252, 0.35)"
                    : "1px solid transparent",
                borderRadius: "9px",
                color: activeTab === id ? "#a5b4fc" : "#9090b8",
                cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.88rem",
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Main card */}
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Filters + city picker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(100, 100, 200, 0.1)",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {activeTab === "city" ? (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      padding: "5px 14px",
                      background:
                        selectedCity === city
                          ? "rgba(109, 93, 252, 0.2)"
                          : "var(--bg-3)",
                      border:
                        selectedCity === city
                          ? "1px solid rgba(109, 93, 252, 0.4)"
                          : "1px solid rgba(100, 100, 200, 0.15)",
                      borderRadius: "100px",
                      color: selectedCity === city ? "#a5b4fc" : "#9090b8",
                      cursor: "pointer",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(["all", "easy", "medium", "hard", "expert"] as DiffFilter[]).map(
                  (d) => (
                    <button
                      key={d}
                      onClick={() => setDiffFilter(d)}
                      style={{
                        padding: "5px 14px",
                        background:
                          diffFilter === d
                            ? d === "all"
                              ? "rgba(109, 93, 252, 0.2)"
                              : `${DIFF_COLORS[d]}18`
                            : "var(--bg-3)",
                        border:
                          diffFilter === d
                            ? d === "all"
                              ? "1px solid rgba(109, 93, 252, 0.4)"
                              : `1px solid ${DIFF_COLORS[d]}44`
                            : "1px solid var(--border)",
                        borderRadius: "100px",
                        color:
                          diffFilter === d
                            ? d === "all"
                              ? "#a5b4fc"
                              : DIFF_COLORS[d]
                            : "#9090b8",
                        cursor: "pointer",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        transition: "all 0.15s ease",
                        textTransform: "capitalize",
                      }}
                    >
                      {d}
                    </button>
                  )
                )}
              </div>
            )}

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {activeTab === "daily"
                ? "Today's completions"
                : activeTab === "city"
                  ? `Top in ${selectedCity}`
                  : "All-time best scores"}
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: "8px" }}>
            {activeTab === "daily" && (
              <LeaderboardTable data={filterData(DAILY_DATA)} />
            )}
            {activeTab === "global" && (
              <LeaderboardTable data={filterData(GLOBAL_DATA)} />
            )}
            {activeTab === "city" && (
              <LeaderboardTable data={CITY_DATA[selectedCity] ?? []} />
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "28px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "14px" }}>
            Want to appear on the leaderboard? Complete a puzzle with an account.
          </p>
          <Link href="/play" className="btn-primary" style={{ display: "inline-flex" }}>
            Start Playing →
          </Link>
        </div>
      </div>
    </div>
  );
}
