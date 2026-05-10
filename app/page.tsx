"use client";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  Brain,
  Calendar,
  Trophy,
  Zap,
  BarChart3,
  Globe,
  ArrowRight,
  Pencil,
  RotateCcw,
  Crown,
} from "lucide-react";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-0)", overflowX: "hidden" }}>
      <Header />

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          padding: "80px 24px 80px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Background effects */}
        <div className="hero-bg">
          <div
            className="hero-orb"
            style={{
              width: "600px",
              height: "600px",
              top: "-250px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "radial-gradient(circle, #6d5dfc 0%, transparent 70%)",
            }}
          />
          <div
            className="hero-orb"
            style={{
              width: "300px",
              height: "300px",
              top: "60%",
              left: "10%",
              background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
              animationDelay: "2s",
            }}
          />
          <div
            className="hero-orb"
            style={{
              width: "250px",
              height: "250px",
              top: "40%",
              right: "8%",
              background: "radial-gradient(circle, #6d5dfc 0%, transparent 70%)",
              animationDelay: "4s",
            }}
          />
          <div className="hero-grid" />
        </div>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            background: "rgba(109, 93, 252, 0.1)",
            border: "1px solid rgba(109, 93, 252, 0.28)",
            borderRadius: "100px",
            marginBottom: "28px",
          }}
          className="animate-fade-up"
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#34d399",
              animation: "glowPulse 2s ease infinite",
              display: "inline-block",
            }}
          />
          <span
            style={{
              color: "#a5b4fc",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            AI-powered · Daily Challenges · Global Rankings
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "20px",
            maxWidth: "800px",
            margin: "0 auto 20px",
          }}
          className="animate-fade-up"
        >
          Sudoku, evolved
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #818cf8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            for the modern mind
          </span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            maxWidth: "540px",
            margin: "0 auto 40px",
            lineHeight: 1.75,
          }}
          className="animate-fade-up"
        >
          Not just a puzzle grid — a complete brain training platform with an
          AI coach that teaches strategy, daily challenges with global rankings,
          and a community of thinkers worldwide.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "60px",
          }}
          className="animate-fade-up"
        >
          <Link href="/play" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
            <Zap size={18} />
            Play Now — It&apos;s Free
          </Link>
          <Link href="/daily" className="btn-secondary" style={{ fontSize: "1rem", padding: "14px 28px" }}>
            <Calendar size={16} />
            Daily Challenge
          </Link>
        </div>

        {/* Mini preview grid (decorative) */}
        <div
          style={{
            display: "inline-block",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 40px)",
              gridTemplateRows: "repeat(9, 40px)",
              gap: "1px",
              background: "rgba(130, 130, 240, 0.2)",
              border: "2px solid rgba(130, 130, 240, 0.2)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow:
                "0 0 0 1px rgba(109, 93, 252, 0.1), 0 30px 80px rgba(0,0,0,0.5), 0 0 120px rgba(109, 93, 252, 0.1)",
            }}
          >
            {DEMO_BOARD.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      DEMO_SELECTED.includes(`${r}-${c}`)
                        ? "rgba(109, 93, 252, 0.22)"
                        : DEMO_RELATED.includes(`${r}-${c}`)
                          ? "rgba(109, 93, 252, 0.07)"
                          : "rgba(13, 13, 26, 0.9)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: DEMO_GIVEN.includes(`${r}-${c}`)
                      ? "#a5b4fc"
                      : cell === DEMO_HIGHLIGHT
                        ? "#818cf8"
                        : "#9090b8",
                    borderRight:
                      c === 2 || c === 5
                        ? "2px solid rgba(130, 130, 240, 0.3)"
                        : undefined,
                    borderBottom:
                      r === 2 || r === 5
                        ? "2px solid rgba(130, 130, 240, 0.3)"
                        : undefined,
                    boxShadow:
                      DEMO_SELECTED.includes(`${r}-${c}`)
                        ? "inset 0 0 0 2px rgba(109, 93, 252, 0.6)"
                        : undefined,
                  }}
                >
                  {cell ?? ""}
                </div>
              ))
            )}
          </div>

          {/* Floating AI badge */}
          <div
            style={{
              position: "absolute",
              top: "-16px",
              right: "-100px",
              background: "var(--bg-2)",
              border: "1px solid rgba(109, 93, 252, 0.35)",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              animation: "slideRight 0.5s ease 0.3s both",
            }}
          >
            <Brain size={16} color="#818cf8" />
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                AI Coach
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                Naked single found!
              </div>
            </div>
          </div>

          {/* Floating timer badge */}
          <div
            style={{
              position: "absolute",
              bottom: "-14px",
              left: "-90px",
              background: "var(--bg-2)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              animation: "slideRight 0.5s ease 0.5s both",
            }}
          >
            <Trophy size={16} color="#fbbf24" />
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#fbbf24",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                #1 in Almaty
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                03:42 · 0 errors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "12px",
            }}
          >
            Built different
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto" }}>
            Every feature is designed to help you actually get better, not just
            pass time.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map(({ icon: Icon, title, desc, color, badge }, i) => (
            <div
              key={title}
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: "18px",
                padding: "28px",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.borderColor = `${color}33`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(100, 100, 200, 0.12)";
              }}
            >
              {badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    padding: "2px 8px",
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "100px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#fbbf24",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {badge}
                </div>
              )}

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <Icon size={21} color={color} />
              </div>

              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          background: "rgba(13, 13, 26, 0.5)",
          borderTop: "1px solid rgba(100, 100, 200, 0.08)",
          borderBottom: "1px solid rgba(100, 100, 200, 0.08)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "48px",
            }}
          >
            Start improving in 3 minutes
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "32px",
            }}
          >
            {[
              {
                step: "01",
                title: "Pick a puzzle",
                desc: "Choose easy to expert, or jump into today's daily challenge",
                icon: Zap,
              },
              {
                step: "02",
                title: "Play and learn",
                desc: "Ask the AI coach about any cell — understand the why, not just the what",
                icon: Brain,
              },
              {
                step: "03",
                title: "Track progress",
                desc: "Watch your solve times drop and your ranking climb the global leaderboard",
                icon: BarChart3,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    letterSpacing: "0.1em",
                    marginBottom: "12px",
                  }}
                >
                  STEP {step}
                </div>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    margin: "0 auto 16px",
                    borderRadius: "16px",
                    background: "rgba(109, 93, 252, 0.12)",
                    border: "1px solid rgba(109, 93, 252, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={22} color="#818cf8" />
                </div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.04em",
            marginBottom: "16px",
          }}
        >
          Your brain deserves a
          <br />
          better puzzle game.
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            marginBottom: "36px",
            lineHeight: 1.7,
          }}
        >
          Free forever. No account needed to start. Upgrade when you want more.
        </p>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/play" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }}>
            Start Playing <ArrowRight size={17} />
          </Link>
          <Link href="/pro" className="btn-gold" style={{ fontSize: "1rem", padding: "14px 28px" }}>
            <Crown size={16} /> View Pro Plans
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(100, 100, 200, 0.08)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
          © 2026 SudokuMind 
        </p>
      </footer>
    </div>
  );
}

