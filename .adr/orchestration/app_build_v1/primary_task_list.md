# Primary Task List

Session: app_build_v1
Date: 2026-02-10

Primary requirements sources:
- `.docs/planning/prd.md`
- `.docs/planning/technical-specification.md`
- `.docs/planning/auth-and-subscriptions.md`
- `.docs/planning/sync-strategy.md`
- `.docs/planning/deployment-and-hosting.md`

Legend: `[ ]` pending, `[x]` done, `[~]` in progress.

## Phase 1: Repo + Platform Foundation (Web-First + Early Electron Spine)
- [ ] Create monorepo layout (`apps/web`, `apps/desktop`, `packages/*`) and CI-friendly scripts.
- [ ] Establish shared domain contracts in `packages/schemas` (zod) for:
  - project.json
  - ideas.json
  - kanban board
  - whiteboard
  - schema graph
  - sync ops and revisions
- [ ] Implement API foundation in web stack:
  - [ ] health endpoint
  - [ ] request logging + correlation IDs
  - [ ] rate limiting middleware
  - [ ] error handling standards
- [ ] Establish observability baseline:
  - [ ] Sentry wiring (web + API)
  - [ ] structured logs
- [ ] Thin Electron spine (do early, minimal UI):
  - [ ] login screen shell
  - [ ] choose local project root folder
  - [ ] show local project browser view from filesystem
  - [ ] stub sync queue writer (local ops recorded)

## Phase 2: Auth + Sessions + Admin Override (Production-Grade)
- [ ] DB + Prisma schema for users/credentials/sessions/refresh tokens/audit logs.
- [ ] Roll-your-own auth:
  - [ ] sign up + email verification
  - [ ] sign in
  - [ ] refresh token rotation
  - [ ] sign out (single device + all devices)
  - [ ] password reset
- [ ] Admin override account:
  - [ ] bootstrap procedure (env-provided admin email + secret)
  - [ ] admin role enforcement
  - [ ] audit events for admin actions
- [ ] Desktop enforcement:
  - [ ] app startup session validation
  - [ ] logout and token revocation handling

## Phase 3: Subscriptions + Entitlements (Stripe)
- [ ] Stripe product/price plan definitions (requires final tiers decision).
- [ ] Checkout + Customer Portal integration.
- [ ] Webhook handler:
  - [ ] idempotency guarantees
  - [ ] retries and dead-letter policy
  - [ ] entitlement state machine updates
- [ ] Entitlement enforcement:
  - [ ] server-side gates on premium endpoints
  - [ ] client-side UX gates
  - [ ] desktop gates at startup and feature entrypoints

## Phase 4: AI (Full Page + Sidebar) With Tool Actions
- [ ] /ai full page chat:
  - [ ] project picker / context selector
  - [ ] chat transcript persistence (ai/chats/*.ndjson locally, mirrored in cloud)
  - [ ] tool invocation UI + confirmations
- [ ] AI sidebar:
  - [ ] context from current project + route
  - [ ] quick actions
- [ ] Tooling layer (typed, allowlisted):
  - [ ] add_idea writes to ideas/ideas.json
  - [ ] update_kanban modifies kanban/board.json
  - [ ] generate_tree writes/updates directory-tree/tree.plan.json and generated outputs
  - [ ] create_project_structure scaffolds default folders/files
- [ ] Audit logging:
  - [ ] every AI file mutation recorded with diff metadata and actor identity

## Phase 5: Project Browser + Sync Core
- [ ] Cloud canonical project model:
  - [ ] projects table + membership
  - [ ] artifact storage metadata
- [ ] Local mirror contract enforcement:
  - [ ] project.json template creation
  - [ ] required folders/files bootstrap
- [ ] Sync queue:
  - [ ] operation format
  - [ ] enqueue on local mutation
  - [ ] background push
  - [ ] pull/rehydrate local mirror from cloud
- [ ] Conflict strategy:
  - [ ] auto-merge for append-only artifacts (ideas, logs)
  - [ ] manual resolver UI for structured conflicts
  - [ ] snapshots and rollback

## Phase 6: Core Features (Kanban + Ideas + Whiteboard + Schema + Directory Generator)
- [ ] Ideas list UI bound to ideas/ideas.json (with sync).
- [ ] Kanban MVP -> full interactions (with sync + revisioning).
- [ ] Whiteboard MVP -> containers with drag/resize/text/image (with sync + asset storage).
- [ ] Schema planner nodes/edges + exports.
- [ ] Directory generator preview/apply with safe writes.

## Phase 7: Production Hardening + Release
- [ ] User story validation pass against `.docs/planning/user-stories.md` using:
  - `.codex/agents/user-story-testing-agent.md`
  - `.codex/skills/testing-user-stories-validation`
- [ ] E2E test suite for:
  - auth + subscription gate
  - AI add idea -> persisted locally -> synced -> visible on web
  - project creation -> folder structure correct
- [ ] Security review checklist:
  - auth/session vulnerabilities
  - webhook verification
  - tool action authorization
- [ ] Performance passes:
  - dashboard scaling
  - canvas perf and memory
- [ ] Deployment readiness:
  - migrations
  - backups/restores
  - incident runbooks

## Deliverables Checklist
- [ ] Web app deployable on Vercel
- [ ] Backend deployable with stable env/config
- [ ] Desktop app build pipeline and release packaging
- [ ] Subscription enforcement verified across web and desktop
- [ ] AI tool actions audited and safe
