# Product Requirements (Session Reference)

Session: integration-hardening

Full PRD: `.docs/planning/prd.md`
Auth Spec: `.docs/planning/auth-and-subscriptions.md`
Sync Strategy: `.docs/planning/sync-strategy.md`
Technical Spec: `.docs/planning/technical-specification.md`

## Scope

Validate the fully assembled app end-to-end, fix integration bugs, harden security, polish UX, write comprehensive Playwright E2E tests, and prepare for production deployment. This session runs after backend-foundation, frontend-shell, and feature-views are complete.

## Success Criteria
- All user journeys work end-to-end without errors
- All private routes are protected by auth
- Playwright test suite covers all major flows
- All tests pass against live dev server
- App handles edge cases (empty states, errors, slow network) gracefully
