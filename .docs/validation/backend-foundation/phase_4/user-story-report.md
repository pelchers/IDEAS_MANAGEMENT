# Phase 4 User Story Report: Artifact + Sync + AI Endpoints

Session: backend-foundation
Phase: 4
Date: 2026-03-08
Server: localhost:3000
Auth: admin@ideamgmt.local (ADMIN role)

---

## Test Project

- **Name:** Phase4 Test Project
- **ID:** cmmh8uwz0003ujdlwqzf1f4ml
- **Default artifacts:** 7 (project.json, kanban/board.json, whiteboard/board.json, schema/schema.graph.json, directory-tree/tree.plan.json, ideas/ideas.json, ai/chats/default.ndjson)

---

## Results

| User Story | Description | Result | Notes |
|-----------|-------------|--------|-------|
| US-1 | Artifact read returns content for each type | PASS | All 5 artifact types (kanban, ideas, whiteboard, schema, directory-tree) returned correct content and structure |
| US-2 | Artifact write creates/updates with revision increment | PASS | Revision incremented from 1->2->3 on successive kanban updates; new nested path kanban/custom/board1 created at revision 1 |
| US-3 | Sync push with correct revision succeeds | PASS | op-001 pushed to ideas/ideas.json with baseRevision=1 (matching current), applied successfully |
| US-4 | Sync push with stale revision returns conflict | PASS | op-002 pushed to kanban/board.json with baseRevision=1 (current=3), returned in conflicts array with current artifact content |
| US-5 | Sync pull returns latest state | PASS | Returns applied operations, all 8 artifact states, and 1 pending conflict (op-002) |
| US-6 | Sync force overwrites artifact | PASS | Force-pushed whiteboard with new node content, revision incremented to 2 |
| US-7 | Conflict resolution resolves pending operation | PASS | Resolved op-002 with "keep-local", kanban revision incremented to 4, operation status changed to "resolved" |
| US-8 | AI session CRUD (create, list, get, delete) | PASS | Create returns 201 with session data; list includes messageCount; get returns messages array; delete returns ok:true, subsequent get returns 404 |
| US-9 | AI chat endpoint accepts messages (structure test) | PASS | Validation works (empty/missing messages -> 400); with placeholder API key -> 503 with clear error message (after fix); session auto-created on chat |

**Total: 9/9 PASS**

---

## Additional Tests

### Auto-merge (append-only artifacts)
- Pushed op-003 to ideas/ideas.json with stale baseRevision=1 (current=2)
- Because ideas is an append-only artifact path, auto-merge triggered
- Both idea1 (server) and idea2 (client) present in merged result
- Revision incremented to 3

### Artifact catch-all route
- Created nested artifact at kanban/custom/board1 via PUT
- Read it back via GET with matching path segments
- Revision correctly set to 1 for new artifact

---

## Fixes Applied

### 1. AI Chat endpoint error handling (route.ts)
**Problem:** When OPENAI_API_KEY is missing or invalid (placeholder "sk-..."), the `streamText()` call threw an unhandled error, resulting in a raw HTTP 500 with empty body.

**Fix:** Added two safeguards:
1. Pre-flight check: if `OPENAI_API_KEY` is missing or is the placeholder value "sk-...", return HTTP 503 with `ai_not_configured` error and a clear message.
2. Try/catch around `streamText()` and `convertToModelMessages()`: catches any runtime errors (bad API key, network issues, invalid message format) and returns structured JSON error responses (502 for stream errors, 400 for message format errors).

**File:** `apps/web/src/app/api/ai/chat/route.ts`

---

## Endpoint Summary

### Artifact Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| /api/projects/[id]/artifacts | GET | Working |
| /api/projects/[id]/artifacts/[...path] | GET | Working |
| /api/projects/[id]/artifacts/[...path] | PUT | Working |

### Sync Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| /api/sync/push | POST | Working |
| /api/sync/pull/[projectId] | GET | Working |
| /api/sync/force | POST | Working |
| /api/sync/resolve/[operationId] | POST | Working |

### AI Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| /api/ai/sessions | GET | Working |
| /api/ai/sessions | POST | Working |
| /api/ai/sessions/[id] | GET | Working |
| /api/ai/sessions/[id] | DELETE | Working |
| /api/ai/chat | POST | Working (503 when API key not configured) |
