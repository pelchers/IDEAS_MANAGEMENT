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

## Phase 2 — Schema CRUD + Persistence

### 2a. Data Model & Persistence
- [ ] Define full SchemaGraph type (entities with id/x/y, fields with id/badges, relations with id/type)
- [ ] Wire to artifact API: load on mount (GET), auto-save on changes (PUT debounced)
- [ ] Replace hardcoded ENTITIES with dynamic state from artifact API
- [ ] Handle loading/error/empty states
- [ ] Generate unique IDs for entities, fields, relations

### 2b. Entity CRUD
- [ ] "Add Entity" button opens inline form (entity name input)
- [ ] Entity header shows edit (rename) and delete buttons on hover
- [ ] Delete entity removes it and all its relations
- [ ] Entity cards draggable to reposition (x/y persisted)

### 2c. Field CRUD
- [ ] "Add Field" button at bottom of each entity card
- [ ] Field add form: name, type dropdown, required toggle, unique toggle, PK/FK badge selector
- [ ] Edit field: click field row to open inline edit
- [ ] Delete field: X button on field row hover
- [ ] Type dropdown options: string, int, float, boolean, datetime, text, enum, array, json

### 2d. Relation Management
- [ ] "Add Relation" button in toolbar area
- [ ] Relation form: from entity, to entity, type (1:1, 1:N, N:N)
- [ ] Visual relation lines drawn dynamically using Rough.js based on entity card positions
- [ ] Delete relation: click relation line or via relation list
- [ ] Auto-detect relations from FK fields (if field.isFK and field.fkTarget is set)

## Phase 3 — GitHub Import

- [ ] Import modal with tabs: Manual / GitHub / Local
- [ ] GitHub tab: input for owner/repo or full GitHub URL
- [ ] Fetch repo tree via GitHub API (client-side fetch to api.github.com)
- [ ] Display file tree, highlight parseable files (.prisma, .ts, .sql, .json)
- [ ] User selects which files to parse
- [ ] Prisma parser: extract model blocks, fields, types, modifiers (@id, @unique, @relation)
- [ ] TypeScript parser: extract interface/type blocks, fields, types, optional markers
- [ ] SQL parser: extract CREATE TABLE blocks, columns, constraints
- [ ] Convert parsed results to SchemaEntity[] with proper field types and badges
- [ ] Merge imported entities into current schema (add new, skip duplicates by name)
- [ ] Save import source metadata (githubRepo, importedAt) for re-sync
- [ ] "Re-import" button to refresh from same repo

## Phase 4 — Local Directory Import

- [ ] Local tab in import modal
- [ ] Option A: paste a directory tree as text (parse indented tree format)
- [ ] Option B: upload schema files directly (file picker for .prisma, .ts, .sql, .json)
- [ ] Reuse same parsers from Phase 3 for uploaded files
- [ ] For pasted tree: display as visual tree, let user identify which "files" to parse (won't have contents for pasted trees — just structure)
- [ ] Convert parsed results to SchemaEntity[]

## Phase 5 — Export

- [ ] Export dropdown/menu with three options: Prisma, SQL DDL, JSON
- [ ] Prisma export: generate valid .prisma model blocks from entities/fields/relations
- [ ] SQL DDL export: generate CREATE TABLE statements with constraints
- [ ] JSON export: raw SchemaGraph as formatted JSON
- [ ] Each export: preview in modal with syntax highlighting
- [ ] Copy to clipboard button
- [ ] Download as file button (.prisma, .sql, .json)

## Phase 6 — Schema Testing

- [ ] User story validation: add entity, add fields, create relationship, delete entity
- [ ] GitHub import: import from a known public repo, verify entities created
- [ ] Export: export as Prisma and SQL, verify output validity
- [ ] Compare against pass-1 schema validation PNGs
