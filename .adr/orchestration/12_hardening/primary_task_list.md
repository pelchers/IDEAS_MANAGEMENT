# Primary Task List — 12_hardening

Session: Hardening (CYCLIC)
Started: 2026-03-10
Note: This session is CYCLIC — phases are created dynamically as feedback cycles occur

---

## Phase 1 — Full E2E Validation

- [ ] Run Playwright E2E tests across all 10 views
- [ ] Capture validation screenshots (desktop 1536x960 + mobile 390x844) for every view
- [ ] Run user story validation for every feature
- [ ] Compare all screenshots against pass-1 validation PNGs
- [ ] Document any visual discrepancies between app and pass-1 concept
- [ ] Run TypeScript type checking (zero errors)
- [ ] Run ESLint (zero errors)

## Phase 2 — Security Audit

- [ ] Verify auth protection on all routes (unauthenticated → redirect to /signin)
- [ ] Verify session cookie security (HttpOnly, SameSite, Secure in production)
- [ ] Verify CSRF protection via SameSite cookies
- [ ] Verify no XSS vectors in user-generated content display
- [ ] Verify Stripe webhook signature validation
- [ ] Verify password hashing uses Argon2id
- [ ] Check for exposed secrets in client-side code

## Phase 3 — UX Polish (from user feedback)

- [ ] Collect user feedback on visual discrepancies
- [ ] Fix identified issues
- [ ] Re-run validation
- [ ] Document fixes

## (Additional phases created dynamically from user feedback cycles)
