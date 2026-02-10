# Milestones

## Phase 0: Planning and Contracts
- Finalize PRD, technical specification, auth/subscription model, and sync strategy.
- Lock JSON schemas and API contracts.

## Phase 1: Core Platform Foundation (AI + Auth First)
- Build web-first foundation first (API/auth/billing/AI tools), with a thin Electron spine early to validate filesystem + sync.
- Monorepo and shared package setup.
- Next.js web app + Electron desktop app shell with shared UI.
- Roll-your-own authentication stack.
- Stripe subscription and entitlement enforcement.
- Admin override account and audit logging.
- AI foundation:
  - Dedicated AI chat page
  - Workspace AI sidebar
  - Initial tool actions (`add_idea`, `update_kanban`, `generate_tree`)

## Phase 2: Project Browser and Sync Core
- Drive-like dashboard.
- Split-pane project workspace with `project.json` descriptors.
- Local mirror + cloud sync queue implementation.
- Conflict detection and recovery controls.

## Phase 3: Kanban and Ideas
- Full kanban interactions with persistence/sync.
- Ideas list with promotion workflows.

## Phase 4: Whiteboard, Schema, and Directory Generator
- Whiteboard containers with drag/resize/text/image.
- Node-based schema planner and export pipeline.
- Directory tree planner and generator.

## Phase 5: Production Hardening and Launch
- Performance tuning for 1,000+ user scale target.
- Security, billing, and sync reliability validation.
- End-to-end test coverage and deployment runbooks.
