'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign in failed');
        return;
      }

      router.push(redirect);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nb-loading" style={{ minHeight: '100vh' }}>
      <div className="nb-form-card" style={{ width: '100%', maxWidth: 440 }}>
        <h1 style={{ marginBottom: 4 }}>Sign In</h1>
        <p className="nb-label" style={{ marginBottom: 24 }}>Idea Management</p>

        {error && (
          <div style={{ background: 'var(--nb-watermelon)', color: 'var(--nb-black)', padding: '10px 14px', border: 'var(--border-thick)', marginBottom: 16, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="nb-form-group">
            <label className="nb-label">Email</label>
            <input
              type="email"
              className="nb-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="nb-form-group">
            <label className="nb-label">Password</label>
            <input
              type="password"
              className="nb-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nb-btn nb-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ fontWeight: 700, borderBottom: 'var(--border-thin)' }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}
