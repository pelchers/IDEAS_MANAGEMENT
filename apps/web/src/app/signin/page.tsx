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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border-4 border-signal-black shadow-nb-lg p-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-signal-black mb-8 text-center">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-signal-black mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-3 border-signal-black bg-transparent p-2 font-sans text-signal-black outline-none focus:shadow-nb focus:border-cornflower transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-signal-black mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-3 border-signal-black bg-transparent p-2 font-sans text-signal-black outline-none focus:shadow-nb focus:border-cornflower transition-all"
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <p className="text-watermelon text-sm font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-watermelon text-signal-black font-bold uppercase border-3 border-signal-black shadow-nb p-3 hover:-translate-y-0.5 hover:shadow-nb-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-signal-black">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-cornflower underline hover:text-watermelon transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
