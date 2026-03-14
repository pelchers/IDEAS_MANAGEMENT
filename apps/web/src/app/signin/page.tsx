"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.ok) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/dashboard";
        window.location.href = redirect;
      } else {
        setError(
          data.error === "invalid_credentials"
            ? "Invalid email or password"
            : "Something went wrong"
        );
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "#F8F3EC",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          minWidth: "320px",
          backgroundColor: "#FFFFFF",
          border: "4px solid #282828",
          boxShadow: "6px 6px 0px #282828",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          <span style={{ fontSize: "2.5rem", color: "#FF5E54" }}>&#9670;</span>
          <span style={{ fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.1, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
            IDEA<br />MGMT
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", textAlign: "center" as const, marginBottom: "32px", color: "#282828" }}>
          Sign In
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" as const, gap: "24px" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px", color: "#282828" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 16px",
                border: "3px solid #282828",
                backgroundColor: "#FFFFFF",
                fontSize: "1rem",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: "#282828",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px", color: "#282828" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              style={{
                width: "100%",
                padding: "10px 16px",
                border: "3px solid #282828",
                backgroundColor: "#FFFFFF",
                fontSize: "1rem",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: "#282828",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#FF5E54", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#FF5E54",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              border: "3px solid #282828",
              boxShadow: "4px 4px 0px #282828",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              boxSizing: "border-box",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "24px", textAlign: "center" as const, fontSize: "0.875rem", color: "#282828" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{ fontWeight: 700, color: "#1283EB", textDecoration: "underline" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
