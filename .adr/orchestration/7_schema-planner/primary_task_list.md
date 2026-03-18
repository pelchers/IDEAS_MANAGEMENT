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

## Phase 2 — Schema CRUD + Persistence ✅

### 2a. Data Model & Persistence
- [x] Define full SchemaGraph type (entities with id/x/y, fields with id/badges, relations with id/type)
- [x] Wire to artifact API: load on mount (GET), auto-save on changes (PUT debounced 800ms)
- [x] Replace hardcoded ENTITIES with dynamic state from artifact API
- [x] Handle loading/error/empty states
- [x] Generate unique IDs for entities, fields, relations

### 2b. Entity CRUD
- [x] "Add Entity" button opens modal form (entity name input)
- [x] Entity header shows REN (rename) and DEL (delete) buttons on hover
- [x] Delete entity removes it and all its relations
- [x] Entity positions auto-laid out in 3-column grid

### 2c. Field CRUD
- [x] "Add Field" button at bottom of each entity card
- [x] Field add form: name, type dropdown, required toggle, unique toggle, PK/FK badge selector
- [x] Edit field: E button on field row hover opens edit modal
- [x] Delete field: X button on field row hover
- [x] Type dropdown options: string, int, float, boolean, datetime, text, enum, array, json

### 2d. Relation Management
- [x] "Add Relation" button in toolbar area
- [x] Relation form: from entity, to entity, type (1:1, 1:N, N:N)
- [x] Visual relation lines drawn dynamically using Rough.js based on entity card positions
- [x] Delete relation via X button on relation tag
- [x] Relation type labels rendered on lines

## Phase 3 — GitHub Import ✅

- [x] Import modal with tabs: GitHub / Local
- [x] GitHub tab: input for owner/repo or full GitHub URL
- [x] Fetch repo tree via GitHub API (client-side fetch to api.github.com)
- [x] Display file tree, highlight parseable files (.prisma, .ts, .tsx, .sql, .json)
- [x] User selects which files to parse via checkboxes
- [x] Prisma parser: extract model blocks, fields, types, modifiers (@id, @unique, @relation)
- [x] TypeScript parser: extract interface/type blocks, fields, types, optional markers
- [x] SQL parser: extract CREATE TABLE blocks, columns, constraints
- [x] Convert parsed results to SchemaEntity[] with proper field types and badges
- [x] Merge imported entities into current schema (add new, skip duplicates by name)
- [x] Save import source metadata (githubRepo, importedAt) for re-sync

## Phase 4 — Local Directory Import ✅

- [x] Local tab in import modal
- [x] Upload schema files directly (file picker for .prisma, .ts, .tsx, .sql, .json)
- [x] Reuse same parsers from Phase 3 for uploaded files
- [x] Multi-file upload support
- [x] Convert parsed results to SchemaEntity[]

## Phase 5 — Export ✅

- [x] Export buttons in header: PRISMA, SQL, JSON
- [x] Prisma export: generate valid .prisma model blocks from entities/fields/relations
- [x] SQL DDL export: generate CREATE TABLE statements with constraints
- [x] JSON export: raw SchemaGraph as formatted JSON
- [x] Each export: preview in modal with dark-themed code block
- [x] Copy to clipboard button
- [x] Download as file button (.prisma, .sql, .json)

## Phase 5b — Relation Linkage + Full SQL Feature Set (2026-03-18) ✅

### Relation Visual + Data Fixes
- [x] Fix Rough.js SVG: overlay on top of entity cards (absolute positioned, pointer-events none) so lines draw between cards correctly
- [x] Adding a relation auto-creates FK field on the "to" entity (e.g. Products 1:N Orders → Orders gets `productId` FK field with fkTarget)
- [x] Relation form: add optional FK field name input (default: `{fromEntityLower}Id`)
- [x] Entity cards: visually indicate FK fields with target entity name, plus AUTO and IDX badges

### Export: Relation-Aware Output
- [x] Prisma export: generate `@relation` fields and reverse relation model references for each relation
- [x] SQL export: generate FOREIGN KEY constraints from relations with CONSTRAINT names
- [x] SQL export: generate CREATE INDEX statements for FK columns and indexed fields
- [x] SQL export: ON DELETE actions (CASCADE, SET NULL, RESTRICT, NO ACTION, SET DEFAULT)

