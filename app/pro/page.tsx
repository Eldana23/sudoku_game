"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";
import { Crown, Check, Zap, Brain, BarChart3, Palette, Shield, Star } from "lucide-react";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$4.99",
    period: "/month",
    popular: false,
    savings: null,
  },
  {
    id: "annual",
    name: "Annual",
    price: "$2.99",
    period: "/month",
    popular: true,
    savings: "Save 40%",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$49",
    period: " one-time",
    popular: false,
    savings: "Best value",
  },
];

const PRO_FEATURES = [
  {
    icon: Brain,
    title: "Unlimited AI Coaching",
    desc: "Ask Claude anything, get deep strategy explanations and personalized tips",
    color: "#818cf8",
  },
  {
    icon: Zap,
    title: "Unlimited Hints",
    desc: "Never get stuck — reveal as many hints as you need to keep the flow",
    color: "#fbbf24",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Track your improvement over time with per-technique performance graphs",
    color: "#38bdf8",
  },
  {
    icon: Palette,
    title: "Custom Themes",
    desc: "Choose from 12 hand-crafted color schemes including AMOLED, Nord, and Monokai",
    color: "#a78bfa",
  },
  {
    icon: Star,
    title: "Weekly Expert Puzzles",
    desc: "Exclusive hand-crafted puzzles designed by champion Sudoku constructors",
    color: "#34d399",
  },
  {
    icon: Shield,
    title: "Ad-Free Forever",
    desc: "Clean, distraction-free environment. No ads, ever.",
    color: "#f87171",
  },
];

export default function ProPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-0)" }}>
      <Header />

      {/* Hero */}
      <div
        style={{
          position: "relative",
          padding: "64px 24px 48px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div className="hero-bg">
          <div
            className="hero-orb"
            style={{
              width: "500px",
              height: "500px",
              top: "-200px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
            }}
          />
          <div className="hero-grid" />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "100px",
            marginBottom: "20px",
          }}
        >
          <Crown size={14} color="#fbbf24" />
          <span
            style={{
              color: "#fbbf24",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            SUDOKUMIND PRO
          </span>
        </div>

        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          Unlock your full
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Sudoku potential
          </span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "520px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Join thousands of players who elevated their game with AI coaching,
          deep statistics, and unlimited practice tools.
        </p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px 80px" }}>
        {/* Pricing cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "60px",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.popular
                  ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.06))"
                  : "rgba(13, 13, 26, 0.85)",
                border: plan.popular
                  ? "2px solid rgba(245, 158, 11, 0.4)"
                  : "1px solid rgba(100, 100, 200, 0.15)",
                borderRadius: "18px",
                padding: "28px 24px",
                position: "relative",
                textAlign: "center",
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 14px",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    borderRadius: "100px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#07070f",
                    fontFamily: "Syne, sans-serif",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {plan.savings && (
                <div
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    background: plan.popular
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(109, 93, 252, 0.15)",
                    border: `1px solid ${plan.popular ? "rgba(245,158,11,0.35)" : "rgba(109,93,252,0.3)"}`,
                    borderRadius: "100px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: plan.popular ? "#fbbf24" : "#818cf8",
                    fontFamily: "Syne, sans-serif",
                    marginBottom: "14px",
                  }}
                >
                  {plan.savings}
                </div>
              )}

              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                {plan.name}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center",
                  gap: "2px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 700,
                    fontSize: "2.2rem",
                    color: plan.popular ? "#fbbf24" : "#e8e8f4",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {plan.period}
                </span>
              </div>

              <button
                className={plan.popular ? "btn-gold" : "btn-secondary"}
                style={{ width: "100%", marginTop: "20px" }}
              >
                {plan.popular ? "Get Pro Now" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div
          style={{
            marginBottom: "48px",
          }}
        >
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "1.6rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            Everything in Pro
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {PRO_FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "22px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={color} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      color: "var(--text-primary)",
                      marginBottom: "5px",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div
          style={{
            textAlign: "center",
            padding: "32px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "18px",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              fontFamily: "Syne, sans-serif",
              color: "#fbbf24",
              marginBottom: "6px",
            }}
          >
            12,400+
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
            players trust SudokuMind Pro
          </div>
          <Link href="/play" className="btn-secondary" style={{ display: "inline-flex" }}>
            Try Free First →
          </Link>
        </div>
      </div>
    </div>
  );
}
