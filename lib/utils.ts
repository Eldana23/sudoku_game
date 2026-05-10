// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

/** Return today's date formatted as "Thursday, 8 May 2025" */
export function formatTodayLong(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Detect user's approximate city from IP (optional, uses free API) */
export async function detectCity(): Promise<{ city: string; country: string } | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return { city: data.city ?? "Unknown", country: data.country_name ?? "Unknown" };
  } catch {
    return null;
  }
}

export function getDifficultyColor(diff: string): string {
  const map: Record<string, string> = {
    easy: "#34d399",
    medium: "#38bdf8",
    hard: "#fbbf24",
    expert: "#f87171",
  };
  return map[diff] ?? "#94a3b8";
}

export function getDifficultyLabel(diff: string): string {
  return diff.charAt(0).toUpperCase() + diff.slice(1);
}

/** Rank suffix: 1st, 2nd, 3rd, 4th... */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
