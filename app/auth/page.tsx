"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "", password: "", username: "", displayName: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (form.username.length < 3) throw new Error("Username must be at least 3 characters");
        if (form.password.length < 6) throw new Error("Password must be at least 6 characters");
        await signUp({ email: form.email, password: form.password, username: form.username, displayName: form.displayName || form.username });
        router.push("/play");
      } else {
        await signIn({ email: form.email, password: form.password });
        router.push("/play");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "40px" }}>
        <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(109,93,252,0.4)" }}>
          <Brain size={20} color="white" />
        </div>
        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Sudoku<span style={{ color: "#818cf8" }}>Mind</span>
        </span>
      </Link>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "420px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "20px", padding: "36px", backdropFilter: "blur(16px)" }}>
        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg-0)", borderRadius: "10px", padding: "4px", marginBottom: "28px" }}>
          {(["signin", "signup"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "9px", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: "0.88rem", transition: "all 0.2s",
                background: mode === m ? "linear-gradient(135deg,#6d5dfc,#818cf8)" : "transparent",
                color: mode === m ? "white" : "var(--text-secondary)" }}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "signup" && (
            <>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input value={form.displayName} onChange={set("displayName")} placeholder="How others see you" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Username <span style={{ color: "#6d5dfc" }}>*</span></label>
                <input value={form.username} onChange={set("username")} placeholder="unique_handle" required style={inputStyle} />
                <p style={{ marginTop: "4px", fontSize: "0.73rem", color: "var(--text-muted)" }}>Used for friend search. Lowercase, no spaces.</p>
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#f87171", fontSize: "0.84rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ marginTop: "8px", padding: "12px", background: "linear-gradient(135deg,#6d5dfc,#818cf8)", border: "none", borderRadius: "10px", color: "white", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#818cf8", fontWeight: 600, fontSize: "0.82rem" }}>
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      <p style={{ marginTop: "24px", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
        You can play without an account.{" "}
        <Link href="/play" style={{ color: "#6d5dfc", textDecoration: "none" }}>Play as guest →</Link>
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: "6px", fontSize: "0.82rem",
  fontWeight: 500, color: "var(--text-secondary)", fontFamily: "Plus Jakarta Sans,sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px", background: "var(--bg-3)",
  border: "1px solid var(--border)", borderRadius: "8px",
  color: "var(--text-primary)", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans,sans-serif",
  outline: "none", boxSizing: "border-box",
};
