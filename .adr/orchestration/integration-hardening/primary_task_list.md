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
- [ ] Test complete user journey: signup -> signin -> create project -> add artifacts -> use AI chat -> signout
- [ ] Test project member invite flow
- [ ] Test sync push/pull with artifact changes
- [ ] Test conflict detection and resolution
- [ ] Document all broken flows and fix them

## Phase 2: Security Audit
- [ ] Verify proxy middleware blocks all private routes without auth
- [ ] Test session token expiry and refresh rotation
- [ ] Test CSRF protection on state-changing endpoints
- [ ] Verify password hashing (argon2id) works correctly
- [ ] Test rate limiting on auth endpoints
- [ ] Check for XSS vectors in user-generated content rendering
- [ ] Verify Stripe webhook signature validation

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
