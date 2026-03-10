# Technical Requirements

Session: integration-hardening

## Stack
- Playwright for E2E testing
- All existing stack (Next.js 16, Prisma, PostgreSQL, Stripe)

## Testing
- Playwright config: `apps/web/playwright.config.ts`
- Test files: `apps/web/tests/` or `apps/web/e2e/`
- Screenshots: `apps/web/test-results/` or per-test validation folders
- Run against live dev server (localhost:3000)

## Security Checklist
- Proxy middleware (`apps/web/src/proxy.ts`) enforces auth on private routes
- Session tokens have proper expiry
- Refresh token rotation prevents replay
- Stripe webhooks verify signatures
- User input sanitized before rendering

## Validation
- User story report documenting every flow tested
- Playwright screenshots at desktop (1536x960) and mobile (390x844 @2x)
- All tests must pass (zero failures)
