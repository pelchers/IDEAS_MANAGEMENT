# Phase 1: Database + Prisma Audit

Session: backend-foundation
Phase: 1
Date: 2026-03-07

## Objective
Ensure the Prisma schema is correct, the database is clean, all 18 tables create successfully, and a bootstrap admin account exists for testing.

## Tasks
1. Review Prisma schema (`apps/web/prisma/schema.prisma`) against PRD data model
   - Verify all required models exist: User, Credential, Session, RefreshToken, EmailVerificationToken, PasswordResetToken, AuditLog, Subscription, Entitlement, BillingEvent, AiChatSession, AiChatMessage, AiToolOutput, Project, ProjectMember, ProjectArtifact, SyncOperation, SyncSnapshot
   - Check field types, relations, indexes, and constraints
2. Run `npx prisma migrate reset` for a clean database
3. Run `npx prisma migrate dev` and verify all 18 tables create correctly
4. Run `npx prisma generate` to ensure the client is up to date
5. Verify database connection works: `npx prisma db pull` or a simple query
6. Seed an admin bootstrap account (email: admin@ideamgmt.local, password: AdminPass123!)
7. Document any missing or incorrect models

## Validation
- All 18 tables exist in PostgreSQL
- Prisma client generates without errors
- Admin account exists and can be queried
- User story report documenting each check

## Output
- `.adr/history/backend-foundation/phase_1_review.md`
- `.docs/validation/backend-foundation/phase_1/user-story-report.md`
- Updated `.adr/orchestration/backend-foundation/primary_task_list.md` (Phase 1 checked off)
