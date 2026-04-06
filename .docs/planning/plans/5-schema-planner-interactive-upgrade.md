# Plan #5 — Schema Planner Interactive Upgrade

**Date:** 2026-04-06
**Commit:** 8205e05
**Status:** Completed
**Author:** Claude + User

---

## Context

### What exists now
The schema planner is a ~3000-line monolithic component (`projects/[id]/schema/page.tsx`) with:
- Absolute-positioned entity cards (280px fixed width) on a scrollable canvas
- Rough.js hand-drawn SVG relation lines with circle endpoints
- 40+ modal types for all CRUD operations (add entity, add field, edit field, etc.)
- Full PostgreSQL DDL support (50+ field types, views, functions, triggers, RLS, roles, enums, domains)
- Drag entities by header only
- Import from GitHub/local files, export to Prisma/SQL/JSON
- PK/FK/UQ/IDX/AUTO badges on fields
- 800ms debounced auto-save to artifact API

### What's missing (vs industry gold standard)
Competitor analysis of Basedash, dbdiagram.io, DrawSQL, ERDPlus, ChartDB, and Prisma Editor reveals these gaps:

| Feature | Our Tool | DrawSQL | dbdiagram.io | ChartDB |
|---------|----------|---------|-------------|---------|
| Zoom + Pan | No | Yes | Yes | Yes |
| Crow's foot notation | No (circles) | Yes | Yes | No |
| Inline editing | No (modals only) | Yes (side panel) | No (code only) | Yes |
| Side panel for selected entity | No | Yes | No | Yes |
| Table header colors | No | Yes (12 colors) | No | Yes |
| Search/filter entities | No | No | No | Yes |
| Auto-layout algorithm | Basic (3-col grid) | Yes | Yes | Yes |
| Minimap/overview | No | No | No | Yes |
| Drag from anywhere on card | No (header only) | Yes | Yes | Yes |
| Table grouping/regions | No | Yes | No | Yes |
| Grid snap | No | Yes | No | Yes |

### Goal
Transform the schema planner from a "button-and-modal CRUD tool" into a **visual-first interactive ERD editor** that matches or exceeds tools like DrawSQL, while keeping our brutalist design language and full PostgreSQL feature set.

---

## Plan

### Part 1: Canvas Infrastructure (Zoom + Pan + Grid)

The foundation — transform the static scrollable div into a proper infinite canvas.

- [ ] Add `zoom` (scale: 0.25–3.0) and `pan` (translateX, translateY) state
- [ ] Wrap all canvas children in a `<div style={{ transform: `scale(${zoom}) translate(${panX}px, ${panY}px)` }}>` transform group
- [ ] Mouse wheel zoom: Ctrl/Cmd + scroll = zoom in/out, centered on cursor position
- [ ] Pan: middle-click drag or Space+left-click drag to pan the canvas
- [ ] Trackpad: pinch-to-zoom, two-finger pan
- [ ] Zoom controls UI: [+] [-] [Fit] [100%] buttons in bottom-left corner
- [ ] Grid background: subtle dot grid that scales with zoom (CSS `background-image: radial-gradient`)
- [ ] Grid snap: entities snap to nearest 20px grid point on drag release (optional toggle)
- [ ] Canvas coordinates: all mouse events convert screen coords to canvas coords via `(screenX - panX) / zoom`

### Part 2: Entity Card Improvements

Make cards more interactive and visually informative.

- [ ] **Drag from anywhere** — move mousedown handler from header-only to entire card (exclude field action buttons)
- [ ] **Resizable card width** — drag right edge to widen/narrow (min 220px, max 500px), persist width per entity
- [ ] **Color-coded headers** — add `headerColor` to SchemaEntity interface, 8 color presets (signal-black default, watermelon, malachite, cornflower, amethyst, lemon, orange, slate), selectable via right-click context menu or header click
- [ ] **Collapsed/expanded toggle** — click chevron to collapse entity to header-only (show field count badge), useful for large schemas
- [ ] **Field reordering** — drag fields within an entity to reorder (SortableJS or native drag)
- [ ] **Field type inline edit** — double-click a field name or type to edit inline (contentEditable or input overlay), Enter to save, Escape to cancel
- [ ] **Visual FK indicators** — FK fields show a small arrow icon pointing to the referenced entity, colored to match the relation line

### Part 3: Relation Lines Upgrade (Crow's Foot Notation)

Replace Rough.js circles with proper ERD cardinality symbols.

