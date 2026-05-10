"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, Trophy, Calendar, Zap, Crown, Users, LogOut, UserCircle, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useTheme } from "@/lib/themeContext";

const NAV_LINKS = [
  { href: "/play",        label: "Play",        icon: Zap },
  { href: "/daily",       label: "Daily",       icon: Calendar },
  { href: "/lobby",       label: "Multiplayer", icon: Users },
  { href: "/leaderboard", label: "Rankings",    icon: Trophy },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isDark = theme === "dark";

  async function handleSignOut() {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
  }

  const headerBg = isDark
    ? "rgba(7,7,15,0.85)"
    : "rgba(244,244,250,0.88)";

  const borderColor = isDark
    ? "rgba(100,100,200,0.12)"
    : "rgba(100,100,180,0.18)";

  const textPrimary = isDark ? "#e8e8f4" : "#1a1a2e";
  const textSecondary = isDark ? "#9090b8" : "#4a4a72";

  return (
    <header style={{ background: headerBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${borderColor}`, position: "sticky", top: 0, zIndex: 40, transition: "background 0.25s ease, border-color 0.25s ease" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(109,93,252,0.4)" }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.15rem", color: textPrimary, letterSpacing: "-0.02em", transition: "color 0.25s" }}>
            Sudoku<span style={{ color: "#818cf8" }}>Mind</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", textDecoration: "none", fontFamily: "Plus Jakarta Sans,sans-serif", fontWeight: 500, fontSize: "0.9rem",
                  color: active ? "#818cf8" : textSecondary,
                  background: active ? "rgba(109,93,252,0.12)" : "transparent",
                  border: active ? "1px solid rgba(109,93,252,0.25)" : "1px solid transparent",
                  transition: "all 0.2s" }}>
                <Icon size={15} />
                {label}
              </Link>
            );
          })}

          {/* Pro */}
          <Link href="/pro"
            style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "6px", padding: "7px 14px", background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.1))", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "8px", textDecoration: "none", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fbbf24", letterSpacing: "0.02em" }}>
            <Crown size={13} />
            Pro
          </Link>

          {/* ── Theme Toggle ── */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              marginLeft: "6px",
              width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "8px", border: `1px solid ${borderColor}`,
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              cursor: "pointer",
              color: isDark ? "#fbbf24" : "#6d5dfc",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(251,191,36,0.12)" : "rgba(109,93,252,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"; }}
          >
            {isDark
              ? <Sun size={16} />
              : <Moon size={16} />
            }
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: "relative", marginLeft: "6px" }}>
              <button onClick={() => setUserMenuOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: isDark ? "rgba(13,13,26,0.9)" : "rgba(255,255,255,0.8)", border: `1px solid ${borderColor}`, borderRadius: "8px", cursor: "pointer", color: textPrimary, transition: "all 0.2s" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "white" }}>
                  {(profile?.display_name || profile?.username || "U").charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans,sans-serif", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.display_name || profile?.username}
                </span>
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: isDark ? "rgba(13,13,26,0.98)" : "rgba(255,255,255,0.98)", border: `1px solid ${borderColor}`, borderRadius: "12px", minWidth: "180px", overflow: "hidden", zIndex: 50, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  <Link href={`/profile/${user.id}`} onClick={() => setUserMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", textDecoration: "none", color: textPrimary, fontSize: "0.88rem", borderBottom: `1px solid ${borderColor}` }}>
                    <UserCircle size={15} color={textSecondary} /> My Profile
                  </Link>
                  <Link href="/friends" onClick={() => setUserMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", textDecoration: "none", color: textPrimary, fontSize: "0.88rem", borderBottom: `1px solid ${borderColor}` }}>
                    <Users size={15} color={textSecondary} /> Friends
                  </Link>
                  <button onClick={handleSignOut}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: "0.88rem", width: "100%" }}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth"
              style={{ marginLeft: "6px", padding: "7px 16px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", border: "none", borderRadius: "8px", textDecoration: "none", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "white" }}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
