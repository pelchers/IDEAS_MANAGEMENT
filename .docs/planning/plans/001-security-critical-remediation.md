# Remediation Plan — Security Critical Findings
**Audit**: 001 | **Date**: 2026-04-08 | **Priority**: P0 (Ship Blocker)
**References**: `001.02-security-2026-04-08.md` findings S-01, S-02, S-03, S-04

## Overview
This plan addresses the three critical/high security findings from the 2026-04-08 audit that must be resolved before any production deployment. All four items are low-effort, high-impact fixes.

---

## Item 1: Guard verification token in signup response (S-01)
**File**: `src/app/api/auth/signup/route.ts:55`
**Effort**: 15 minutes

### Problem
`_dev: { verificationToken: verification.token }` is returned in every signup response unconditionally. In production this exposes a live credential.

### Fix
Wrap in a `NODE_ENV !== "production"` guard:
```ts
// Change this:
const res = NextResponse.json({
  ok: true,
  user,
  _dev: { verificationToken: verification.token }
}, { status: 201 });

// To this:
const resBody: Record<string, unknown> = { ok: true, user };
if (process.env.NODE_ENV !== "production") {
  resBody._dev = { verificationToken: verification.token };
}
const res = NextResponse.json(resBody, { status: 201 });
```

### Validation
- In `NODE_ENV=development`: response still includes `_dev` for testing
- In `NODE_ENV=production`: response contains only `{ok, user}`

---

## Item 2: Add security headers (S-02)
**File**: `next.config.ts`
**Effort**: 1 hour

### Problem
No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy headers are set.

### Fix
Add an async `headers()` function to `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://api.openrouter.ai https://openrouter.ai",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Notes
- CSP `unsafe-inline` and `unsafe-eval` are needed for Next.js client components and inline styles — this is typical for Next.js apps using the App Router
- Tighten CSP progressively after confirming no inline script breakage
- HSTS only effective in production HTTPS environment

---

## Item 3: Fix open redirect in signin (S-03)
**File**: `src/app/signin/page.tsx:27-29`
**Effort**: 30 minutes

### Problem
`redirect` parameter from the query string is used directly as `window.location.href`, allowing `?redirect=https://evil.com`.

### Fix
Validate that the redirect is a same-origin path before using it:
```ts
// Change this:
const redirect = params.get("redirect") || "/dashboard";
window.location.href = redirect;

// To this:
const rawRedirect = params.get("redirect") || "/dashboard";
// Only allow same-origin relative paths
const safeRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
  ? rawRedirect
  : "/dashboard";
window.location.href = safeRedirect;
```

---

## Item 4: Add rate limiting on auth endpoints (S-04)
**File**: `src/app/api/auth/signin/route.ts`, `signup/route.ts`, `password-reset/route.ts`
**Effort**: 2-4 hours

### Problem
Auth endpoints are fully unthrottled — unlimited signin attempts, signups, and password reset requests.

### Recommended Approach
Use `@upstash/ratelimit` with Redis (or a lightweight in-memory fallback for development):

```ts
// src/server/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Production: Upstash Redis
// Development: use a simple in-memory map
export const authRateLimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 attempts per minute per IP
    })
  : null;

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; reset: number }> {
  if (!authRateLimit) return { allowed: true, reset: 0 };
  const result = await authRateLimit.limit(identifier);
  return { allowed: result.success, reset: result.reset };
}
```

Apply to signin, signup, and password-reset routes:
```ts
const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
const { allowed, reset } = await checkRateLimit(`auth:${ip}`);
if (!allowed) {
  return NextResponse.json(
    { ok: false, error: "rate_limit_exceeded", message: "Too many attempts. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
```

### Alternative (no Redis)
If Upstash/Redis is not available, use `next-rate-limit` or implement a simple in-memory token bucket with a Map (acceptable for single-instance deployments, not distributed).

---

## Verification Steps
1. Build passes: `pnpm --filter web build`
2. `NODE_ENV=production` signup response does not include `_dev`
3. Security headers present in HTTP responses (check with browser DevTools or `curl -I`)
4. `curl /signin?redirect=https://evil.com` after auth redirects to `/dashboard`, not the external URL
5. Auth endpoints return 429 after 5 rapid attempts from the same IP
