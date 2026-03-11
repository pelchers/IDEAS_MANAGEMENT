# Primary Task List — 6_whiteboard

Session: Whiteboard
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (whiteboard view)

---

## Phase 1 — Whiteboard Frontend from Pass-1

- [x] Read pass-1 whiteboard section from index.html, style.css, and app.js
- [x] Build whiteboard page matching pass-1 exactly:
  - HTML5 canvas with grid background (30px spacing)
  - Drawing toolbar: Select, Draw, Rect, Text, Sticky tools
  - Freehand drawing mode with crosshair cursor, 3px line width
  - Sticky notes in 4 colors (lemon, watermelon, malachite, amethyst)
  - Sticky note dragging with z-index manipulation and rotation during drag
- [x] Canvas resize handling (responsive to window size)
- [x] Tool selection state management

## Phase 1 — Screenshots

- [x] Playwright screenshots (desktop + mobile)
- [x] Screenshots saved to `.docs/validation/6_whiteboard/screenshots/`

## Phase 2 — Whiteboard Backend + Integration

- [ ] Wire whiteboard to artifact API (GET/PUT /api/projects/[id]/artifacts/whiteboard/board)
- [ ] Serialize canvas state (drawings, sticky notes, positions) to JSON
- [ ] Implement auto-save on changes
- [ ] Handle loading/error states

## Phase 3 — Whiteboard Testing

- [ ] User story validation: draw on canvas, add sticky note, drag sticky note, switch tools
- [ ] Compare against pass-1 whiteboard validation PNGs
