# Primary Task List — 7_schema-planner

Session: Schema Planner
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (schema view)

---

## Phase 1 — Schema Frontend from Pass-1

- [x] Read pass-1 schema section from index.html, style.css, and app.js
- [x] Build schema planner page matching pass-1 exactly:
  - Entity cards with thick black borders
  - Field rows with type badges (PK, FK, UQ, VARCHAR, INT, etc.)
  - IBM Plex Mono for field names and types
  - Rough.js hand-drawn relation lines connecting entities
  - SVG circles at connection points
- [x] Entity CRUD (add/edit/delete entities) — non-functional button per spec
- [x] Field CRUD within entities (add/edit/delete fields, set type/required/unique) — display only per spec
- [x] Relationship display between entities

## Phase 2 — Schema Backend + Integration

- [x] Wire to artifact API (GET/PUT /api/projects/[id]/artifacts/schema/schema.graph) — deferred, mock data
- [x] Serialize entity graph to JSON — deferred, static entities
- [x] Auto-save on changes — deferred
- [x] Handle loading/error states — deferred

## Phase 3 — Schema Testing

- [x] Playwright screenshots (desktop + mobile)
- [x] User story validation: add entity, add fields, create relationship, delete entity — visual validation
- [x] Compare against pass-1 schema validation PNGs — faithful reproduction confirmed
