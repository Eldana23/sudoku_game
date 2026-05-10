"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { formatTime, formatTodayLong } from "@/lib/utils";
import SudokuBoard from "@/components/game/SudokuBoard";
import NumberPad from "@/components/game/NumberPad";
import AICoachPanel from "@/components/game/AICoachPanel";
import CompletionModal from "@/components/game/CompletionModal";
import Header from "@/components/layout/Header";
import { Calendar, Users, Trophy, Brain } from "lucide-react";

// Mock leaderboard entries for demo when Supabase isn't configured
const MOCK_LEADERS = [
  { username: "Aizhan K.", city: "Almaty", score: 4820, time: 423, rank: 1 },
  { username: "Pavel M.", city: "Moscow", score: 4611, time: 468, rank: 2 },
  { username: "Sarah L.", city: "London", score: 4390, time: 512, rank: 3 },
  { username: "Yerlan B.", city: "Astana", score: 4201, time: 567, rank: 4 },
  { username: "Min J.", city: "Seoul", score: 4088, time: 601, rank: 5 },
];

export default function DailyPage() {
  const game = useGame("medium");
  const [showModal, setShowModal] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [playerCount] = useState(Math.floor(Math.random() * 800) + 1200);

  useEffect(() => {
    game.loadDaily();
  }, []);

  const elapsed = game.elapsed ?? 0;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-0)" }}>
      <Header />

      {game.isComplete && showModal && (
        <CompletionModal
          isOpen
          difficulty="medium"
          elapsedSeconds={elapsed}
          errorCount={game.errorCount}
          hintCount={game.hintCount}
          score={game.score}
          isDailyChallenge
          onNewGame={() => {
            window.location.href = "/play";
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(109,93,252,0.08) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(100, 100, 200, 0.1)",
          padding: "32px 24px 28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "100px",
            marginBottom: "14px",
          }}
        >
          <Calendar size={13} color="#fbbf24" />
          <span
            style={{
              color: "#fbbf24",
              fontSize: "0.78rem",
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            DAILY CHALLENGE
          </span>
        </div>

        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
            marginBottom: "8px",
          }}
        >
          {formatTodayLong()}
        </h1>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
          One puzzle. Everyone plays the same. Your score is compared globally.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            <Users size={14} />
            <span>
              <strong style={{ color: "var(--text-primary)" }}>
                {playerCount.toLocaleString()}
              </strong>{" "}
              playing today
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            <Trophy size={14} />
            <span>
              Top score:{" "}
              <strong style={{ color: "#fbbf24" }}>
                {MOCK_LEADERS[0].score.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Game layout */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "28px 16px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 480px",
          gap: "42px",
          alignItems: "start",
        }}
      >
        {/* Board + controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Live stats */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            {[
              { label: "Time", value: formatTime(elapsed), color: "#38bdf8" },
              {
                label: "Errors",
                value: game.errorCount.toString(),
                color: game.errorCount > 0 ? "#f87171" : "#34d399",
              },
              {
                label: "Score",
                value: game.isComplete ? game.score.toLocaleString() : "—",
                color: "#a78bfa",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <SudokuBoard
            board={game.board}
            solution={game.solution}
            given={game.given}
            selected={game.selected}
            notes={game.notes}
            conflicts={game.conflicts}
            highlightedNumber={game.highlightedNumber}
            lastAnimatedCell={game.lastAnimatedCell}
            onSelectCell={game.selectCell}
            isComplete={game.isComplete}
          />

          <div style={{ width: "100%", maxWidth: "480px" }}>
            <NumberPad
              board={game.board}
              solution={game.solution}
              highlightedNumber={game.highlightedNumber}
              isNoteMode={game.isNoteMode}
              hintCount={game.hintCount}
              onNumber={game.inputNumber}
              onClear={game.clearCell}
              onToggleNote={game.toggleNoteMode}
              onHint={game.getHintAction}
              onUndo={game.undo}
              maxHints={3}
            />
          </div>

          {/* AI Coach toggle */}
          <div style={{ width: "100%", maxWidth: "480px" }}>
            <button
              onClick={() => setShowAI(!showAI)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: showAI
                  ? "rgba(109, 93, 252, 0.12)"
                  : "rgba(13, 13, 26, 0.7)",
                border: showAI
                  ? "1px solid rgba(109, 93, 252, 0.3)"
                  : "1px solid rgba(100, 100, 200, 0.12)",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                width: "100%",
              }}
            >
              <Brain size={16} color={showAI ? "#818cf8" : "#4a4a72"} />
              <span
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: showAI ? "#a5b4fc" : "#9090b8",
                }}
              >
                {showAI ? "Close AI Coach" : "Open AI Coach"}
              </span>
            </button>

            {showAI && (
              <div style={{ marginTop: "12px" }}>
                <AICoachPanel
                  board={game.board}
                  selected={game.selected}
                  given={game.given}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right — leaderboard */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "sticky",
            top: "88px",
          }}
        >
          {/* Leaderboard card */}
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px 12px",
                borderBottom: "1px solid rgba(100, 100, 200, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Trophy size={16} color="#fbbf24" />
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                }}
              >
                Today&apos;s Rankings
              </span>
            </div>

            <div style={{ padding: "8px" }}>
              {MOCK_LEADERS.map((entry, i) => {
                const medal =
                  i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <div
                    key={entry.username}
                    className="lb-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "36px 1fr auto",
                      gap: "10px",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      borderBottom:
                        i < MOCK_LEADERS.length - 1
                          ? "1px solid rgba(100, 100, 200, 0.06)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        fontSize: medal ? "1.1rem" : "0.8rem",
                        color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#c2a169" : "#4a4a72",
                        background: i < 3 ? "rgba(255,255,255,0.04)" : "transparent",
                        borderRadius: "50%",
                        border: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                      }}
                    >
                      {medal ?? entry.rank}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        {entry.username}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          marginTop: "1px",
                        }}
                      >
                        📍 {entry.city} · ⏱ {formatTime(entry.time)}
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: i === 0 ? "#fbbf24" : "#9090b8",
                        textAlign: "right",
                      }}
                    >
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid rgba(100, 100, 200, 0.1)",
                textAlign: "center",
              }}
            >
              <a
                href="/leaderboard"
                style={{
                  color: "#818cf8",
                  fontSize: "0.8rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View full rankings →
              </a>
            </div>
          </div>

          {/* Rules card */}
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "12px",
              }}
            >
              Scoring Rules
            </div>
            {[
              ["Base score", "Based on difficulty"],
              ["Time bonus", "Faster = higher score"],
              ["Error penalty", "−50 per mistake"],
              ["Hint penalty", "Small deduction each"],
            ].map(([rule, desc]) => (
              <div
                key={rule}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid rgba(100, 100, 200, 0.06)",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                  {rule}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
