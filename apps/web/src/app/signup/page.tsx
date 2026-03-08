'use client';

import { useState, FormEvent } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: typeof fieldErrors = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email address required';
    }
    if (password.length < 12) {
      errors.password = 'Password must be at least 12 characters';
    }
    if (password !== confirmPassword) {
      errors.confirm = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

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

      setSuccess('Account created! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">&#9670;</span>
          <span className="auth-logo-text">Idea Management</span>
        </div>

        <h1 className="auth-title">Create Account</h1>

        {error && (
          <div className="auth-error">{error}</div>
        )}

        {success && (
          <div className="auth-error" style={{ background: 'var(--nb-malachite)' }}>{success}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
              required
              autoComplete="email"
              style={fieldErrors.email ? { borderColor: 'var(--nb-watermelon)' } : undefined}
            />
            {fieldErrors.email && (
              <span className="auth-field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div>
            <input
              type="password"
              className="auth-input"
              placeholder="Password (12+ characters)"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
              required
              autoComplete="new-password"
              minLength={12}
              style={fieldErrors.password ? { borderColor: 'var(--nb-watermelon)' } : undefined}
            />
            {fieldErrors.password && (
              <span className="auth-field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div>
            <input
              type="password"
              className="auth-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({ ...prev, confirm: undefined })); }}
              required
              autoComplete="new-password"
              minLength={12}
              style={fieldErrors.confirm ? { borderColor: 'var(--nb-watermelon)' } : undefined}
            />
            {fieldErrors.confirm && (
              <span className="auth-field-error">{fieldErrors.confirm}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{' '}
          <a href="/signin">Sign In</a>
        </div>
      </div>
    </div>
  );
}
