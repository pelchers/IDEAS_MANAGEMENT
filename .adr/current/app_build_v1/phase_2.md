# Phase Plan

Phase: phase_2
Session: app_build_v1
Date: 2026-02-10
Owner: longrunning-agent
Status: complete

## Objectives
- Add Prisma + PostgreSQL-backed schema for users, credentials, sessions, refresh tokens, and audit logs.
- Implement production-grade auth primitives (password hashing, session issuance, refresh rotation).
- Implement admin bootstrap account and baseline RBAC checks.

## Task checklist
- [x] Add Prisma to apps/web and define schema (users, credentials, sessions, refresh tokens, audit logs).
- [x] Add env template for DB and auth secrets.
- [x] Implement signup/signin/signout endpoints.
- [x] Implement refresh token rotation endpoint.
- [x] Implement admin bootstrap script guarded by an env bootstrap key.
- [x] Add basic request auth helper and role checks.
- [x] Add minimal tests for auth primitives (hashing, token verification, session revocation).
- [x] Implement email verification flow (token issuance + verify endpoint).
- [x] Implement password reset flow (request + confirm endpoints).
- [x] Implement sign out all devices variant.
- [x] Add Next.js proxy-based route protection.
- [x] Add desktop auth IPC handlers (session validation + logout).

## Deliverables
- Database schema and migrations.
- Working auth endpoints (web) with cookies.
- Admin bootstrap path.
- Email verification and password reset flows.
- Desktop session validation and logout IPC.
- Route protection via proxy.ts.
- Validation screenshots.

## Validation checklist
- [x] pnpm build succeeds
- [x] pnpm typecheck succeeds
- [x] Basic auth endpoint smoke tests pass (local)
- [x] Changes committed
- [x] Validation screenshots captured

## Risks / blockers
- Local Postgres availability: may require Docker or a local Postgres installation.

## Notes
- Auth and subscription plan source: .docs/planning/auth-and-subscriptions.md.
- Phase review: .adr/history/app_build_v1/phase_2_review.md
