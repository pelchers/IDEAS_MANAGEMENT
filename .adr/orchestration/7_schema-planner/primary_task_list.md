# Primary Task List — 7_schema-planner

Session: Schema Planner
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (schema view)

---

## Phase 1 — Schema Frontend from Pass-1

- [ ] Read pass-1 schema section from index.html, style.css, and app.js
- [ ] Build schema planner page matching pass-1 exactly:
  - Entity cards with thick black borders
  - Field rows with type badges (PK, FK, UQ, VARCHAR, INT, etc.)
  - IBM Plex Mono for field names and types
  - Rough.js hand-drawn relation lines connecting entities
  - SVG circles at connection points
- [ ] Entity CRUD (add/edit/delete entities)
- [ ] Field CRUD within entities (add/edit/delete fields, set type/required/unique)
- [ ] Relationship display between entities

## Phase 2 — Schema Backend + Integration

- [ ] Wire to artifact API (GET/PUT /api/projects/[id]/artifacts/schema/schema.graph)
- [ ] Serialize entity graph to JSON
- [ ] Auto-save on changes
- [ ] Handle loading/error states

## Phase 3 — Schema Testing

- [ ] Playwright screenshots (desktop + mobile)
- [ ] User story validation: add entity, add fields, create relationship, delete entity
- [ ] Compare against pass-1 schema validation PNGs
