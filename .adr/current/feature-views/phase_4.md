# Phase 4: Schema Planner

Session: feature-views
Phase: 4
Date: 2026-03-08

## Objective
Build the schema planner view for designing entity-relationship diagrams. Wire to artifact CRUD endpoints.

## Tasks
1. Build schema page at `apps/web/src/app/(authenticated)/projects/[id]/schema/page.tsx`
2. Entity cards: each entity shows name, fields list (name, type, constraints)
3. Add entity: button to create new entity with name
4. Edit entity: click to expand/edit fields
5. Add field: inline form within entity (field name, type dropdown, required toggle)
6. Delete entity/field
7. Relationship visualization: lines/arrows between related entities (optional — text-based references OK for MVP)
8. Field types: String, Number, Boolean, Date, JSON, Relation
9. Wire to GET/PUT /api/projects/[id]/artifacts?type=schema
10. Neo-brutalism styling

## Data Model:
```json
{
  "entities": [
    {
      "id": "entity-1",
      "name": "User",
      "fields": [
        { "id": "f1", "name": "email", "type": "String", "required": true, "unique": true },
        { "id": "f2", "name": "name", "type": "String", "required": false }
      ]
    }
  ]
}
```

## Output
- Schema page component
- `.adr/history/feature-views/phase_4_review.md`
- `.docs/validation/feature-views/phase_4/user-story-report.md`
- Updated primary task list

> **ACCURACY NOTE (2026-03-12):** Tasks 3-6 (add entity, edit entity, add field, delete entity/field) were marked complete but are actually non-functional. The schema planner is display-only with hardcoded entities. There is no CRUD for creating, editing, or deleting entities or fields. Corrected in Phase B Tier 1 remediation.
