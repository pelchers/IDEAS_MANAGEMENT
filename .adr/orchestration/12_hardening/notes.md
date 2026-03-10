# Notes — 12_hardening

## Decisions
- D1: CYCLIC session — phases are not pre-planned to a fixed count
- D2: Each feedback cycle from the user generates a new phase
- D3: Session ends only when the user explicitly confirms production readiness

## Process
- Phase 1: initial full validation
- Phase 2: security audit
- Phase 3+: user feedback cycles (dynamic)

## Constraints
- C1: User must provide production env vars (Stripe keys, API keys, DB URL)
- C2: Playwright must run against live app with real database
