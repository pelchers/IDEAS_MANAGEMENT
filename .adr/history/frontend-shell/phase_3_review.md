# Phase 3 Review: Auth Pages

Session: frontend-shell
Phase: 3
Date: 2026-03-08
Status: COMPLETE

## Objective
Rebuild signin and signup pages to match pass-1 neo-brutalism concept styling. Wire to live auth endpoints with proper validation and error handling.

## What Was Done

### 1. Signin Page Rebuild
Rewrote `apps/web/src/app/signin/page.tsx` to use dedicated auth CSS classes from globals.css:
- `auth-page` — full-viewport centered layout on cream background
- `auth-card` — white card with thick black border and hard shadow
- `auth-logo` + `auth-logo-icon` + `auth-logo-text` — diamond icon + app name
- `auth-title` — large centered heading
- `auth-form` — flex column form with gap
- `auth-input` — brutalist input fields (thick border, no radius, shadow on focus)
- `auth-submit` — watermelon button with uppercase text, hard shadow, hover/active transforms
- `auth-error` — error alert (watermelon bg, white text, mono font)
- `auth-link` — cornflower blue link to signup
- Replaced `router.push()` with `window.location.href` for hard redirect (ensures cookies are read on next page load)
- Removed unused `useRouter` import; kept `useSearchParams` for redirect param

### 2. Signup Page Rebuild
Rewrote `apps/web/src/app/signup/page.tsx` with same auth CSS classes plus:
- Three fields: email, password, confirm password
- Client-side validation function with inline error display
- Email regex validation
- Password >= 12 characters check
- Passwords match check
- `auth-field-error` inline error class (new CSS rule added)
- Success state with green background alert, redirect to /dashboard after 1s
- Replaced `router.push()` with `window.location.href` for hard redirect

### 3. CSS Addition
Added `auth-field-error` class to globals.css for inline validation errors:
- Watermelon colored text, mono font, 0.75rem, uppercase
- Also added `margin-bottom` to existing `.auth-error` for spacing

## Files Changed
1. `apps/web/src/app/signin/page.tsx` — Full rewrite (95 -> 94 lines)
2. `apps/web/src/app/signup/page.tsx` — Full rewrite (127 -> 137 lines)
3. `apps/web/src/app/globals.css` — Added `.auth-field-error` class + margin fix on `.auth-error` (+10 lines)

## API Integration Verified
- `POST /api/auth/signin` — valid creds return 200 + session cookies, invalid return 401
- `POST /api/auth/signup` — new user returns 200 + user object, duplicate email returns 409
- Zod `CredentialsSchema` enforces email format + 12-char password minimum server-side

## Validation
- 9/9 user stories passed
- Report: `.docs/validation/frontend-shell/phase_3/user-story-report.md`

## Risk Assessment
- Low risk: Only auth page UI changes — no API or middleware modifications
- Auth pages remain outside (authenticated) route group — no AppShell contamination
- `window.location.href` ensures full page reload on redirect, guaranteeing cookies are properly read

## Next Phase
Phase 4: Dashboard Page — Rebuild dashboard matching pass-1 layout with project list wired to API.
