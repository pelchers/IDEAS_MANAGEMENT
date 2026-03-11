Phase: phase_2
Session: 3_auth-flow
Date: 2026-03-10
Owner: orchestrator
Status: planned

# Phase 2 — Auth API Verification + Integration

## Objectives
Verify existing auth API routes work correctly with the new signin/signup pages.
Test the full auth flow end-to-end: signup → signin → dashboard → signout.
Verify proxy.ts route protection redirects properly.

## Tasks
- [ ] Start dev server and PostgreSQL, verify database is accessible
- [ ] Test signup flow via curl/fetch: POST /api/auth/signup with valid credentials
- [ ] Test signin flow via curl/fetch: POST /api/auth/signin with the created credentials
- [ ] Verify session cookie is set after signin
- [ ] Test signout: POST /api/auth/signout clears session
- [ ] Test proxy.ts protection: unauthenticated GET /dashboard returns redirect to /signin
- [ ] Test proxy.ts pass-through: authenticated GET /dashboard returns 200
- [ ] Verify /api/auth/me returns user data when authenticated
- [ ] Fix any API issues found during testing
- [ ] Update phase review with results

## Deliverables
- All auth API routes verified working
- Full auth flow tested end-to-end
- Phase review with test results

## Validation Checklist
- [ ] Signup creates user in database
- [ ] Signin returns valid session cookies
- [ ] Signout clears cookies
- [ ] Route protection works (proxy.ts)
- [ ] Phase review created
- [ ] Committed
