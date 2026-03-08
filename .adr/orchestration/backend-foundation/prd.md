# Product Requirements (Session Reference)

Session: backend-foundation

Full PRD: `.docs/planning/prd.md`
Technical Spec: `.docs/planning/technical-specification.md`
Auth Spec: `.docs/planning/auth-and-subscriptions.md`
Sync Strategy: `.docs/planning/sync-strategy.md`

## Scope

Audit, test, and fix the entire backend API layer. The backend was built in app_build_v1 (phases 1-7) but was never tested against a live running app with a real database. This session validates every endpoint and fixes what's broken.

## Existing Assets
- 25 API route files in `apps/web/src/app/api/`
- 343-line Prisma schema with 18 tables
- Proxy middleware (`proxy.ts`) enforcing auth on private routes
- Local PostgreSQL: `postgresql://postgres:2322@localhost:5432/idea_management`