// ── Demo board data ────────────────────────────────────────────────────────────

const DEMO_BOARD = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

const DEMO_GIVEN = [
  "0-0", "0-1", "0-4",
  "1-0", "1-3", "1-4", "1-5",
  "2-1", "2-2", "2-7",
  "3-0", "3-4", "3-8",
  "4-0", "4-3", "4-5", "4-8",
  "5-0", "5-4", "5-8",
  "6-1", "6-6", "6-7",
  "7-3", "7-4", "7-5", "7-8",
  "8-4", "8-7", "8-8",
];

const DEMO_SELECTED = ["4-4"];
const DEMO_RELATED = [
  "4-0", "4-1", "4-2", "4-3", "4-5", "4-6", "4-7", "4-8",
  "0-4", "1-4", "2-4", "3-4", "5-4", "6-4", "7-4", "8-4",
  "3-3", "3-5", "5-3", "5-5",
];
const DEMO_HIGHLIGHT = 2;

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: "AI Coach",
    desc: "Claude explains exactly why each move works or doesn't. Learn solving strategies like naked singles, hidden pairs, and X-wings step by step.",
    color: "#818cf8",
    badge: "Powered by Claude",
  },
  {
    icon: Calendar,
    title: "Daily Challenge",
    desc: "Every day, everyone plays the same puzzle. Your solve time and accuracy are ranked globally — a fresh race every morning.",
    color: "#fbbf24",
    badge: null,
  },
  {
    icon: Globe,
    title: "City Leaderboards",
    desc: "Not just global — compete with players in your city. See who the top Sudoku mind in Almaty, London, or Seoul is today.",
    color: "#34d399",
    badge: null,
  },
  {
    icon: Pencil,
    title: "Pencil Notes",
    desc: "Jot candidate numbers in cells as you think. Notes auto-clear when you solve related cells — just like a paper puzzle but smarter.",
    color: "#38bdf8",
    badge: null,
  },
  {
    icon: RotateCcw,
    title: "Unlimited Undo",
    desc: "Experiment freely. Made a mistake? Undo any number of moves and try a different approach. Full history, no regrets.",
    color: "#a78bfa",
    badge: null,
  },
  {
    icon: Crown,
    title: "Pro Features",
    desc: "Unlimited hints, advanced analytics, custom themes, and exclusive expert puzzles designed by championship constructors.",
    color: "#f59e0b",
    badge: "Pro",
  },
];
