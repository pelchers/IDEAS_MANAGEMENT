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

## Phase 3 — Kanban Backend + Integration (Deferred)

- [ ] Verify existing artifact API route for kanban board data (GET/PUT /api/projects/[id]/artifacts/kanban/board)
- [ ] Wire kanban frontend to artifact API with { content: data } envelope
- [ ] Implement debounced auto-save on column/card changes
- [ ] Handle loading states and error states with neo-brutalist styling
- [ ] Test drag-drop persistence: drag card → refresh → card stays in new column
- [ ] Add column management (add/rename/delete columns)
- [ ] Add card CRUD (add/edit/delete cards within columns)
- [ ] Card detail modal (500px max width) with full card editing
- [ ] User story validation: create card, drag between columns, edit card, delete card
