# Primary Task List

Session: app_build_v1
Date: 2026-02-10
Updated: 2026-03-05

Primary requirements sources:
- `.docs/planning/prd.md`
- `.docs/planning/technical-specification.md`
- `.docs/planning/auth-and-subscriptions.md`
- `.docs/planning/sync-strategy.md`
- `.docs/planning/deployment-and-hosting.md`

Legend: `[ ]` pending, `[x]` done, `[~]` in progress.

---

**Validation policy (all phases):** Every phase MUST capture Playwright validation screenshots
before marking complete. Screenshots go to `.docs/validation/phase_<N>/` with desktop
and mobile viewport captures of all new/modified UI surfaces. Phase review files must
reference the screenshot paths. No phase is done without visual evidence.

---

## Phase 1: Repo + Platform Foundation (Web-First + Early Electron Spine)
- [x] Create monorepo layout (`apps/web`, `apps/desktop`, `packages/*`) and CI-friendly scripts.
- [~] Establish shared domain contracts in `packages/schemas` (zod) for:
  - [x] project.json
  - [ ] ideas.json
  - [ ] kanban board
  - [ ] whiteboard
  - [ ] schema graph
  - [x] sync ops and revisions
- [~] Implement API foundation in web stack:
  - [x] health endpoint
  - [x] request logging + correlation IDs
  - [ ] rate limiting middleware
  - [ ] error handling standards
- [ ] Establish observability baseline:
  - [ ] Sentry wiring (web + API)
  - [ ] structured logs
- [~] Thin Electron spine (do early, minimal UI):
  - [ ] login screen shell
  - [x] choose local project root folder
  - [x] show local project browser view from filesystem
  - [x] stub sync queue writer (local ops recorded)
- [ ] **Validation screenshots** — `.docs/validation/phase_1/` (desktop + mobile)

## Phase 2: Auth + Sessions + Admin Override (Production-Grade)
- [x] DB + Prisma schema for users/credentials/sessions/refresh tokens/audit logs.
- [x] Roll-your-own auth:
  - [x] sign up + email verification
  - [x] sign in
  - [x] refresh token rotation
  - [x] sign out (single device + all devices)
  - [x] password reset
- [x] Admin override account:
  - [x] bootstrap procedure (env-provided admin email + secret)
  - [x] admin role enforcement
  - [x] audit events for admin actions
- [x] Desktop enforcement:
  - [x] app startup session validation
  - [x] logout and token revocation handling
- [x] **Validation screenshots** — `.docs/validation/phase_2/` (auth flows, admin panel, desktop gate)

## Phase 3: Subscriptions + Entitlements (Stripe)
- [x] Stripe product/price plan definitions (requires final tiers decision).
- [x] Checkout + Customer Portal integration.
- [x] Webhook handler:
  - [x] idempotency guarantees
  - [x] retries and dead-letter policy
  - [x] entitlement state machine updates
- [x] Entitlement enforcement:
  - [x] server-side gates on premium endpoints
  - [x] client-side UX gates
  - [x] desktop gates at startup and feature entrypoints
- [x] **Validation screenshots** — `.docs/validation/phase_3/` (checkout flow, entitlement gates, portal)

## Phase 4: AI (Full Page + Sidebar) With Tool Actions
- [x] /ai full page chat:
  - [x] project picker / context selector
  - [x] chat transcript persistence (Prisma-backed AiChatSession + AiChatMessage)
  - [x] tool invocation UI + confirmations
- [x] AI sidebar:
  - [x] context from current project + route
  - [x] quick actions
- [x] Tooling layer (typed, allowlisted):
  - [x] add_idea validates and persists via AiToolOutput (DB-backed)
  - [x] update_kanban validates and modifies kanban state (DB-backed)
  - [x] generate_tree creates/updates directory tree plan (DB-backed)
  - [x] create_project_structure scaffolds default folders/files (DB-backed)
- [x] Audit logging:
  - [x] every AI tool mutation recorded with diff metadata and actor identity
- [x] **Validation screenshots** — `.docs/validation/phase_4/` (AI chat, sidebar, tool actions)

## Phase 5: Project Browser + Sync Core
- [x] Cloud canonical project model:
  - [x] projects table + membership
  - [x] artifact storage metadata
- [x] Local mirror contract enforcement:
  - [x] project.json template creation
  - [x] required folders/files bootstrap
- [x] Sync queue:
  - [x] operation format
  - [x] enqueue on local mutation
  - [x] background push
  - [x] pull/rehydrate local mirror from cloud
- [x] Conflict strategy:
  - [x] auto-merge for append-only artifacts (ideas, logs)
  - [x] manual resolver UI for structured conflicts
  - [x] snapshots and rollback
- [x] **Validation screenshots** — `.docs/validation/phase_5/` (project browser, sync UI, conflict resolver)

## Phase 6: Core Features (Kanban + Ideas + Whiteboard + Schema + Directory Generator)
- [ ] Ideas list UI bound to ideas/ideas.json (with sync).
- [ ] Kanban MVP -> full interactions (with sync + revisioning).
- [ ] Whiteboard MVP -> containers with drag/resize/text/image (with sync + asset storage).
- [ ] Schema planner nodes/edges + exports.
- [ ] Directory generator preview/apply with safe writes.
- [ ] **Validation screenshots** — `.docs/validation/phase_6/` (kanban, ideas, whiteboard, schema, directory generator)

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
- [ ] **Validation screenshots** — `.docs/validation/phase_7/` (E2E test results, security audit, perf metrics)

## Deliverables Checklist
- [ ] Web app deployable on Vercel
- [ ] Backend deployable with stable env/config
- [ ] Desktop app build pipeline and release packaging
- [ ] Subscription enforcement verified across web and desktop
- [ ] AI tool actions audited and safe
