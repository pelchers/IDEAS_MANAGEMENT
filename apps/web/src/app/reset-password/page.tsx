"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setMessage({ type: "err", text: "Missing or invalid reset link." });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setMessage({ type: "err", text: "Password must be at least 8 characters." }); return; }
    if (password !== confirm) { setMessage({ type: "err", text: "Passwords don't match." }); return; }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        setMessage({ type: "ok", text: "Password reset. You can now sign in." });
        setTimeout(() => router.push("/signin"), 1500);
      } else {
        setMessage({ type: "err", text: data.error === "invalid_or_expired_token" ? "This reset link is invalid or expired." : "Failed to reset password." });
      }
    } catch {
      setMessage({ type: "err", text: "Network error." });
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "monospace" }}>
      <div style={{ width: "100%", maxWidth: "420px", border: "3px solid #282828", boxShadow: "6px 6px 0 #282828", background: "#fff", padding: "32px" }}>
        <h1 style={{ textTransform: "uppercase", fontWeight: 800, fontSize: "1.3rem", marginTop: 0 }}>Reset Password</h1>
        {message && (
          <div style={{ padding: "10px", border: "2px solid #282828", marginBottom: "16px", fontSize: "0.8rem", background: message.type === "ok" ? "#D7F5E0" : "#FDE0DE" }}>
            {message.text}
          </div>
        )}
        {!done && token && (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="nb-input" autoComplete="new-password" />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="nb-input" autoComplete="new-password" />
            <button type="submit" className="nb-btn nb-btn--primary" disabled={busy}>{busy ? "RESETTING..." : "RESET PASSWORD"}</button>
          </form>
        )}
        <div style={{ marginTop: "16px", fontSize: "0.75rem" }}>
          <Link href="/signin" style={{ textDecoration: "underline" }}>Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "48px", fontFamily: "monospace" }}>Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}
