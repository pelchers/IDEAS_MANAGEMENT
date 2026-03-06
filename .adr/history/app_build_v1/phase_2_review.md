# Phase Review

Phase: phase_2
Session: app_build_v1
Date: 2026-03-05
Owner: longrunning-agent

## File tree (new/modified)

```
apps/
  desktop/
    src/
      main/
        auth.ts                          # NEW - Desktop auth IPC handlers
        main.ts                          # MOD - Register auth IPC on startup
      preload/
        preload.ts                       # MOD - Expose auth API to renderer
      renderer/
        ui/
          types.d.ts                     # MOD - Add auth type declarations
  web/
    prisma/
      schema.prisma                      # MOD - Add EmailVerificationToken, PasswordResetToken models
    scripts/
      bootstrap-admin.ts                 # MOD - Add audit logging, email pre-verification, password validation
    src/
      app/
        api/
          auth/
            me/
              route.ts                   # NEW - Session introspection endpoint (GET)
            password-reset/
              route.ts                   # NEW - Request password reset (POST)
              confirm/
                route.ts                 # NEW - Confirm password reset (POST)
            refresh/
              route.ts                   # MOD - Add audit logging
            signin/
              route.ts                   # (unchanged)
            signout/
              route.ts                   # MOD - Add allDevices flag, audit logging
            signup/
              route.ts                   # MOD - Issue email verification token on signup
            verify-email/
              route.ts                   # NEW - Email verification endpoint (POST)
      proxy.ts                           # MOD - Add route protection (session cookie check, redirect)
      server/
        auth/
          admin.ts                       # NEW - Auth/admin middleware (requireAuth, requireAdmin)
          config.ts                      # (unchanged)
          cookies.ts                     # (unchanged)
          credentials.ts                 # (unchanged)
          credentials.test.ts            # NEW - Credential validation tests
          email-verification.ts          # NEW - Email verification token issue/consume
          index.ts                       # NEW - Barrel export for auth module
          password.ts                    # (unchanged)
          password-reset.ts              # NEW - Password reset token issue/consume
          session.ts                     # MOD - Add validateSession, revokeAll functions
          session.test.ts                # NEW - Session crypto primitive tests
          tokens.ts                      # (unchanged)
    vitest.config.ts                     # NEW - Vitest configuration
scripts/
  validate-phase-2.mts                   # NEW - Playwright validation screenshot script
.docs/
  validation/
    phase_2/
      01-home-or-signin-redirect.png     # NEW - Home page screenshot
      02-health-endpoint.png             # NEW - Health endpoint response
      03-auth-me-unauthenticated.png     # NEW - 401 on unauthenticated /me
      04-protected-path-redirect.png     # NEW - Protected route redirect
      05-mobile-viewport.png             # NEW - Mobile viewport screenshot
```

## Overview

Phase 2 implements a complete production-grade, roll-your-own auth system for the IDEA-MANAGEMENT application. This includes:

- Full auth lifecycle: signup (with email verification), signin, signout (single + all devices), refresh token rotation, password reset
- Admin bootstrap and role enforcement middleware
- Desktop Electron IPC handlers for session validation and logout
- Next.js proxy-based route protection
- Comprehensive audit logging for all auth events
- Unit tests for auth primitives

## Technical breakdown

### Prisma Schema (2 new models)
- `EmailVerificationToken` - Token-based email verification with expiry and usage tracking
- `PasswordResetToken` - Token-based password reset with 1-hour TTL and usage tracking
- Both linked to User via foreign key with cascade delete

### Auth Server Modules
- **session.ts** - Added `validateSession()` (token-to-user lookup), `revokeAllSessionsForUser()`, `revokeAllRefreshTokensForUser()`
- **admin.ts** - `getAuthenticatedUser()`, `requireAuth()`, `requireAdmin()` with audit logging on denied admin access
- **email-verification.ts** - Token issuance (24h TTL) and consumption with transactional DB update
- **password-reset.ts** - Token issuance (1h TTL) and consumption with transactional password update

### API Endpoints
- `POST /api/auth/signup` - Updated to issue email verification token
- `POST /api/auth/signin` - Unchanged (already production-grade)
- `POST /api/auth/signout` - Updated with `allDevices` flag and audit logging
- `POST /api/auth/refresh` - Updated with audit logging
- `POST /api/auth/verify-email` - New endpoint consuming verification tokens
- `POST /api/auth/password-reset` - New endpoint requesting reset (no email enumeration)
- `POST /api/auth/password-reset/confirm` - New endpoint consuming reset token + new password
- `GET /api/auth/me` - New endpoint for session introspection

### Route Protection (proxy.ts)
- Updated Next.js 16 proxy.ts with auth route protection
- Public paths whitelisted (/, /signin, /signup, auth API routes, health)
- Protected API routes return 401 JSON without session cookie
- Protected page routes redirect to /signin with redirect parameter
- Request correlation IDs preserved

### Desktop Auth IPC
- `auth:storeTokens` - Encrypted token storage using Electron safeStorage
- `auth:validateSession` - Validates against web API, attempts refresh if expired
- `auth:logout` - Server-side revocation + local token cleanup
- `auth:hasStoredTokens` - Quick local check
- Preload bridge and TypeScript types updated

### Admin Bootstrap
- Enhanced with audit logging (`admin.bootstrap` event)
- Admin email pre-verified on creation
- Password length validation (min 12 chars)

### Tests
- 4 test files, 17 tests total, all passing
- `password.test.ts` - Hash/verify round-trip
- `tokens.test.ts` - Token generation and SHA-256 consistency
- `session.test.ts` - Session crypto primitives, uniqueness, storage model
- `credentials.test.ts` - Email/password/credentials Zod schema validation

## Validations completed

- `pnpm --dir apps/web typecheck` passes
- `pnpm --dir apps/desktop typecheck` passes
- `pnpm --dir apps/web build` succeeds (all routes visible in build output)
- `pnpm --dir apps/web test` passes (4 files, 17 tests)
- Playwright validation screenshots captured in `.docs/validation/phase_2/`:
  - `01-home-or-signin-redirect.png` - App serves, home page renders
  - `02-health-endpoint.png` - Health API returns JSON
  - `03-auth-me-unauthenticated.png` - 401 response on unauthenticated /me
  - `04-protected-path-redirect.png` - Protected path redirect behavior
  - `05-mobile-viewport.png` - Mobile viewport rendering

## Notes

- Email sending is stubbed (tokens returned in dev response body). Production would integrate an email provider.
- Password reset always returns 200 regardless of email existence to prevent email enumeration attacks.
- Desktop auth uses Electron's `safeStorage` for encrypted token persistence.
- The proxy.ts pattern is used instead of middleware.ts due to Next.js 16 requirements (proxy replaces middleware).
