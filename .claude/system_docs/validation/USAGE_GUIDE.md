# Validation — Usage Guide

## Quick Start
```
/validate                          # full validation
/validate --e2e-only              # just Playwright tests
/validate 9_DYNAMIC_NAV           # validate ADR subfolder
/validate standalone "navbar fix" # standalone
```

## Output Files
- `overview.md` — summary with pass/fail counts
- `screenshots/` — desktop + mobile PNGs
- `user-story-report.md` — per-story evidence
- `test-results.md` — E2E suite results

## Troubleshooting
**Tests fail on first run:** Backend may need restart. Check API health first.
**Screenshots empty:** Ensure frontend is running on expected port.
