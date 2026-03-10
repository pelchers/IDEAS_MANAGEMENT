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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 12) {
      newErrors.password = "Password must be at least 12 characters";
    }

    // Confirm password
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border-4 border-signal-black shadow-nb-lg p-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-signal-black mb-8 text-center">
          Sign Up
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
            {errors.email && (
              <p className="text-watermelon text-sm font-mono mt-1">
                {errors.email}
              </p>
            )}
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
              placeholder="Min 12 characters"
            />
            {errors.password && (
              <p className="text-watermelon text-sm font-mono mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-bold uppercase tracking-widest text-signal-black mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border-3 border-signal-black bg-transparent p-2 font-sans text-signal-black outline-none focus:shadow-nb focus:border-cornflower transition-all"
              placeholder="Re-enter password"
            />
            {errors.confirm && (
              <p className="text-watermelon text-sm font-mono mt-1">
                {errors.confirm}
              </p>
            )}
          </div>

          {errors.general && (
            <p className="text-watermelon text-sm font-mono">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-watermelon text-signal-black font-bold uppercase border-3 border-signal-black shadow-nb p-3 hover:-translate-y-0.5 hover:shadow-nb-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-signal-black">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-bold text-cornflower underline hover:text-watermelon transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
