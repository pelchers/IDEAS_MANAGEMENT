'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      setSuccess('Account created! Redirecting to sign in...');
      setTimeout(() => router.push('/signin'), 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nb-loading" style={{ minHeight: '100vh' }}>
      <div className="nb-form-card" style={{ width: '100%', maxWidth: 440 }}>
        <h1 style={{ marginBottom: 4 }}>Sign Up</h1>
        <p className="nb-label" style={{ marginBottom: 24 }}>Create Your Account</p>

        {error && (
          <div style={{ background: 'var(--nb-watermelon)', color: 'var(--nb-black)', padding: '10px 14px', border: 'var(--border-thick)', marginBottom: 16, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'var(--nb-malachite)', color: 'var(--nb-black)', padding: '10px 14px', border: 'var(--border-thick)', marginBottom: 16, fontWeight: 600 }}>
            {success}
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
              minLength={12}
            />
          </div>

          <div className="nb-form-group">
            <label className="nb-label">Confirm Password</label>
            <input
              type="password"
              className="nb-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={12}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nb-btn nb-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
          Already have an account?{' '}
          <a href="/signin" style={{ fontWeight: 700, borderBottom: 'var(--border-thin)' }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
