"use client";

import { useState, Suspense } from "react";
import { useGame } from "@/hooks/useGame";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types";
import { formatTime } from "@/lib/utils";
import SudokuBoard from "@/components/game/SudokuBoard";
import NumberPad from "@/components/game/NumberPad";
import AICoachPanel from "@/components/game/AICoachPanel";
import CompletionModal from "@/components/game/CompletionModal";
import Header from "@/components/layout/Header";
import {
  RefreshCw,
  ChevronDown,
  Clock,
  AlertCircle,
  Brain,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

function PlayPageContent() {
  const searchParams = useSearchParams();
  const initialDiff = (searchParams.get("difficulty") as Difficulty) || "medium";
  const isDaily = searchParams.get("daily") === "true";

  const game = useGame(initialDiff);
  const [showDiffMenu, setShowDiffMenu] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showModal, setShowModal] = useState(true);

  // Start timer on first interaction
  const handleSelectCell = (r: number, c: number) => {
    if (!game.startTime) {
      game.dispatch({ type: "NEW_GAME", difficulty: game.difficulty });
    }
    game.selectCell(r, c);
  };

  const handleNewGame = (difficulty?: Difficulty) => {
    game.newGame(difficulty ?? game.difficulty);
    setShowModal(true);
    setShowDiffMenu(false);
  };

  const elapsed = game.elapsed ?? 0;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-0)" }}>
      <Header />

      {/* Completion Modal */}
      {game.isComplete && showModal && (
        <CompletionModal
          isOpen
          difficulty={game.difficulty}
          elapsedSeconds={elapsed}
          errorCount={game.errorCount}
          hintCount={game.hintCount}
          score={game.score}
          isDailyChallenge={game.isDailyChallenge}
          onNewGame={() => {
            handleNewGame();
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Main layout */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "24px 16px 40px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* Left sidebar — stats + AI */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            paddingTop: "4px",
          }}
        >
          {/* Stats card */}
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Difficulty badge + new game */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDiffMenu(!showDiffMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    background: "rgba(109, 93, 252, 0.12)",
                    border: "1px solid rgba(109, 93, 252, 0.25)",
                    borderRadius: "8px",
                    color:
                      DIFFICULTY_CONFIG[game.difficulty].color.replace(
                        "text-",
                        ""
                      ) === "emerald-400"
                        ? "#34d399"
                        : DIFFICULTY_CONFIG[game.difficulty].color.replace(
                              "text-",
                              ""
                            ) === "sky-400"
                          ? "#38bdf8"
                          : DIFFICULTY_CONFIG[game.difficulty].color.replace(
                                "text-",
                                ""
                              ) === "amber-400"
                            ? "#fbbf24"
                            : "#f87171",
                    cursor: "pointer",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "0.03em",
                  }}
                >
                  {DIFFICULTY_CONFIG[game.difficulty].label}
                  <ChevronDown size={12} />
                </button>

                {showDiffMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      background: "var(--bg-2)",
                      border: "1px solid rgba(130, 130, 240, 0.25)",
                      borderRadius: "10px",
                      padding: "6px",
                      zIndex: 30,
                      minWidth: "140px",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    {(
                      Object.entries(DIFFICULTY_CONFIG) as [
                        Difficulty,
                        (typeof DIFFICULTY_CONFIG)[Difficulty],
                      ][]
                    ).map(([diff, cfg]) => (
                      <button
                        key={diff}
                        onClick={() => handleNewGame(diff)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          background:
                            game.difficulty === diff
                              ? "rgba(109, 93, 252, 0.15)"
                              : "transparent",
                          border: "none",
                          borderRadius: "7px",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (game.difficulty !== diff)
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(109, 93, 252, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          if (game.difficulty !== diff)
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color:
                              diff === "easy"
                                ? "#34d399"
                                : diff === "medium"
                                  ? "#38bdf8"
                                  : diff === "hard"
                                    ? "#fbbf24"
                                    : "#f87171",
                          }}
                        >
                          {cfg.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            marginTop: "1px",
                          }}
                        >
                          {cfg.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNewGame()}
                className="btn-secondary"
                style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                title="New game"
              >
                <RefreshCw size={13} />
                New
              </button>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              <div className="stat-chip">
                <div className="stat-chip-label">Time</div>
                <div
                  className="stat-chip-value"
                  style={{ fontSize: "0.95rem" }}
                >
                  {formatTime(elapsed)}
                </div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip-label">Errors</div>
                <div
                  className="stat-chip-value"
                  style={{
                    color: game.errorCount > 0 ? "#f87171" : "#34d399",
                    fontSize: "0.95rem",
                  }}
                >
                  {game.errorCount}
                </div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip-label">Hints</div>
                <div
                  className="stat-chip-value"
                  style={{ fontSize: "0.95rem" }}
                >
                  {game.hintCount}
                </div>
              </div>
            </div>
          </div>

          {/* AI Coach toggle */}
          <button
            onClick={() => setShowAI(!showAI)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              background: showAI
                ? "rgba(109, 93, 252, 0.12)"
                : "var(--bg-2)",
              border: showAI
                ? "1px solid rgba(109, 93, 252, 0.3)"
                : "1px solid var(--border)",
              borderRadius: "12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "linear-gradient(135deg, #6d5dfc, #818cf8)",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Brain size={14} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-primary)",
                }}
              >
                AI Coach
              </div>
              <div style={{ fontSize: "0.72rem", color: "#6d5dfc" }}>
                {showAI ? "Tap to close" : "Get strategy tips"}
              </div>
            </div>
          </button>

          {showAI && (
            <AICoachPanel
              board={game.board}
              selected={game.selected}
              given={game.given}
            />
          )}
        </div>

        {/* Center — the game board */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {game.isDailyChallenge && (
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: "0.82rem",
                color: "#fbbf24",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📅</span> Daily Challenge
            </div>
          )}

          <SudokuBoard
            board={game.board}
            solution={game.solution}
            given={game.given}
            selected={game.selected}
            notes={game.notes}
            conflicts={game.conflicts}
            highlightedNumber={game.highlightedNumber}
            lastAnimatedCell={game.lastAnimatedCell}
            onSelectCell={handleSelectCell}
            isComplete={game.isComplete}
          />

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
          />
        </div>

        {/* Right sidebar — tips + pro banner */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Keyboard shortcuts */}
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
              Shortcuts
            </div>
            {[
              ["1–9", "Place number"],
              ["N", "Toggle notes"],
              ["⌫ / Del", "Erase cell"],
              ["Ctrl+Z", "Undo"],
              ["Arrow keys", "Navigate"],
            ].map(([key, label]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "5px 0",
                  borderBottom: "1px solid rgba(100, 100, 200, 0.06)",
                }}
              >
                <kbd
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.75rem",
                    padding: "2px 7px",
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "5px",
                    color: "#818cf8",
                  }}
                >
                  {key}
                </kbd>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Pro Banner */}
          <div className="pro-banner">
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                color: "#fbbf24",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ✨ SudokuMind Pro
            </div>
            <ul
              style={{
                margin: "0 0 14px",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              {[
                "Unlimited hints",
                "Advanced AI coaching",
                "Detailed statistics",
                "Custom themes",
                "Remove ads",
              ].map((feat) => (
                <li
                  key={feat}
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "#fbbf24", fontSize: "0.7rem" }}>
                    ✓
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
            <button className="btn-gold" style={{ width: "100%", fontSize: "0.85rem" }}>
              Upgrade to Pro — $4.99/mo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayPageContent />
    </Suspense>
  );
}
