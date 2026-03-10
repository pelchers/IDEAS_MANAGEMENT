# Technical Requirements — 5_kanban-board

## Libraries
- sortablejs + @types/sortablejs — drag-and-drop (same library as pass-1)

## Key Files
- `apps/web/src/app/(authenticated)/projects/[id]/kanban/page.tsx`

## API Contract
- GET /api/projects/[id]/artifacts/kanban/board → { artifact: { content: { columns: [...] } } }
- PUT /api/projects/[id]/artifacts/kanban/board → { content: { columns: [...] } }

## Pass-1 Reference
- Kanban columns: Backlog (#FF5E54), Todo (#FFE459), Progress (#1283EB), Done (#2BBF5D)
- SortableJS config: group "kanban", animation 200, ghostClass/chosenClass/dragClass
