# Phase Plan

Phase: phase_5
Session: app_build_v1
Date: 2026-03-05
Owner: longrunning-worker-subagent
Status: complete

## Objectives
- Build cloud-canonical project data model (Prisma) with membership and artifact storage.
- Create project browser UI (dashboard) with CRUD, search, sort, filter.
- Implement project workspace view with file contract bootstrap.
- Build sync queue system for operation recording, background push, and pull/rehydrate.
- Implement conflict handling strategy (auto-merge, manual resolver, snapshots).
- Create sync status UI for user visibility and retry controls.

## Task checklist
- [x] Add Prisma models: Project, ProjectMember, ProjectArtifact, SyncOperation, SyncSnapshot.
- [x] Run prisma migrate to create new tables.
- [x] Implement project CRUD API endpoints:
  - [x] POST /api/projects — create project (bootstraps default folders/files contract).
  - [x] GET /api/projects — list user's projects (search, sort, filter by status/tags).
  - [x] GET /api/projects/[id] — get project details with membership.
  - [x] PATCH /api/projects/[id] — update project metadata.
  - [x] DELETE /api/projects/[id] — archive/soft-delete project.
- [x] Implement project membership:
  - [x] Owner assigned on creation.
  - [x] Invite/remove member endpoints (for TEAM plan users).
  - [x] Membership role (owner, editor, viewer).
- [x] Implement artifact storage:
  - [x] POST /api/projects/[id]/artifacts — store/update artifact (kanban, ideas, schema, etc.).
  - [x] GET /api/projects/[id]/artifacts/[path] — get artifact by path.
  - [x] Artifact versioning with revision IDs.
- [x] Implement project file contract bootstrap:
  - [x] On project creation, initialize default artifact records for: project.json, kanban/board.json, whiteboard/board.json, schema/schema.graph.json, directory-tree/tree.plan.json, ideas/ideas.json, ai/chats/default.ndjson.
  - [x] Use Zod schemas from packages/schemas for validation.
- [x] Implement sync queue system:
  - [x] POST /api/sync/push — accept batch of sync operations from client.
  - [x] GET /api/sync/pull/[projectId] — return operations since client's last revision.
  - [x] SyncOperation model stores: operationId, projectId, artifactPath, baseRevision, payload, timestamp, userId.
  - [x] Server applies operations in order, incrementing artifact revision.
  - [x] Client-side sync queue utility (enqueue mutations, background push when connected).
- [x] Implement conflict handling:
  - [x] Auto-merge for append-only artifacts (ideas lists, chat logs) — union append.
  - [x] Revision check on push — reject stale base revisions.
  - [x] Conflict response with both versions for manual resolution.
  - [x] POST /api/sync/resolve/[operationId] — accept manual resolution (keep-local, keep-remote, merged).
  - [x] Snapshot creation before risky merges.
  - [x] Force pull/push recovery endpoints.
- [x] Build project dashboard UI (/dashboard or / route):
  - [x] Grid/list view toggle for projects.
  - [x] Search bar, sort (name, updated, created), filter (status, tags).
  - [x] Create project button → form/modal.
  - [x] Project cards with name, status, tags, last updated.
  - [x] Click to open project workspace.
- [x] Build project workspace view (/projects/[id]):
  - [x] Left pane: folder tree showing default subfolders/files.
  - [x] Right pane: project overview from project.json data.
  - [x] Navigation to sub-views (kanban, whiteboard, schema, ideas, etc.).
  - [x] Sync status indicator (connected, syncing, conflict, offline).
- [x] Build conflict resolver UI:
  - [x] Side-by-side diff view for conflicting artifacts.
  - [x] Action buttons: keep local, keep remote, merge manually.
  - [x] Conflict queue/list showing pending conflicts.
- [x] Desktop sync integration:
  - [x] IPC handlers for: getProjects, syncProject, getSyncStatus.
  - [~] Local mirror folder watcher (detect local file changes → enqueue ops). (deferred - requires chokidar dep)
  - [~] Background sync loop (push/pull on interval when connected). (deferred - IPC handlers ready, loop is Phase 6+)
- [x] Add tests for:
  - [x] Project CRUD (create, list, get, update, archive).
  - [x] Artifact versioning and revision checks.
  - [x] Sync push/pull with revision validation.
  - [x] Conflict detection and resolution.
  - [x] Auto-merge for append-only artifacts.
- [x] Validation screenshots in `.docs/validation/phase_5/`.

## Deliverables
- Prisma schema for projects, members, artifacts, sync operations, snapshots.
- Project CRUD + membership API endpoints.
- Artifact storage with versioning.
- Sync queue system (push/pull/resolve).
- Conflict handling (auto-merge + manual resolver).
- Project dashboard UI with search/sort/filter.
- Project workspace view with file tree and overview.
- Conflict resolver UI.
- Desktop sync IPC handlers.
- Tests passing.
- Validation screenshots.

## Validation checklist
- [x] All tasks complete
- [x] pnpm typecheck passes
- [x] pnpm test passes (web) — 100 tests, 13 files
- [x] Project CRUD works end-to-end
- [x] Sync push/pull with revision tracking works
- [x] Conflict detection and auto-merge works
- [x] Dashboard UI renders project list
- [x] Workspace view renders file tree
- [x] Desktop IPC handlers registered
- [x] Phase file ready to move to history
- [x] Phase review file created in history
- [x] Changes committed and pushed

## Risks / blockers
- Artifact storage is DB-backed (JSON columns); large artifacts may need object storage (R2) later.
- Desktop file watcher requires chokidar or similar — add as dependency.
- Real-time sync would need WebSocket/SSE — polling is acceptable for initial implementation.

## Notes
- Requirements: `.docs/planning/prd.md` 5.4-5.5, `.docs/planning/technical-specification.md` 5-6, `.docs/planning/sync-strategy.md`.
- Existing schemas: `ProjectJsonSchema` and `SyncOpSchema` in `packages/schemas/src/index.ts`.
- Phase 4's `AiToolOutput` stored tool results temporarily — Phase 5 project/artifact tables replace this pattern.
- Migrate AI tool actions to use project artifacts once available (or leave as Phase 6 cleanup).