- [ ] **Crow's foot markers** — SVG markers at line endpoints:
  - One (|): single perpendicular line
  - Many (>): three-pronged fork (crow's foot)
  - Zero (O): open circle
  - Combinations: `||--||` (one-to-one), `||--|<` (one-to-many), `>|--|<` (many-to-many)
- [ ] **Smooth curved paths** — replace straight Rough.js lines with SVG cubic bezier curves that route around overlapping entities
- [ ] **Relation labels** — show FK field name on the line (not just 1:N type), positioned at midpoint with white background pill
- [ ] **Clickable relations** — click a relation line to select it, show edit/delete actions
- [ ] **Highlighted path** — hover over an entity highlights all its relations (others dim to 20% opacity)
- [ ] **Color per relation** — keep rotating color palette but let users override per relation
- [ ] **Optional Rough.js mode** — toggle between clean SVG lines (default) and hand-drawn Rough.js (brutalist mode) via toolbar button

### Part 4: Side Panel (Selected Entity Detail View)

Replace modal-heavy workflow with a persistent side panel for editing.

- [ ] **Right-side slide-out panel** — 380px wide, appears when an entity is selected (clicked)
- [ ] **Panel sections:**
  - Entity name (editable inline)
  - Header color selector (row of color swatches)
  - Schema namespace selector
  - Comment field
  - Fields list (full detail: name, type, all constraints, editable inline)
  - Add field button at bottom
  - Relations list (from/to this entity)
  - Advanced: composite PK, composite unique, RLS toggle, unlogged toggle
- [ ] **Field editing** — click any field in the panel to expand its full property form (same data as current modal, but inline in the panel)
- [ ] **Quick-add field** — type field name + tab + type + enter to rapidly add fields (keyboard-driven)
- [ ] **Panel closes** — click away from entity or press Escape
- [ ] **Panel coexists with modals** — advanced operations (import, export, add relation across entities) still use modals

### Part 5: Search, Filter, and Minimap

Navigation tools for larger schemas.

- [ ] **Search bar** — top of canvas, filters entities by name as you type (non-matching entities dim to 30% opacity, matching ones highlight)
- [ ] **Filter chips** — filter by: has relations, has FK, has triggers, has RLS, by schema namespace
- [ ] **Minimap** — bottom-right corner, 200x150px overview showing all entities as tiny rectangles with a viewport indicator (draggable to pan)
- [ ] **Entity count badge** — "12 entities, 47 fields, 8 relations" summary in toolbar
- [ ] **Jump to entity** — search result click centers the canvas on that entity with smooth animation

### Part 6: Auto-Layout Algorithm

Better automatic arrangement than the current 3-column grid.

- [ ] **Dagre-style layered layout** — group entities by relationship depth (root entities at top, dependent entities below)
- [ ] **Minimize line crossings** — position entities to reduce overlapping relation lines
- [ ] **Respect groups** — entities in the same schema namespace cluster together
- [ ] **Layout button** — "Auto Layout" in toolbar, with confirmation since it resets positions
- [ ] **Layout animation** — entities animate smoothly to new positions (300ms transition)

### Part 7: Toolbar and UX Polish

- [ ] **Floating toolbar** — top of canvas area:
  - [Add Entity] [Add Relation] [Add Enum] — primary actions
  - [Auto Layout] [Fit View] — layout controls
  - [Search...] — inline search input
  - [Grid: ON/OFF] [Snap: ON/OFF] [Lines: Clean/Rough] — toggles
  - [Import] [Export] — file operations
- [ ] **Context menu** — right-click entity for quick actions: rename, change color, duplicate, delete, collapse
- [ ] **Keyboard shortcuts:**
  - `Delete` / `Backspace`: delete selected entity
  - `Ctrl+D`: duplicate selected entity
  - `Ctrl+F`: focus search
  - `Ctrl+A`: select all entities
  - `Escape`: deselect / close panel
  - `+` / `-`: zoom in/out
  - `0`: reset zoom to 100%
  - `F`: fit all entities in view
- [ ] **Undo/Redo** — Ctrl+Z / Ctrl+Shift+Z with 50-step history stack

### Part 8: Component Extraction (Refactor)

Break the 3000-line monolith into manageable pieces.

- [ ] Extract `SchemaCanvas.tsx` — zoom/pan/grid container
- [ ] Extract `EntityCard.tsx` — single entity card rendering
- [ ] Extract `FieldRow.tsx` — single field display with inline edit
- [ ] Extract `RelationLines.tsx` — SVG relation rendering
- [ ] Extract `EntitySidePanel.tsx` — detail panel
- [ ] Extract `SchemaToolbar.tsx` — toolbar with all controls
- [ ] Extract `SchemaMinimap.tsx` — minimap component
- [ ] Extract `SchemaModals.tsx` — remaining modal forms
- [ ] Extract `useSchemaGraph.ts` — hook for graph state, undo/redo, auto-save
- [ ] Keep `page.tsx` as thin orchestrator (~200 lines max)

### Part 9: Testing

- [ ] Playwright: zoom in/out via toolbar buttons, verify scale changes
- [ ] Playwright: drag entity to new position, verify position persists
- [ ] Playwright: inline edit field name, verify save
- [ ] Playwright: side panel opens on entity click, shows correct fields
- [ ] Playwright: search filters entities correctly
- [ ] Playwright: auto-layout rearranges entities
- [ ] Playwright: crow's foot notation renders for 1:N relation
- [ ] Playwright: minimap shows all entities
- [ ] Playwright: color-coded headers render correctly
- [ ] Screenshots: desktop full schema, zoomed view, side panel open, minimap visible

---

## Execution Order (Recommended)

| Phase | Part | Why this order |
|-------|------|---------------|
| 1 | Part 8 (Refactor) | Must decompose monolith before adding features, otherwise 3000 lines becomes 6000 |
| 2 | Part 1 (Canvas) | Foundation for everything else — zoom/pan required before minimap, search centering |
| 3 | Part 2 (Cards) | Core visual upgrade — drag-anywhere, colors, collapse, inline edit |
| 4 | Part 3 (Relations) | Crow's foot notation is the most visible quality signal |
| 5 | Part 4 (Side Panel) | Replaces modal-heavy workflow, biggest UX improvement |
| 6 | Part 5 (Search/Minimap) | Navigation for larger schemas |
| 7 | Part 6 (Auto-Layout) | Nice-to-have once entities are properly positionable |
| 8 | Part 7 (Toolbar/UX) | Polish layer — keyboard shortcuts, context menu, undo/redo |
| 9 | Part 9 (Testing) | Full validation pass |

---

## ADR Mapping

Updates to existing `7_schema-planner` subfolder — add new phases:

**Phase 6 — Canvas Infrastructure (Zoom + Pan + Grid)**
**Phase 7 — Entity Card Improvements (Drag, Colors, Inline Edit)**
**Phase 8 — Crow's Foot Relation Lines**
**Phase 9 — Side Panel Detail View**
**Phase 10 — Search, Filter, Minimap**
**Phase 11 — Auto-Layout Algorithm**
**Phase 12 — Toolbar + UX Polish + Undo/Redo**
**Phase 13 — Component Extraction (Refactor)**
**Phase 14 — Testing + Validation**

Note: Phase 13 (refactor) should execute FIRST despite being numbered last — the numbering follows the existing ADR convention where earlier phases are already complete.

---

## Competitor Feature Comparison (Verified via Web Research)

| Feature | Ours (Current) | Ours (After Plan 5) | DrawSQL | dbdiagram.io | ChartDB |
|---------|---------------|---------------------|---------|-------------|---------|
| Zoom + Pan | No | Yes | Yes | Yes | Yes |
| Crow's foot | No | Yes | Yes | Yes | No |
| Inline editing | No | Yes (field + panel) | Yes (panel) | No | Yes |
| Side panel | No | Yes | Yes | No | Yes |
| Table colors | No | Yes (8 colors) | Yes (12) | No | Yes |
| Search/filter | No | Yes | No | No | Yes |
| Minimap | No | Yes | No | No | Yes |
| Auto-layout | Basic | Dagre-style | Yes | Yes | Yes |
| Drag anywhere | No | Yes | Yes | Yes | Yes |
| Table groups | No | Future | Yes | No | Yes |
| Grid snap | No | Yes | Yes | No | No |
| Undo/redo | No | Yes | Unknown | No | Unknown |
| PostgreSQL DDL | Full | Full | Partial | Partial | Yes |
| Import Prisma/TS/SQL | Yes | Yes | No | SQL only | SQL only |
| Export Prisma/SQL/JSON | Yes | Yes | SQL/PNG | SQL/PDF/PNG | SQL/PNG |
| AI tools integration | Yes (8 tools) | Yes | Paid add-on | No | Yes |
| Brutalist design | Yes | Yes | No | No | No |

**After Plan 5, we match or exceed every competitor on features while maintaining our unique brutalist design language and full PostgreSQL DDL support that no competitor offers.**

---

## Answers (Confirmed 2026-04-06)

1. **Refactor first?** YES — extract components before adding features (my recommendation, user approved)
2. **Rough.js:** Keep as toggle — "Brutalist mode" (Rough.js) vs "Clean mode" (smooth SVG). Default to clean.
3. **Side panel vs modals:** Coexist — panel for common entity/field editing, modals for advanced ops (import, export, bulk operations)
4. **Scope:** ALL 9 parts — no deferral. Also add AI tool updates for new schema features.

## Additional: AI Tools for New Features

The existing `update_schema_artifact` AI tool needs expansion to support the new visual features:

- [ ] Add `set_entity_color` action — AI can suggest color groupings ("color all auth tables red")
- [ ] Add `set_entity_position` action — AI can arrange entities ("put User at top center")
- [ ] Add `collapse_entity` / `expand_entity` actions — AI can focus the view
- [ ] Add `auto_layout` action — AI can trigger layout optimization
- [ ] Update tool descriptions so AI knows about new capabilities
