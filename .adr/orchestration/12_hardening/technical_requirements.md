# Technical Requirements — 12_hardening

## Testing Stack
- Playwright — E2E tests and validation screenshots
- Vitest — unit/integration tests
- TypeScript — zero-error type checking

## Validation Outputs
- `.docs/validation/12_hardening/phase_N/` — screenshots per cycle
- `.docs/validation/12_hardening/phase_N/user-story-report.md` — story results

## Production Config
- NODE_ENV=production
- Secure cookie flags
- HTTPS enforcement
- Database connection pooling
- Error monitoring (Sentry)
