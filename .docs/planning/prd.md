# Product Requirements Document (PRD)

## 1. Product Summary
A desktop application for idea management and software planning that combines project browsing, kanban workflows, whiteboarding, planning docs, schema modeling, and directory generation in one local-first workspace.

## 2. Problem
Teams and solo builders split work across disconnected tools (notes, boards, diagrams, file explorers). This creates context switching and weak linkage between planning artifacts and actual project folders.

## 3. Target Users
- Solo developers planning and building multiple products.
- Small teams coordinating ideas, tasks, architecture, and deliverables.

## 4. Objectives
- Keep all project assets in real filesystem folders.
- Provide first-class planning interfaces (kanban + whiteboard + docs).
- Keep project metadata centrally readable via `project.json`.
- Add AI assistance without leaving the app.

## 5. Key Features
### 5.1 Project Dashboard (Drive-like)
- Grid/list of projects.
- Search, sort, and filter by tags/status/updated date.
- Create/open/archive project folders.

### 5.2 Project Workspace View
- Left pane: navigable default subfolders and files.
- Right pane: project overview pulled from `project.json`.
- Context-aware actions per folder type (open board, open whiteboard, open planner files).

### 5.3 Kanban
- Columns, cards, labels, priorities, due dates, assignees.
- Drag/drop between columns.
- Persistent board file per project.

### 5.4 Whiteboard
- Infinite canvas.
- Clickable/draggable nodes and containers.
- Resizable containers using corner handles.
- Text blocks and image attachments.
- Linkable nodes.

### 5.5 Ideas List
- Inbox and categorized idea tracking.
- Promote ideas into project tasks or whiteboard nodes.

### 5.6 Schema Planner
- Node-based data modeling.
- Relationship edges and field definitions.
- Export to schema text/templates.

### 5.7 Directory Tree Generator
- Template-driven scaffolding.
- Preview before apply.
- Writes tree specs under project folder.

### 5.8 AI Sidebar
- Embedded CLI bridge for AI-assisted generation/editing.
- Context actions from current project/folder/file.

## 6. Non-Functional Requirements
- Local-first with robust autosave.
- Cross-platform Electron app.
- Fast startup and smooth board/canvas interactions.
- Recovery from crashes with snapshot history.

## 7. Out of Scope (Initial MVP)
- Multi-tenant cloud collaboration.
- Real-time multi-user editing.
- Mobile app.

## 8. Success Metrics
- Time from new project to first actionable board < 3 minutes.
- 90%+ of user planning artifacts remain linked to project folders.
- High repeat usage of dashboard, kanban, and whiteboard in weekly workflows.
