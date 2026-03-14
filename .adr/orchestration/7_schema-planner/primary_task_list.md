# Primary Task List — 7_schema-planner

Session: Schema Planner
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (schema view)

---

## Phase 1 — Schema Frontend from Pass-1 ✅

- [x] Read pass-1 schema section from index.html, style.css, and app.js
- [x] Build schema planner page matching pass-1 exactly:
  - Entity cards with thick black borders
  - Field rows with type badges (PK, FK, UQ, VARCHAR, INT, etc.)
  - IBM Plex Mono for field names and types
  - Rough.js hand-drawn relation lines connecting entities
  - SVG circles at connection points
- [x] Relationship display between entities
- [x] Playwright screenshots (desktop + mobile)

> **Note:** Phase 1 is display-only with hardcoded entities. Entity/field CRUD buttons are stubs — no actual create/edit/delete functionality.

## Phase 2 — Schema Backend + Integration (NOT DONE)

- [ ] Wire to artifact API (GET/PUT /api/projects/[id]/artifacts/schema/schema.graph)
- [ ] Serialize entity graph to JSON
- [ ] Auto-save on changes
- [ ] Handle loading/error states
- [ ] Real entity CRUD (create, edit, delete entities)
- [ ] Real field CRUD (add, edit, delete fields with type/required/unique)
- [ ] Relationship management (create/delete relations between entities)
- [ ] Export to Prisma schema format for React projects
- [ ] Export to SQL DDL

## Phase 3 — Schema Testing

- [ ] User story validation: add entity, add fields, create relationship, delete entity
- [ ] Compare against pass-1 schema validation PNGs
