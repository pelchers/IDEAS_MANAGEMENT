# Primary Task List

Session: feature-views
Date: 2026-03-07

Sources:
- `.docs/planning/prd.md`
- `.docs/planning/concepts/brutalism-neobrutalism/pass-1/`
- `.docs/planning/technical-specification.md`

Legend: `[ ]` pending, `[x]` done, `[~]` in progress.

---

## Phase 1: Kanban Board
- [x] Build kanban view matching pass-1 concept (columns, cards, drag-drop zones)
- [x] Wire to artifact CRUD endpoints (GET/PUT /api/projects/[id]/artifacts?type=kanban)
- [x] Implement drag-and-drop card movement
- [x] Add card create/edit/delete
- [x] Add column create/rename/reorder
- [x] Test with empty board, single column, and full board states

## Phase 2: Ideas Capture
- [x] Build ideas view matching pass-1 concept (idea cards, categories, quick-add)
- [x] Wire to artifact CRUD endpoints (type=ideas)
- [x] Implement idea create/edit/delete
- [x] Add category filtering and search
- [x] Add priority/status indicators
- [x] Test with 0, 1, and 20+ ideas

## Phase 3: Whiteboard
- [x] Build whiteboard view matching pass-1 concept (canvas, toolbar, shapes)
- [x] Wire to artifact CRUD endpoints (type=whiteboard)
- [x] Implement basic drawing tools (shapes, text, connectors)
- [x] Add pan/zoom controls
- [x] Implement save/load whiteboard state
- [x] Test canvas rendering and interaction

## Phase 4: Schema Planner
- [x] Build schema planner view matching pass-1 concept (entity cards, relationships)
- [x] Wire to artifact CRUD endpoints (type=schema)
- [x] Implement entity create/edit/delete with fields
- [x] Add relationship lines between entities
- [x] Add field type selection and validation rules
- [x] Test with empty schema and 5+ entity schema

## Phase 5: Directory Tree
- [x] Build directory tree view matching pass-1 concept (tree structure, file icons)
- [x] Wire to artifact CRUD endpoints (type=directory-tree)
- [x] Implement node create/rename/delete/move
- [x] Add file/folder type indicators
- [x] Add expand/collapse tree nodes
- [x] Test with empty tree and deep nested structure

## Phase 6: AI Chat
- [ ] Build AI chat view matching pass-1 concept (message list, input, tool actions)
- [ ] Wire to AI chat session CRUD endpoints
- [ ] Wire to AI message send/receive endpoints
- [ ] Implement streaming message display
- [ ] Add tool action buttons (add_idea, update_kanban, etc.)
- [ ] Test conversation flow and tool actions

## Phase 7: Settings + Conflicts
- [x] Build settings view matching pass-1 concept (profile, preferences, billing)
- [x] Build conflicts view matching pass-1 concept (diff display, resolve actions)
- [x] Wire settings to user profile endpoints
- [x] Wire conflicts to sync conflict resolution endpoints
- [x] Add Stripe billing portal link
- [x] Test settings save and conflict resolution flow
