---
name: validate
description: Run validation — E2E tests, user story checks, visual regression, accessibility
invocable: true
---

# Validate (/validate)

Run the validation agent for E2E testing, user story validation, visual regression, and accessibility audits.

## Modes
- `--e2e-only` — Playwright test suites only
- `--stories-only` — user story validation only
- `--visual-only` — screenshot capture only
- `--a11y` — accessibility audit

## Usage
```
/validate                          # full validation
/validate --e2e-only              # just E2E tests
/validate 9_DYNAMIC_NAV           # validate ADR subfolder work
/validate standalone "navbar fix" # standalone with named folder
```

## Output
ADR-linked: `.docs/validation/<SUBFOLDER>/phase_N/`
Standalone: `.docs/validation/standalone/N-description/`

$ARGUMENTS
