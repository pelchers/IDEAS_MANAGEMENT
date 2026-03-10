# Technical Requirements — 7_schema-planner

## Libraries
- roughjs — hand-drawn relation lines (same as pass-1)

## Key Files
- `apps/web/src/app/(authenticated)/projects/[id]/schema/page.tsx`

## Schema Data Model
- Entities: { id, name, fields: [{ name, type, required, unique, isPK, isFK }] }
- Relations: { from: entityId, to: entityId, type: "1:1"|"1:N"|"N:N" }
