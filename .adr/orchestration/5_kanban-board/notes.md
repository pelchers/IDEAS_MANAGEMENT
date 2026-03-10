# Notes — 5_kanban-board

## Decisions
- D1: Own session because kanban is high complexity (drag-drop, CRUD, persistence, column management)
- D2: Use sortablejs npm package (not CDN) with React refs for DOM integration
- D3: Debounced save (500ms) to avoid excessive API calls during drag operations

## Design Fidelity
- Mode: FAITHFUL
- Column header colors must exactly match pass-1
- SortableJS animation timing must match (200ms)
- Card tag colors must match pass-1 (feature=cornflower, bug=watermelon, urgent=lemon)
