# Session Notes

Session: backend-foundation
Date: 2026-03-07

## Context
The backend was built in app_build_v1 but validated with mocked tests only. This session runs every endpoint against the live app with a real database to find and fix what's actually broken.

## Known Issues
- Project creation returns 401 when user is authenticated (reported by user)
- Webhook endpoint needed to be added to PUBLIC_API_PREFIXES (fixed previously)
- curl with `!` in passwords caused JSON parse errors (bash escaping issue, not a code bug)

## Session Completion Summary (2026-03-08)

All 5 phases complete. The backend-foundation session validated every API endpoint against the live dev server (localhost:3000) with a real PostgreSQL database.

### Phases Completed
1. **Phase 1 - Database + Prisma:** 18 tables verified, admin account seeded
2. **Phase 2 - Auth:** 7 user stories pass (signup, signin, signout, refresh, verify email, password reset, admin bootstrap)
3. **Phase 3 - Projects:** 7 user stories pass (CRUD, search, sort, filter, members, roles). Fixed: missing PATCH handler for role changes.
4. **Phase 4 - Artifacts + Sync + AI:** 9 user stories pass (artifact CRUD, sync push/pull/force, conflict resolution, AI sessions, AI chat). Fixed: AI chat error handling for missing API key.
5. **Phase 5 - Billing + Proxy + Health:** 7 user stories pass (health, proxy auth/unauth/public, billing checkout/portal/webhook). Fixed: billing endpoints return 503 (not 500) when Stripe not configured.

### Total Fixes Applied: 4
1. Missing PATCH handler for project member role changes
2. AI chat 500 on missing OpenAI API key -> 503 with descriptive error
3. Billing checkout 500 on placeholder Stripe keys -> 503 with descriptive error
4. Billing portal 500 on placeholder Stripe keys -> 503 with descriptive error

### Not Implemented (Documented)
- Rate limiting middleware: not present in codebase, recommended for production
