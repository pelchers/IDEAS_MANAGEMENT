# Primary Task List — 5_kanban-board

Session: Kanban Board
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (kanban view)

---

## Phase 1 — Kanban Frontend from Pass-1

- [ ] Read pass-1 kanban section from index.html, style.css, and app.js
- [ ] Build kanban page matching pass-1 exactly:
  - 4 columns: Backlog (watermelon header), To Do (lemon header), In Progress (cornflower header), Done (malachite header)
  - Column headers with card count badges
  - Cards with title, description snippet, colored tags (feature/bug/urgent)
  - SortableJS drag-and-drop between columns with 200ms animation
  - Ghost/chosen/drag CSS classes matching pass-1
  - Dynamic card count update on drop
- [ ] Add column management (add/rename/delete columns)
- [ ] Add card CRUD (add/edit/delete cards within columns)
- [ ] Card detail modal (500px max width) with full card editing

## Phase 2 — Kanban Backend + Integration

- [ ] Verify existing artifact API route for kanban board data (GET/PUT /api/projects/[id]/artifacts/kanban/board)
- [ ] Wire kanban frontend to artifact API with { content: data } envelope
- [ ] Implement debounced auto-save on column/card changes
- [ ] Handle loading states and error states with neo-brutalist styling
- [ ] Test drag-drop persistence: drag card → refresh → card stays in new column

## Phase 3 — Kanban Testing

- [ ] Playwright screenshots of kanban board (desktop + mobile)
- [ ] User story validation: create card, drag between columns, edit card, delete card
- [ ] Verify SortableJS interactions work correctly
- [ ] Compare screenshots against pass-1 kanban validation PNGs
