"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 12) {
      newErrors.password = "Password must be at least 12 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.ok) {
        window.location.href = "/dashboard";
      } else {
        setErrors({
          general:
            data.error === "email_in_use"
              ? "This email is already registered"
              : "Something went wrong",
        });
      }
    } catch {
      setErrors({ general: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 16px",
    border: "3px solid #282828",
    backgroundColor: "#FFFFFF",
    fontSize: "1rem",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    color: "#282828",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "8px",
    color: "#282828",
  };

  const errorStyle: React.CSSProperties = {
    color: "#FF5E54",
    fontSize: "0.8rem",
    fontFamily: "'IBM Plex Mono', monospace",
    marginTop: "4px",
  };

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
          <span style={{ fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.1, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            IDEA<br />MGMT
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", marginBottom: "32px", color: "#282828" }}>
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 12 characters"
              style={inputStyle}
            />
            {errors.password && <p style={errorStyle}>{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" style={labelStyle}>Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
              style={inputStyle}
            />
            {errors.confirm && <p style={errorStyle}>{errors.confirm}</p>}
          </div>

          {errors.general && (
            <p style={{ ...errorStyle, margin: 0 }}>{errors.general}</p>
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
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "3px solid #282828",
              boxShadow: "4px 4px 0px #282828",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              boxSizing: "border-box",
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "0.875rem", color: "#282828" }}>
          Already have an account?{" "}
          <Link
            href="/signin"
            style={{ fontWeight: 700, color: "#1283EB", textDecoration: "underline" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
