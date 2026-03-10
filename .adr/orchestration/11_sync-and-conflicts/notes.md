# Notes — 11_sync-and-conflicts

## Decisions
- D1: Own session — medium complexity (sync queue, conflict detection, resolution UI)
- D2: Conflict UI uses side-by-side diff display
- D3: Sync status indicator shows in top bar near notification bell

## Design Fidelity
- Mode: FAITHFUL for styling (neo-brutalist cards, borders, colors)
- No pass-1 reference for sync/conflict UI specifically (not in pass-1), so follow pass-1 component patterns
