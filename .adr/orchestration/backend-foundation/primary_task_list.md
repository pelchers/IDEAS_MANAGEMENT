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
- [ ] Review Prisma schema against PRD data model (users, projects, kanban, whiteboard, schema, ideas, AI, sync, billing)
- [ ] Run `prisma migrate reset` for a clean database
- [ ] Verify all 18 tables create correctly
- [ ] Document any missing or incorrect models
- [ ] Seed admin bootstrap account

## Phase 2: Auth Endpoints
- [ ] Test signup (email/password, 12+ char validation, duplicate rejection)
- [ ] Test signin (correct credentials, wrong credentials, missing account)
- [ ] Test signout (single device, all devices)
- [ ] Test refresh token rotation
- [ ] Test email verification flow
- [ ] Test password reset (request + confirm)
- [ ] Test admin bootstrap procedure
- [ ] Fix any broken endpoints

## Phase 3: Project CRUD + Members
- [ ] Test project create (name, description, tags)
- [ ] Test project list (search, sort, filter by status)
- [ ] Test project get by ID
- [ ] Test project update (name, description, status, tags)
- [ ] Test project delete
- [ ] Test member add/remove/role change
- [ ] Fix any broken endpoints

## Phase 4: Artifact + Sync + AI Endpoints
- [ ] Test artifact CRUD (read/write project files: kanban, ideas, whiteboard, schema, directory-tree)
- [ ] Test sync push/pull/force endpoints
- [ ] Test conflict resolution endpoint
- [ ] Test AI chat session CRUD
- [ ] Test AI chat message send/receive
- [ ] Test AI tool actions (add_idea, update_kanban, generate_tree, create_project_structure)
- [ ] Fix any broken endpoints

## Phase 5: Billing + Proxy + Health
- [ ] Test Stripe checkout session creation
- [ ] Test customer portal redirect
- [ ] Test webhook handler (signature verification, idempotency)
- [ ] Test proxy middleware (public routes pass, private routes require auth)
- [ ] Test health endpoint
- [ ] Verify rate limiting middleware (if implemented)
- [ ] Fix any broken endpoints
