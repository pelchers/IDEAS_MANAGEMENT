# Phase Plan

Phase: phase_6
Session: app_build_v1
Date: 2026-03-05
Owner: longrunning-worker-subagent
Status: complete

## Objectives
- Build Ideas list UI with CRUD, tagging, categorization, and sync to project artifacts.
- Build Kanban board UI with columns, cards, drag/drop, labels, priorities, and sync.
- Build Whiteboard with infinite canvas, draggable/resizable containers, text/image blocks.
- Build Schema planner with node/edge graph, field definitions, and export.
- Build Directory tree generator with preview and apply.
- All features persist via project artifact API (Phase 5) with sync.

## Task checklist
- [x] Ideas List UI (/projects/[id]/ideas):
  - [x] Display ideas from project artifact (ideas/ideas.json).
  - [x] Add idea form (title, description, tags, priority, category).
  - [x] Edit idea inline or via modal.
  - [x] Delete idea with confirmation.
  - [x] Tag filter and search.
  - [x] Promote idea to kanban card.
  - [x] Persist changes via PUT /api/projects/[id]/artifacts/ideas/ideas.json.
- [x] Kanban Board UI (/projects/[id]/kanban):
  - [x] Display board from project artifact (kanban/board.json).
  - [x] Default columns: Backlog, To Do, In Progress, Review, Done.
  - [x] Card display: title, description, labels, priority, due date, assignee.
  - [x] Add/edit/delete cards.
  - [x] Drag and drop cards between columns (HTML5 drag API or library).
  - [x] Add/rename/delete/reorder columns.
  - [x] Card detail modal with full editing.
  - [x] Persist changes via artifact API.
- [x] Whiteboard UI (/projects/[id]/whiteboard):
  - [x] Infinite canvas with pan and zoom.
  - [x] Add containers (rectangles) with drag, resize (corner handles), move.
  - [x] Text blocks inside containers (editable).
  - [x] Image attachment support (URL-based for now).
  - [x] Node linking (draw edges between containers).
  - [x] Grouping/ungrouping containers.
  - [x] Canvas toolbar: add container, add text, zoom controls, reset view.
  - [x] Persist via artifact API (whiteboard/board.json).
- [x] Schema Planner UI (/projects/[id]/schema):
  - [x] Node-based graph (each node = a data entity/table).
  - [x] Node editor: name, fields list (name, type, constraints).
  - [x] Edge drawing between nodes (relationships: 1:1, 1:N, N:N).
  - [x] Add/edit/remove nodes and edges.
  - [x] Export to JSON (schema.graph.json artifact).
  - [x] Export to SQL DDL or TypeScript types (stretch).
  - [x] Persist via artifact API.
- [x] Directory Tree Generator UI (/projects/[id]/directory-tree):
  - [x] Tree viewer showing planned directory structure from tree.plan.json.
  - [x] Add/remove/rename nodes in tree editor.
  - [x] Preview panel showing full tree structure.
  - [x] Apply button — generates/writes directory structure plan to artifact.
  - [x] Template selector for common project structures.
  - [x] Persist via artifact API.
- [x] Add Zod schemas to packages/schemas for:
  - [x] ideas.json (IdeaSchema, IdeasListSchema)
  - [x] kanban/board.json (KanbanBoardSchema, KanbanCardSchema, KanbanColumnSchema)
  - [x] whiteboard/board.json (WhiteboardSchema, ContainerSchema, EdgeSchema)
  - [x] schema.graph.json (SchemaGraphSchema, SchemaNodeSchema, SchemaEdgeSchema)
- [x] Workspace navigation integration:
  - [x] Update /projects/[id] workspace view to link to all 5 sub-views.
  - [x] Breadcrumb navigation between workspace and sub-views.
- [x] Add tests for:
  - [x] Zod schema validation (ideas, kanban, whiteboard, schema graph).
  - [x] Ideas CRUD operations (add, edit, delete, tag filter).
  - [x] Kanban operations (add card, move card, column management).
- [x] Validation screenshots in `.docs/validation/phase_6/`:
  - [x] Ideas list (desktop + mobile).
  - [x] Kanban board with cards (desktop + mobile).
  - [x] Whiteboard with containers (desktop + mobile).
  - [x] Schema planner with nodes (desktop + mobile).
  - [x] Directory tree generator (desktop + mobile).

## Deliverables
- Ideas list UI with CRUD, tagging, and sync.
- Kanban board UI with drag/drop columns and cards.
- Whiteboard with infinite canvas, containers, text, edges.
- Schema planner with nodes, edges, field definitions.
- Directory tree generator with preview and apply.
- Zod schemas for all artifact types.
- Updated workspace navigation.
- Tests passing.
- Validation screenshots (PNG).

## Validation checklist
- [x] All tasks complete
- [x] pnpm typecheck passes
- [x] pnpm test passes (web)
- [x] Ideas CRUD works and persists
- [x] Kanban drag/drop works and persists
- [x] Whiteboard canvas renders with containers
- [x] Schema planner nodes/edges render
- [x] Directory tree displays and edits
- [x] All 5 views accessible from workspace
- [x] Phase file ready to move to history
- [x] Phase review file created in history
- [x] Changes committed and pushed

## Risks / blockers
- Drag/drop and canvas interactions are complex — keep MVP-focused.
- Whiteboard infinite canvas may need a canvas library (konva, fabric.js) or can be done with CSS transforms.
- Image attachments require object storage (defer actual upload to Phase 7, use URL refs for now).

## Notes
- Requirements: `.docs/planning/prd.md` sections 5.6-5.10.
- Project artifacts API from Phase 5: PUT/GET `/api/projects/[id]/artifacts/[...path]`.
- Phase 4 AI tool actions (add_idea, update_kanban) should work with the same artifact format.
- Keep canvas/whiteboard implementation simple — CSS transform-based pan/zoom is sufficient for MVP.
- Use HTML5 drag/drop API for kanban (no external library needed for MVP).
- Validation screenshots must be PNG (use Playwright to capture from HTML if needed).
