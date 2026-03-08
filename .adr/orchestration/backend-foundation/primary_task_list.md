# Primary Task List

Session: backend-foundation
Date: 2026-03-07

Sources:
- `.docs/planning/prd.md`
- `.docs/planning/technical-specification.md`
- `.docs/planning/auth-and-subscriptions.md`
- `.docs/planning/sync-strategy.md`

Legend: `[ ]` pending, `[x]` done, `[~]` in progress.

---

## Phase 1: Database + Prisma Audit
- [x] Review Prisma schema against PRD data model (users, projects, kanban, whiteboard, schema, ideas, AI, sync, billing)
- [x] Run `prisma migrate reset` for a clean database
- [x] Verify all 18 tables create correctly
- [x] Document any missing or incorrect models
- [x] Seed admin bootstrap account

## Phase 2: Auth Endpoints
- [x] Test signup (email/password, 12+ char validation, duplicate rejection)
- [x] Test signin (correct credentials, wrong credentials, missing account)
- [x] Test signout (single device, all devices)
- [x] Test refresh token rotation
- [x] Test email verification flow
- [x] Test password reset (request + confirm)
- [x] Test admin bootstrap procedure
- [x] Fix any broken endpoints (none needed — all endpoints passed)

## Phase 3: Project CRUD + Members
- [x] Test project create (name, description, tags)
- [x] Test project list (search, sort, filter by status)
- [x] Test project get by ID
- [x] Test project update (name, description, status, tags)
- [x] Test project delete
- [x] Test member add/remove/role change
- [x] Fix any broken endpoints (added missing PATCH handler for member role changes)

## Phase 4: Artifact + Sync + AI Endpoints
- [x] Test artifact CRUD (read/write project files: kanban, ideas, whiteboard, schema, directory-tree)
- [x] Test sync push/pull/force endpoints
- [x] Test conflict resolution endpoint
- [x] Test AI chat session CRUD
- [x] Test AI chat message send/receive
- [x] Test AI tool actions (add_idea, update_kanban, generate_tree, create_project_structure)
- [x] Fix any broken endpoints (added error handling for missing API key in AI chat)

## Phase 5: Billing + Proxy + Health
- [x] Test Stripe checkout session creation
- [x] Test customer portal redirect
- [x] Test webhook handler (signature verification, idempotency)
- [x] Test proxy middleware (public routes pass, private routes require auth)
- [x] Test health endpoint
- [x] Verify rate limiting middleware (if implemented) — not implemented, documented
- [x] Fix any broken endpoints (added pre-flight Stripe key checks in checkout and portal)
