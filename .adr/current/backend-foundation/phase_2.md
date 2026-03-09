# Phase 2: Auth Endpoints

Session: backend-foundation
Phase: 2
Date: 2026-03-07

## Prior Phase Summary
Phase 1 completed: All 18 Prisma tables verified, admin account seeded (admin@ideamgmt.local / AdminPass123!), Prisma client generated. Commit: 64568c4.

## Objective
Test and fix every auth endpoint against the live running dev server with a real database.

## Tasks
1. Start the dev server (`pnpm dev` or `npx next dev`) if not running
2. Test signup endpoint (POST /api/auth/signup):
   - Valid signup (email + 12+ char password)
   - Duplicate email rejection
   - Short password rejection (<12 chars)
   - Missing fields rejection
3. Test signin endpoint (POST /api/auth/signin):
   - Correct credentials -> session token in cookie
   - Wrong password -> 401
   - Non-existent account -> 401
   - Missing fields -> 400
4. Test signout endpoint (POST /api/auth/signout):
   - Single device signout (revokes current session)
   - All-devices signout (if supported)
5. Test refresh token rotation (POST /api/auth/refresh):
   - Valid refresh -> new session + new refresh token
   - Expired/revoked refresh -> 401
6. Test email verification (POST /api/auth/verify-email):
   - Valid token -> emailVerifiedAt set
   - Invalid/expired token -> error
7. Test password reset flow:
   - POST /api/auth/password-reset (request reset)
   - POST /api/auth/password-reset/confirm (confirm with token + new password)
8. Test GET /api/auth/me (authenticated user info)
9. Fix any broken endpoints — document all fixes

## Validation
- Test against live dev server (localhost:3000)
- Use curl/fetch with real HTTP requests
- User stories:
  - US-1: Signup creates user and returns session
  - US-2: Signup rejects duplicate emails
  - US-3: Signup rejects short passwords
  - US-4: Signin with correct credentials returns session cookie
  - US-5: Signin with wrong credentials returns 401
  - US-6: Signout revokes session
  - US-7: Refresh token rotation works
  - US-8: GET /me returns authenticated user
  - US-9: Password reset flow works end-to-end
- Report: `.docs/validation/backend-foundation/phase_2/user-story-report.md`

## Output
- `.adr/history/backend-foundation/phase_2_review.md`
- `.docs/validation/backend-foundation/phase_2/user-story-report.md`
- Updated primary task list (Phase 2 checked off)
