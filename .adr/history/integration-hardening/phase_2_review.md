# Phase 2 Review: Security Audit

Session: integration-hardening
Phase: 2
Date: 2026-03-08
Duration: ~12 minutes

## Objective
Audit all security mechanisms: auth protection, session management, CSRF, password hashing, XSS vectors, Stripe webhook validation.

## Results

**24/24 tests passed. No critical or medium issues found.**

### Findings Summary

#### Auth Protection: STRONG
- All 17 private API route handlers call `requireAuth()` or `requireEntitlement()` (which wraps `requireAuth`)
- Proxy middleware (`src/proxy.ts`) checks cookie presence before allowing access to private routes
- Defense in depth: middleware checks cookie existence, route handlers validate the session hash against the database
- Public routes correctly excluded: signup, signin, refresh, verify-email, password-reset, health, billing webhook

#### Session Security: STRONG
- Tokens: 32 bytes from `crypto.randomBytes()` (256-bit entropy)
- Storage: SHA-256 hash stored in DB, raw token only in cookie
- Expiry: `validateSession()` checks `expiresAt` against `Date.now()`
- Revocation: `revokedAt` field checked on every validation
- Cookies: `HttpOnly: true`, `SameSite: lax`, `path: /`, `secure` controlled by env var

#### Refresh Token Rotation: STRONG
- Old refresh token revoked immediately on rotation (`revokedAt` set, `replacedById` linked)
- New session + refresh token issued together
- Reusing old refresh token returns 401 (revoked check)

#### Password Security: STRONG
- argon2id with default parameters (Argon2 library handles tuning)
- Server-side Zod validation: min 12 chars, max 256 chars
- `argon2.verify()` provides timing-safe comparison (constant-time internally)
- Signin: same error message for wrong password and non-existent user (no enumeration)
- Password reset: always returns 200 regardless of email existence (no enumeration)

#### CSRF Protection: ADEQUATE
- SameSite=lax cookies provide protection against cross-origin POST requests
- All state-changing endpoints require POST/PUT/PATCH/DELETE (not GET)
- No additional CSRF token mechanism, but SameSite=lax is the modern standard

#### XSS Prevention: STRONG
- No `dangerouslySetInnerHTML` usage in application code (only mentioned in test comments)
- React JSX auto-escapes all rendered content
- API routes return JSON via `NextResponse.json()` which properly serializes
- All user inputs validated through Zod schemas before processing

#### SQL Injection: NOT APPLICABLE
- All DB queries use Prisma ORM with parameterized queries
- No `$queryRaw` or `$executeRaw` usage found

#### Stripe Webhook: STRONG
- Signature verification via `stripe.webhooks.constructEvent()`
- Missing signature returns 400
- Invalid signature returns 400
- Proper error handling with try/catch

### Recommendations (Low Priority)

1. **Security Headers**: Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security` headers in production. Currently only `x-request-id` is set. These can be added in Next.js config or middleware.

2. **Rate Limiting**: No rate limiting exists on any endpoint. Recommended for:
   - `/api/auth/signin` (prevent brute force)
   - `/api/auth/signup` (prevent spam registration)
   - `/api/auth/password-reset` (prevent abuse)
   - Can use a middleware-based approach with in-memory or Redis-backed counters.

3. **Cookie Secure Flag**: `AUTH_COOKIE_SECURE` env var must be set to `"true"` in production. Currently defaults to `false` which is correct for localhost development.

4. **Dev Token Exposure**: `/api/auth/signup` and `/api/auth/password-reset` expose tokens in `_dev` response field. These must be removed before production deployment. Code comments already note this.

5. **Account Lockout**: No account lockout after failed login attempts. Consider implementing temporary lockout after N failed attempts.

### Bugs Fixed
None required. All security mechanisms are correctly implemented.

## Files Created
- `.docs/validation/integration-hardening/phase_2/user-story-report.md`
- `.adr/history/integration-hardening/phase_2_review.md`

## Files Changed
- `.adr/orchestration/integration-hardening/primary_task_list.md` (Phase 2 items checked off)
