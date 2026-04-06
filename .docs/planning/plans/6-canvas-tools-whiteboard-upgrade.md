# Plan #6 — Canvas Tools + Whiteboard Upgrade

**Date:** 2026-04-06
**Commit:** e94aedc
**Status:** Approved
**Author:** Claude + User

---

## Context

### Schema Planner (done)
Already has from Plan #5: zoom (Ctrl+scroll), pan (middle-click), grid, minimap, toolbar, fit view, keyboard shortcuts. Missing: a dedicated hand/grab tool button in toolbar.

### Whiteboard (needs work)
The whiteboard has 7 tools (select, draw, line, eraser, dot, sticky, media) but is missing critical canvas UX features that every modern whiteboard app has:

| Feature | Status |
|---------|--------|
| Hand/grab pan tool | Missing |
| Zoom controls | Missing |
| Undo/redo | Missing |
| Color picker for drawing | Missing (hardcoded #282828) |
| Line thickness | Missing (hardcoded 3px) |
| Grid/snap toggle | Missing (grid drawn but cosmetic only) |
| Export as image | Missing |
| Keyboard shortcuts | Missing |
| Minimap | Missing |
| Shape tools (rect, circle, arrow) | Missing |

---

## Plan

### Part 1: Schema Planner — Add Hand Tool to Toolbar

Quick addition — schema planner already has pan via middle-click, just needs a visible tool button.

- [ ] Add "hand" tool to schema toolbar that activates pan-on-left-click mode
- [ ] Visual: hand cursor when active, cursor changes to grabbing during pan
- [ ] Toggle: click hand tool → left-click-drag pans canvas (instead of selecting entities)

### Part 2: Whiteboard — Canvas Infrastructure

Add zoom/pan/grid to the whiteboard matching what schema planner has.

- [ ] Add zoom state (0.25–3.0), panX/panY state
- [ ] Wrap canvas in transform group (`scale + translate`)
- [ ] Mouse wheel zoom: Ctrl/Cmd + scroll = zoom centered on cursor
- [ ] Hand/grab tool: new tool in toolbar, left-click-drag to pan
- [ ] Middle-click pan (always available regardless of tool)
- [ ] Zoom controls: [+] [-] [FIT] [100%] bottom-left corner
- [ ] Coordinate conversion for all tools (screen→canvas coords accounting for zoom/pan)
- [ ] Grid snap toggle: elements snap to 20px grid on release

### Part 3: Whiteboard — Drawing Customization

- [ ] Color picker in toolbar: 8 preset colors + custom hex input
  - Presets: #282828 (black), #FF5E54 (watermelon), #2BBF5D (malachite), #A259FF (amethyst), #6C8EBF (cornflower), #FFE459 (lemon), #FF6D28 (orange), #708090 (slate)
- [ ] Line thickness selector: 1px, 2px, 3px (default), 5px, 8px
- [ ] Selected color/thickness applies to: draw, line, dot tools
- [ ] Existing strokes keep their original color/thickness
- [ ] Add `color` and `strokeWidth` fields to DrawPath and Dot types

### Part 4: Whiteboard — Undo/Redo

- [ ] History stack (50 entries max) tracking all state changes
- [ ] Ctrl+Z: undo, Ctrl+Shift+Z / Ctrl+Y: redo
- [ ] Undo/Redo buttons in toolbar
- [ ] Tracks: draw paths, dots, sticky add/move/delete, media add/move/delete

### Part 5: Whiteboard — Additional Tools

- [ ] **Rectangle tool**: click-drag to draw outlined rectangle (color + thickness from picker)
- [ ] **Circle/ellipse tool**: click-drag to draw outlined ellipse
- [ ] **Arrow tool**: click-drag to draw arrow (line with arrowhead)
- [ ] **Text tool**: click to place text, opens inline editor
- [ ] Add these to the TOOLS array with appropriate icons

### Part 6: Whiteboard — Export + Keyboard Shortcuts

- [ ] **Export as PNG**: capture canvas + sticky/media overlays as composite image
- [ ] **Export as SVG**: generate SVG from paths + shapes
- [ ] Export button in toolbar area
- [ ] **Keyboard shortcuts:**
  - `V`: select tool
  - `H`: hand/pan tool
  - `P`: draw (pencil) tool
  - `L`: line tool
  - `R`: rectangle tool
  - `O`: circle tool
  - `A`: arrow tool
  - `T`: text tool
  - `E`: eraser tool
  - `S`: sticky tool
  - `Delete`: delete selected element
  - `Ctrl+Z`: undo
  - `Ctrl+Shift+Z`: redo
  - `+`/`-`: zoom in/out

### Part 7: Whiteboard — Minimap

- [ ] Small overview panel (200x150px) in bottom-right
- [ ] Shows drawing strokes as simplified lines + sticky/media as colored rectangles
- [ ] Viewport indicator (draggable to pan)
- [ ] Only visible when canvas is zoomed/panned

### Part 8: Right-Click Context Menus (Both Pages)

#### Whiteboard Context Menu
- [ ] Right-click on empty canvas: Paste, Add Sticky, Add Media, Select All, Zoom to Fit
- [ ] Right-click on sticky note: Edit, Duplicate, Change Color, Bring to Front, Send to Back, Delete
- [ ] Right-click on media item: View, Duplicate, Bring to Front, Send to Back, Delete
- [ ] Right-click on drawing element: Change Color, Change Thickness, Delete
- [ ] Custom context menu component (replaces browser default via `preventDefault`)

#### Schema Planner Context Menu
- [ ] Right-click on empty canvas: Add Entity, Add Relation, Paste, Auto Layout, Fit View
- [ ] Right-click on entity: Rename, Change Color, Duplicate, Collapse/Expand, Add Field, Delete
- [ ] Right-click on relation line: Edit Relation, Delete Relation
- [ ] Custom context menu component (same component, different items per target)

### Part 9: Testing

- [ ] Playwright: whiteboard zoom in/out via controls
- [ ] Playwright: hand tool pans canvas
- [ ] Playwright: color picker changes draw color
- [ ] Playwright: undo/redo restores/replays actions
- [ ] Playwright: rect/circle/arrow tools create shapes
- [ ] Playwright: keyboard shortcut switches tools
- [ ] Playwright: schema planner hand tool works
- [ ] Screenshots of all new features

---

## ADR Mapping

### `6_whiteboard` — add Phases 6-11

- Phase 6: Canvas infrastructure (zoom, pan, hand tool, grid snap)
- Phase 7: Drawing customization (colors, thickness) + undo/redo
- Phase 8: Additional tools (rect, circle, arrow, text)
- Phase 9: Export + keyboard shortcuts
- Phase 10: Right-click context menus (both whiteboard + schema planner)
- Phase 11: Minimap + testing

### `7_schema-planner` — add to Phases 17+20

- Phase 17: Add hand tool button to toolbar
- Phase 20: Right-click context menu on entities, relations, empty canvas

---

## Answers (Pre-approved)

Per user request: follow FEA procedure, update ADR, implement, validate.
