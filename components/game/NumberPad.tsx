"use client";

import { cn } from "@/lib/utils";
import { Delete, Pencil, Undo2, Lightbulb } from "lucide-react";

interface Props {
  board: (number | null)[][];
  solution: (number | null)[][];
  highlightedNumber: number | null;
  isNoteMode: boolean;
  hintCount: number;
  onNumber: (n: number) => void;
  onClear: () => void;
  onToggleNote: () => void;
  onHint: () => void;
  onUndo: () => void;
  maxHints?: number;
}

const MAX_FREE_HINTS = 3;

export default function NumberPad({
  board,
  solution,
  highlightedNumber,
  isNoteMode,
  hintCount,
  onNumber,
  onClear,
  onToggleNote,
  onHint,
  onUndo,
  maxHints = MAX_FREE_HINTS,
}: Props) {
  // Count how many of each number are left
  const numberCounts = Array.from({ length: 10 }, (_, i) => {
    if (i === 0) return 0;
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === i) count++;
      }
    }
    return 9 - count; // remaining
  });

  const hintsLeft = maxHints - hintCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Number buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: "6px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const remaining = numberCounts[n];
          const exhausted = remaining <= 0;
          const isHighlighted = highlightedNumber === n;

          return (
            <button
              key={n}
              onClick={() => onNumber(n)}
              disabled={exhausted}
              className={cn("num-btn", isHighlighted && "highlighted")}
              style={{
                opacity: exhausted ? 0.25 : 1,
                cursor: exhausted ? "default" : "pointer",
                flexDirection: "column",
                gap: "2px",
                paddingTop: "4px",
                paddingBottom: "4px",
                minHeight: "52px",
              }}
              title={`Place ${n} (${remaining} remaining)`}
            >
              <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>{n}</span>
              {!exhausted && (
                <span
                  style={{
                    fontSize: "0.55rem",
                    color: isHighlighted ? "#818cf8" : "#4a4a72",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Control buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {/* Undo */}
        <button
          onClick={onUndo}
          className="btn-secondary"
          style={{
            flexDirection: "column",
            gap: "4px",
            padding: "10px 8px",
            fontSize: "0.75rem",
            minHeight: "58px",
          }}
          title="Undo last move (Ctrl+Z)"
        >
          <Undo2 size={16} />
          <span>Undo</span>
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="btn-secondary"
          style={{
            flexDirection: "column",
            gap: "4px",
            padding: "10px 8px",
            fontSize: "0.75rem",
            minHeight: "58px",
          }}
          title="Clear selected cell (Backspace)"
        >
          <Delete size={16} />
          <span>Erase</span>
        </button>

        {/* Note Mode */}
        <button
          onClick={onToggleNote}
          style={{
            flexDirection: "column",
            gap: "4px",
            padding: "10px 8px",
            fontSize: "0.75rem",
            minHeight: "58px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isNoteMode
              ? "rgba(109, 93, 252, 0.18)"
              : "transparent",
            border: isNoteMode
              ? "1px solid rgba(109, 93, 252, 0.5)"
              : "1px solid rgba(100, 100, 200, 0.22)",
            borderRadius: "10px",
            color: isNoteMode ? "#a5b4fc" : "#9090b8",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 500,
          }}
          title="Toggle note mode (N)"
        >
          <Pencil size={16} />
          <span>Notes</span>
          {isNoteMode && (
            <span
              style={{
                fontSize: "0.6rem",
                background: "#6d5dfc",
                color: "white",
                borderRadius: "4px",
                padding: "1px 4px",
              }}
            >
              ON
            </span>
          )}
        </button>

        {/* Hint */}
        <button
          onClick={onHint}
          disabled={hintsLeft <= 0}
          style={{
            flexDirection: "column",
            gap: "4px",
            padding: "10px 8px",
            fontSize: "0.75rem",
            minHeight: "58px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              hintsLeft > 0
                ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))"
                : "transparent",
            border:
              hintsLeft > 0
                ? "1px solid rgba(245, 158, 11, 0.3)"
                : "1px solid rgba(100, 100, 200, 0.22)",
            borderRadius: "10px",
            color: hintsLeft > 0 ? "#fbbf24" : "#4a4a72",
            cursor: hintsLeft > 0 ? "pointer" : "default",
            transition: "all 0.2s ease",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 500,
          }}
          title={`Get a hint (${hintsLeft} remaining)`}
        >
          <Lightbulb size={16} />
          <span>Hint</span>
          <span
            style={{
              fontSize: "0.6rem",
              color: hintsLeft > 0 ? "#fbbf24" : "#4a4a72",
            }}
          >
            {hintsLeft}/{maxHints}
          </span>
        </button>
      </div>
    </div>
  );
}
