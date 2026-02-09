# Technical Specification

## 1. Proposed Stack
- Runtime: Electron
- Frontend: React + TypeScript
- State: Zustand (or Redux Toolkit)
- Storage:
  - File-based project assets (JSON/Markdown/images)
  - Indexed metadata DB (SQLite) for global search/dashboard speed
- Canvas engines:
  - Whiteboard: custom canvas layer (or React Flow + custom container nodes)
  - Schema planner: node graph layer sharing whiteboard primitives

## 2. High-Level Architecture
- Main process:
  - Filesystem access
  - Native dialogs
  - CLI process bridge (pty)
- Renderer process:
  - UI, board/canvas interactions, dashboards
- Shared domain layer:
  - Project model
  - File mappers
  - Validation/parsing

## 3. Project File Contract
Each project is a root directory with fixed subfolders and a `project.json` metadata file.

Minimum recommended structure:
- `project.json`
- `planning/`
- `kanban/board.json`
- `whiteboard/board.json`
- `schema/schema.graph.json`
- `directory-tree/tree.plan.json`
- `ideas/ideas.json`

## 4. UI Routes
- `/` dashboard (project browser)
- `/project/:projectId` project overview split pane
- `/project/:projectId/kanban`
- `/project/:projectId/whiteboard`
- `/project/:projectId/schema`
- `/project/:projectId/ideas`
- `/project/:projectId/planning`
- `/project/:projectId/directory-tree`

## 5. AI CLI Integration
- Sidebar console in renderer.
- IPC to main process for command execution.
- Streaming stdout/stderr back to UI.
- Allow project-scoped context passing.
- Command allowlist and explicit confirmation for risky actions.

## 6. Data Safety
- Autosave intervals + debounced writes.
- Snapshot backups per artifact type.
- JSON schema validation before write.
- Corruption fallback using last-good snapshot.

## 7. Performance Targets
- Dashboard first paint < 1.5s for 100 projects.
- Board operations remain < 16ms per frame for common interactions.
- Search query response < 200ms with indexed metadata.
