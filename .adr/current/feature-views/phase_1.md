# Phase 1: Kanban Board

Session: feature-views
Phase: 1
Date: 2026-03-08

## Prior Session Summary
frontend-shell session complete: Design system (3045 lines), app shell with (authenticated) route group, auth pages, dashboard all built. All wired to live API. backend-foundation session complete: All 25 API endpoints validated.

## Objective
Build the kanban board view matching pass-1 concept. Wire to artifact CRUD endpoints.

## Tasks
1. Build kanban page at `apps/web/src/app/(authenticated)/projects/[id]/kanban/page.tsx`
2. Kanban layout: columns in horizontal scroll, cards within columns
3. Each column: title, card count, add card button
4. Each card: title, description (truncated), priority indicator, assignee
5. Drag-and-drop: implement card movement between columns (use HTML5 drag API or a lightweight approach)
6. Column operations: add column, rename column, reorder columns
7. Card operations: create, edit, delete cards
8. Wire to GET/PUT /api/projects/[id]/artifacts?type=kanban for persistence
9. Load kanban data on mount, save on changes
10. Empty state for new projects with no kanban data
11. Match pass-1 neo-brutalism styling (brutalist cards, black borders, hard shadows)

## Validation
- Kanban renders with columns and cards
- CRUD operations persist via API
- Drag-and-drop moves cards
- Report: `.docs/validation/feature-views/phase_1/user-story-report.md`

> **ACCURACY NOTE (2026-03-12):** Tasks 6 (column operations: add, rename, reorder) and 7 (card operations: create, edit, delete) were marked complete but are actually non-functional. Drag-and-drop between columns and save to artifact API work, but there is no UI for adding, editing, or deleting individual cards or columns. Corrected in Phase B Tier 1 remediation.

## Output
- Kanban page component
- `.adr/history/feature-views/phase_1_review.md`
- `.docs/validation/feature-views/phase_1/user-story-report.md`
- Updated primary task list
