# Primary Task List — 5_kanban-board

Session: Kanban Board
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (kanban view)

---

## Phase 1 — Kanban Frontend from Pass-1 ✅

- [x] Read pass-1 kanban section from index.html, style.css, and app.js
- [x] Build kanban page matching pass-1 exactly:
  - 4 columns: Backlog, To Do (watermelon header), In Progress (malachite header), Done (signal-black header)
  - Column headers with card count badges
  - Cards with title, colored tags (feature/bug/urgent)
  - SortableJS drag-and-drop between columns with 200ms animation
  - Ghost/chosen/drag CSS classes matching pass-1
  - Dynamic card count update on drop
- [ ] Add column management (add/rename/delete columns) — deferred to backend integration
- [ ] Add card CRUD (add/edit/delete cards within columns) — deferred to backend integration
- [ ] Card detail modal (500px max width) with full card editing — deferred to backend integration

## Phase 2 — Screenshots ✅

- [x] Playwright screenshots of kanban board (desktop 1536x960 + mobile 390x844)
- [x] Screenshots saved to `.docs/validation/5_kanban-board/screenshots/`
- [x] Visual verification: 4-column layout, card tags, responsive stacking confirmed

## Phase 3 — Kanban Backend + Integration (Partially Done)

- [x] Verify existing artifact API route for kanban board data (GET/PUT /api/projects/[id]/artifacts/kanban/board)
- [x] Wire kanban frontend to artifact API with { content: data } envelope
- [x] Implement debounced auto-save on column/card changes
- [ ] Handle loading states and error states with neo-brutalist styling
- [ ] Test drag-drop persistence: drag card -> refresh -> card stays in new column
- [ ] Add column management (add/rename/delete columns)
- [x] Add card CRUD (add/edit/delete cards within columns)
- [x] Card detail modal (480px max width) with full card editing
- [x] Card settings button on hover (bottom-right) with color picker
- [x] Card text auto-adjusts black/white based on background color
- [x] Card description field (multi-line, shown in edit modal and truncated on card)
- [x] Card links field (array of URLs, editable in edit modal, shown as link count badge on card)
- [x] Auto-open edit modal after creating a new card (so user can add details)
- [x] Fix card action icons (X, settings) — stacked vertically in top-right, no overlap with content
- [x] Track createdAt and modifiedAt timestamps on cards (display in edit modal)
- [x] Fix SortableJS drag-and-drop (DOM revert pattern — SortableJS detects drag, React does DOM update)
- [ ] User story validation: create card, drag between columns, edit card, delete card
