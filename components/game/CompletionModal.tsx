"use client";

import { useEffect, useRef } from "react";
import { Difficulty } from "@/types";
import { formatTime, formatScore } from "@/lib/utils";
import { Trophy, Clock, AlertCircle, Lightbulb, Star, RotateCcw } from "lucide-react";

interface Props {
  isOpen: boolean;
  difficulty: Difficulty;
  elapsedSeconds: number;
  errorCount: number;
  hintCount: number;
  score: number;
  isDailyChallenge: boolean;
  onNewGame: () => void;
  onClose: () => void;
}

const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  easy: "🌿",
  medium: "⚡",
  hard: "🔥",
  expert: "💎",
};

const SCORE_MESSAGES = [
  { min: 4000, label: "Grandmaster", color: "#fbbf24" },
  { min: 3000, label: "Expert", color: "#a78bfa" },
  { min: 2000, label: "Advanced", color: "#38bdf8" },
  { min: 1000, label: "Intermediate", color: "#34d399" },
  { min: 0, label: "Beginner", color: "#94a3b8" },
];

function getScoreRating(score: number) {
  return (
    SCORE_MESSAGES.find((m) => score >= m.min) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1]
  );
}

// Simple confetti particles
function Confetti() {
  const colors = ["#6d5dfc", "#f59e0b", "#34d399", "#f87171", "#38bdf8", "#a78bfa"];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
        overflow: "hidden",
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: "2px",
            opacity: 0,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function CompletionModal({
  isOpen,
  difficulty,
  elapsedSeconds,
  errorCount,
  hintCount,
  score,
  isDailyChallenge,
  onNewGame,
  onClose,
}: Props) {
  if (!isOpen) return null;

  const rating = getScoreRating(score);

  const stats = [
    {
      icon: Clock,
      label: "Time",
      value: formatTime(elapsedSeconds),
      color: "#38bdf8",
    },
    {
      icon: AlertCircle,
      label: "Mistakes",
      value: String(errorCount),
      color: errorCount === 0 ? "#34d399" : "#f87171",
    },
    {
      icon: Lightbulb,
      label: "Hints",
      value: String(hintCount),
      color: "#fbbf24",
    },
    {
      icon: Star,
      label: "Score",
      value: formatScore(score),
      color: "#a78bfa",
    },
  ];

  return (
    <>
      <Confetti />
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Decorative top bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #6d5dfc, #f59e0b, #6d5dfc)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />

          {/* Trophy icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Trophy size={32} color="#fbbf24" />
          </div>

          <div style={{ fontSize: "2.5rem", marginBottom: "6px" }}>
            {DIFFICULTY_EMOJI[difficulty]}
          </div>

          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "1.7rem",
              color: "var(--text-primary)",
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            Puzzle Solved!
          </h2>

          {isDailyChallenge && (
            <p
              style={{
                color: "#fbbf24",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "8px",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              ✨ Daily Challenge Completed
            </p>
          )}

          {/* Rating badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              background: `${rating.color}18`,
              border: `1px solid ${rating.color}44`,
              borderRadius: "100px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: rating.color,
              }}
            />
            <span
              style={{
                color: rating.color,
                fontSize: "0.82rem",
                fontWeight: 700,
                fontFamily: "Syne, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              {rating.label}
            </span>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                style={{
                  padding: "14px",
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <Icon size={13} color={color} />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button className="btn-primary" onClick={onNewGame}>
              <RotateCcw size={16} />
              Play Again
            </button>
            <button
              className="btn-secondary"
              style={{ width: "100%" }}
              onClick={onClose}
            >
              Review Puzzle
            </button>
          </div>

          {/* Share nudge */}
          {isDailyChallenge && (
            <p
              style={{
                marginTop: "16px",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              Share your result with #{score} and challenge friends! 🧩
            </p>
          )}
        </div>
      </div>
    </>
  );
}
