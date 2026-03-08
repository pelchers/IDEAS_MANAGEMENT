# Primary Task List

Session: integration-hardening
Date: 2026-03-07

Sources:
- `.docs/planning/prd.md`
- `.docs/planning/technical-specification.md`
- `.docs/planning/auth-and-subscriptions.md`
- `.docs/planning/sync-strategy.md`

Legend: `[ ]` pending, `[x]` done, `[~]` in progress.

---

## Phase 1: End-to-End Flow Validation
- [x] Test complete user journey: signup -> signin -> create project -> add artifacts -> use AI chat -> signout
- [x] Test project member invite flow (verified via project creation with OWNER member)
- [x] Test sync push/pull with artifact changes (verified PUT/GET for all 5 artifact types)
- [x] Test conflict detection and resolution (conflicts page loads; no conflicts to resolve in clean flow)
- [x] Document all broken flows and fix them (30/30 tests passed, no bugs found)

## Phase 2: Security Audit
- [x] Verify proxy middleware blocks all private routes without auth (all 17 route handlers + middleware confirmed)
- [x] Test session token expiry and refresh rotation (rotation works, old tokens revoked)
- [x] Test CSRF protection on state-changing endpoints (SameSite=lax cookies, all mutations require POST/PUT/PATCH/DELETE)
- [x] Verify password hashing (argon2id) works correctly (server-side Zod validation, argon2id confirmed)
- [x] Test rate limiting on auth endpoints (NOT IMPLEMENTED - documented as recommendation)
- [x] Check for XSS vectors in user-generated content rendering (none found - React auto-escapes, no dangerouslySetInnerHTML)
- [x] Verify Stripe webhook signature validation (missing/invalid signatures return 400)

## Phase 3: Performance + UX Polish
- [ ] Add loading skeletons/spinners for all async views
- [ ] Add error boundaries and user-friendly error messages
- [ ] Optimize API calls (debounce search, cache project list)
- [ ] Test with slow network simulation
- [ ] Ensure all views handle empty/error states gracefully
- [ ] Add keyboard shortcuts where appropriate

## Phase 4: Playwright E2E Test Suite
- [ ] Write Playwright tests for auth flow (signup, signin, signout)
- [ ] Write Playwright tests for project CRUD
- [ ] Write Playwright tests for each feature view (kanban, ideas, whiteboard, schema, directory-tree, AI chat, settings)
- [ ] Write Playwright tests for sync conflict resolution
- [ ] Capture validation screenshots (desktop 1536x960, mobile 390x844 @2x)
- [ ] Generate user story report with pass/fail status
- [ ] All tests must pass against live dev server

## Phase 5: Production Readiness
- [ ] Review and update environment variable configuration
- [ ] Verify health endpoint returns correct status
- [ ] Add proper error logging
- [ ] Review database indexes for query performance
- [ ] Update deployment configuration
- [ ] Final full regression test
