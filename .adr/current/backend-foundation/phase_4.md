# Phase 4: Artifact + Sync + AI Endpoints

Session: backend-foundation
Phase: 4
Date: 2026-03-07

## Prior Phase Summary
Phase 3 completed: All project CRUD and member endpoints working. 7/7 user stories pass. Fixed missing PATCH endpoint for member role changes. 401 on project creation was a shell escaping issue, not a code bug. Commit: d73dc4c.

## Objective
Test and fix all artifact CRUD, sync push/pull/force/resolve, and AI chat endpoints against the live dev server.

## Tasks
1. Test artifact CRUD (GET/PUT /api/projects/[id]/artifacts):
   - Read artifact by type (kanban, ideas, whiteboard, schema, directory-tree)
   - Write/update artifact content
   - Test with valid and invalid artifact paths
   - Verify revision incrementing
2. Test artifact catch-all route (/api/projects/[id]/artifacts/[...path]):
   - Read nested artifact paths
   - Write nested artifact paths
3. Test sync push (POST /api/sync/push):
   - Push changes with correct base revision
   - Push with stale base revision (conflict detection)
4. Test sync pull (GET /api/sync/pull/[projectId]):
   - Pull latest artifact state
5. Test sync force (POST /api/sync/force):
   - Force overwrite artifact
6. Test sync conflict resolution (POST /api/sync/resolve/[operationId]):
   - Resolve a conflicting operation
7. Test AI chat session CRUD:
   - POST /api/ai/sessions — create session
   - GET /api/ai/sessions — list sessions
   - GET /api/ai/sessions/[id] — get session with messages
   - DELETE /api/ai/sessions/[id] — delete session
8. Test AI chat message (POST /api/ai/chat):
   - Send a message and get response
   - Note: This may require an AI API key — if not configured, document as expected and test the request/response structure
9. Fix any broken endpoints

## Validation
- User stories:
  - US-1: Artifact read returns content for each type
  - US-2: Artifact write creates/updates with revision increment
  - US-3: Sync push with correct revision succeeds
  - US-4: Sync push with stale revision returns conflict
  - US-5: Sync pull returns latest state
  - US-6: Sync force overwrites artifact
  - US-7: Conflict resolution resolves pending operation
  - US-8: AI session CRUD (create, list, get, delete)
  - US-9: AI chat endpoint accepts messages (structure test)
- Report: `.docs/validation/backend-foundation/phase_4/user-story-report.md`

## Output
- `.adr/history/backend-foundation/phase_4_review.md`
- `.docs/validation/backend-foundation/phase_4/user-story-report.md`
- Updated primary task list (Phase 4 checked off)
