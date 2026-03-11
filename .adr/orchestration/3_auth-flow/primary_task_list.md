# Primary Task List — 3_auth-flow

Session: Authentication Flow
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)

---

## Phase 1 — Auth Pages from Pass-1 ✅

- [x] Built signin page with neo-brutalist styling (4px border, hard shadow, uppercase labels, watermelon button)
- [x] Built signup page with email, password (12+ min), confirm password + client-side validation
- [x] Both pages wired to auth API (POST /api/auth/signin, POST /api/auth/signup)
- [x] Error handling: invalid_credentials, email_in_use, inline field validation
- [x] Redirect param support from proxy.ts

## Phase 2 — Auth API Verification ✅

- [x] All 8 auth API tests passed (signup, signin, me, signout, route protection, session revocation, bad creds, duplicate email)
- [x] No fixes needed — all routes working correctly
- [x] Session cookies set with HttpOnly, SameSite=lax
- [x] proxy.ts route protection confirmed working (307 redirect to /signin)

## Phase 3 — Auth Screenshots + Session Completion ✅

- [x] Created Playwright test for auth page screenshots (4 tests)
- [x] Captured desktop + mobile screenshots of signin and signup pages
- [x] Screenshots saved to .docs/validation/3_auth-flow/screenshots/
- [x] Session 3 completion review created
