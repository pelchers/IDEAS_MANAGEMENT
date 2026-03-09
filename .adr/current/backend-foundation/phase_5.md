# Phase 5: Billing + Proxy + Health

Session: backend-foundation
Phase: 5
Date: 2026-03-07

## Prior Phase Summary
Phase 4 completed: All artifact, sync, and AI endpoints working. 9/9 user stories pass. Fixed AI chat error handling for missing API key. Commit: 39f5b9a.

## Objective
Test and fix billing (Stripe), proxy middleware, and health endpoints. Complete the backend-foundation session.

## Tasks
1. Test Stripe checkout session creation (POST /api/billing/checkout):
   - Test with valid plan parameter
   - Test without Stripe keys configured (should return appropriate error, not 500)
2. Test customer portal redirect (POST /api/billing/portal):
   - Test with/without existing Stripe customer
   - Verify redirect URL generation
3. Test webhook handler (POST /api/billing/webhook):
   - Test signature verification (should reject invalid signatures)
   - Test idempotency (duplicate event IDs rejected)
   - Test event processing structure
4. Test proxy middleware:
   - Public routes pass without auth (/, /signin, /signup, /api/auth/signup, /api/auth/signin, /api/health, /api/billing/webhook)
   - Private API routes return 401 without session cookie
   - Private page routes redirect to /signin without session cookie
   - Private routes pass with valid session cookie
5. Test health endpoint (GET /api/health):
   - Returns 200 with status info
   - Verify database connectivity check if present
6. Check rate limiting middleware (if implemented)
7. Fix any broken endpoints

## Validation
- User stories:
  - US-1: Health endpoint returns 200
  - US-2: Proxy blocks private routes without auth (401 for API, redirect for pages)
  - US-3: Proxy allows public routes through
  - US-4: Proxy allows authenticated requests through
  - US-5: Billing checkout handles missing Stripe keys gracefully
  - US-6: Billing webhook rejects invalid signatures
  - US-7: Billing webhook rejects duplicate events
- Report: `.docs/validation/backend-foundation/phase_5/user-story-report.md`

## Output
- `.adr/history/backend-foundation/phase_5_review.md`
- `.docs/validation/backend-foundation/phase_5/user-story-report.md`
- Updated primary task list (Phase 5 checked off)
- Session completion summary in notes.md
