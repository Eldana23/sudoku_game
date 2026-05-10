"use client";

import { Board } from "@/lib/sudoku";
import { getRelatedCells } from "@/lib/sudoku";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface Props {
  board: Board;
  solution: Board;
  given: boolean[][];
  selected: { row: number; col: number } | null;
  notes: Set<number>[][];
  conflicts: boolean[][];
  highlightedNumber: number | null;
  lastAnimatedCell: { row: number; col: number; type: "ok" | "error" } | null;
  onSelectCell: (row: number, col: number) => void;
  isComplete: boolean;
}

const NOTE_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SudokuBoard({
  board,
  solution,
  given,
  selected,
  notes,
  conflicts,
  highlightedNumber,
  lastAnimatedCell,
  onSelectCell,
  isComplete,
}: Props) {
  const relatedCells = selected
    ? getRelatedCells(selected.row, selected.col)
    : new Set<string>();

  const selectedValue =
    selected ? board[selected.row]?.[selected.col] : null;

  const animKeyRef = useRef<Record<string, number>>({});

  return (
    <div
      className="sudoku-grid"
      style={{ width: "100%", maxWidth: "520px", touchAction: "manipulation" }}
      role="grid"
      aria-label="Sudoku puzzle grid"
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r}-${c}`;
          const isSelected = selected?.row === r && selected?.col === c;
          const isRelated = !isSelected && relatedCells.has(key);
          const isGiven = given[r][c];
          const hasConflict = conflicts[r][c];
          const cellNotes = notes[r][c];
          const hasNotes = cellNotes.size > 0 && cell === null;

          const isMatchNum =
            !isSelected &&
            highlightedNumber !== null &&
            cell === highlightedNumber;

          const isAnimated =
            lastAnimatedCell?.row === r && lastAnimatedCell?.col === c;

          return (
            <div
              key={key}
              role="gridcell"
              tabIndex={0}
              aria-selected={isSelected}
              aria-label={
                cell
                  ? `Row ${r + 1}, Column ${c + 1}: ${cell}`
                  : `Row ${r + 1}, Column ${c + 1}: empty`
              }
              data-row={r}
              data-col={c}
              className={cn(
                "sudoku-cell",
                isGiven ? "cell-given" : "cell-user",
                isSelected && "cell-selected",
                isRelated && !isSelected && "cell-related",
                isMatchNum && "cell-match",
                hasConflict && !isSelected && "cell-error",
                isAnimated && lastAnimatedCell?.type === "ok" && "animate-pop",
                isAnimated && lastAnimatedCell?.type === "error" && "cell-error"
              )}
              onClick={() => onSelectCell(r, c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectCell(r, c);
                }
              }}
              style={{
                borderRight:
                  c === 2 || c === 5
                    ? "2px solid rgba(130, 130, 240, 0.28)"
                    : undefined,
                borderBottom:
                  r === 2 || r === 5
                    ? "2px solid rgba(130, 130, 240, 0.28)"
                    : undefined,
              }}
            >
              {hasNotes ? (
                <div className="cell-notes">
                  {NOTE_POSITIONS.map((n) => (
                    <div
                      key={n}
                      className="cell-note-num"
                      style={{
                        opacity: cellNotes.has(n) ? 1 : 0,
                        color: cellNotes.has(n) ? "#818cf8" : "transparent",
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              ) : cell !== null ? (
                <span
                  style={{
                    display: "block",
                    lineHeight: 1,
                    color: hasConflict
                      ? "#f87171"
                      : isGiven
                      ? "#a5b4fc"
                      : isComplete
                      ? "#34d399"
                      : "#e8e8f4",
                    textShadow: isComplete
                      ? "0 0 12px rgba(52, 211, 153, 0.4)"
                      : isGiven
                      ? "0 0 10px rgba(165, 180, 252, 0.25)"
                      : "none",
                    transition: "color 0.25s ease, text-shadow 0.25s ease",
                  }}
                >
                  {cell}
                </span>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
