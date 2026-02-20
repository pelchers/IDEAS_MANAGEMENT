# Phase Plan

Phase: phase_2
Session: app_build_v1
Date: 2026-02-10
Owner: longrunning-agent
Status: in_progress

## Objectives
- Add Prisma + PostgreSQL-backed schema for users, credentials, sessions, refresh tokens, and audit logs.
- Implement production-grade auth primitives (password hashing, session issuance, refresh rotation).
- Implement admin bootstrap account and baseline RBAC checks.

## Task checklist
- [ ] Add Prisma to pps/web and define schema (users, credentials, sessions, refresh tokens, audit logs).
- [ ] Add env template for DB and auth secrets.
- [ ] Implement signup/signin/signout endpoints.
- [ ] Implement refresh token rotation endpoint.
- [ ] Implement admin bootstrap script guarded by an env bootstrap key.
- [ ] Add basic request auth helper and role checks.
- [ ] Add minimal tests for auth primitives (hashing, token verification, session revocation).

## Deliverables
- Database schema and migrations.
- Working auth endpoints (web) with cookies.
- Admin bootstrap path.

## Validation checklist
- [ ] pnpm build succeeds
- [ ] pnpm typecheck succeeds
- [ ] Basic auth endpoint smoke tests pass (local)
- [ ] Changes committed

## Risks / blockers
- Local Postgres availability: may require Docker or a local Postgres installation.

## Notes
- Auth and subscription plan source: .docs/planning/auth-and-subscriptions.md.
