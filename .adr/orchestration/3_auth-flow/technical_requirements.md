# Technical Requirements — 3_auth-flow

## Key Files
- `apps/web/src/app/signin/page.tsx` — signin form
- `apps/web/src/app/signup/page.tsx` — signup form
- `apps/web/src/app/api/auth/` — existing auth API routes (KEEP)
- `apps/web/src/middleware.ts` or `proxy.ts` — route protection

## Auth Model
- Argon2id password hashing
- Session cookie (`im_session`) with refresh token rotation
- Admin override account for testing

## Validation
- Playwright PNG screenshots (desktop 1536x960, mobile 390x844)
- User story tests against live app with real database