### Full SQL Field Features
- [x] Add `defaultValue` to SchemaField (string, rendered as DEFAULT in SQL, @default in Prisma)
- [x] Add `autoIncrement` to SchemaField (SERIAL/BIGSERIAL in SQL, @default(autoincrement()) in Prisma)
- [x] Add `onDelete` to SchemaRelation (CASCADE, SET NULL, RESTRICT, NO ACTION, SET DEFAULT)
- [x] Add INDEX support: mark fields as indexed (non-unique index)
- [x] Field form: add defaultValue input, autoIncrement toggle, indexed toggle
- [x] Relation form: add onDelete dropdown, FK field name input, helper text
- [x] Expanded type dropdown: 19 types including bigint, decimal, uuid, bytes, smallint, serial, bigserial, date, time, timestamptz

## Phase 5c — Whiteboard Canvas + Comprehensive PostgreSQL Features (2026-03-18)

### Canvas Layout ✅
- [x] Replace CSS grid with absolute-positioned cards on a canvas
- [x] Drag-and-drop entity cards to reposition (positions persisted)
- [x] Canvas auto-sizes based on entity positions
- [x] Relation SVG overlays canvas, relation list below

### PostgreSQL Schema Namespaces ✅
- [x] Add `schema` field to SchemaEntity (default: "public")
- [x] SQL export: CREATE SCHEMA + schema-qualified table names
- [x] Prisma export: @@schema() attribute

### Custom Types ✅
- [x] ENUM types: CREATE TYPE modal, define name + values list
- [x] Store enums in SchemaGraph as `enumTypes: { id, name, values[], schema? }[]`
- [x] Field type dropdown includes user-defined enums (shown below built-in types)
- [x] SQL export: CREATE TYPE ... AS ENUM before tables
- [x] Prisma export: enum blocks before models
- [x] Enum list UI below canvas with delete buttons
- [ ] Domain types (CREATE DOMAIN — name, base type, constraints) — deferred

### Column Features ✅
- [x] CHECK constraints: optional expression string per field (SQL: CHECK(...))
- [x] GENERATED columns: expression + STORED (isGenerated + generatedExpr fields)
- [x] IDENTITY columns: GENERATED ALWAYS/BY DEFAULT AS IDENTITY (isIdentity + identityType)
- [x] COLLATION per column (collation field, rendered as COLLATE in SQL)
- [x] Array element type: arrayElementType field (e.g. TEXT[], INTEGER[])
- [x] Column COMMENT (COMMENT ON COLUMN in SQL, /// comment in Prisma)

### Constraint Features ✅
- [x] Composite primary keys on entity (compositePK field — @@id in Prisma, CONSTRAINT PK in SQL)
- [x] Composite unique constraints on entity (compositeUniques field — @@unique in Prisma, CONSTRAINT UQ in SQL)
- [x] ON UPDATE action on FK relations (CASCADE, SET NULL, RESTRICT, NO ACTION, SET DEFAULT)
- [ ] DEFERRABLE / INITIALLY DEFERRED toggle per constraint — deferred
- [ ] Exclusion constraints (EXCLUDE USING) — deferred

### Index Features (data model ready, UI deferred)
- [x] Index type selector on field: BTREE, GIN, GiST, BRIN, HASH (indexType field)
- [x] SQL export uses USING clause for non-BTREE index types
- [ ] Partial indexes: optional WHERE clause expression — deferred
- [ ] Expression indexes — deferred
- [ ] Covering indexes: INCLUDE columns — deferred
- [ ] Multi-column indexes — deferred

### Table-Level Features ✅
- [x] COMMENT ON TABLE (entity.comment — SQL + Prisma export)
- [x] UNLOGGED toggle (entity.isUnlogged — SQL export)
- [ ] Table INHERITS — deferred
- [ ] Partitioning — deferred

### Views, Sequences, Functions, Triggers, Permissions — deferred to Phase 7
- [ ] CREATE VIEW / MATERIALIZED VIEW
- [ ] CREATE SEQUENCE
- [ ] CREATE FUNCTION / CREATE TRIGGER
- [ ] Row Level Security / POLICY
- [ ] CREATE EXTENSION
- [ ] GRANT / REVOKE

## Phase 6 — Schema Testing

- [ ] User story validation: add entity, drag to reposition, add fields, create relationship, verify FK auto-created, delete entity
- [ ] Export: Prisma output includes @relation + enums, SQL output includes FOREIGN KEY + INDEX + ENUM + SCHEMA
- [ ] GitHub import: import from a known public repo, verify entities created
- [ ] Compare against pass-1 schema validation PNGs
