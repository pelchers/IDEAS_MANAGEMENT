# Notes — 8_simple-views

## Decisions
- D1: Grouped because each view is low-medium complexity
- D2: Ideas filter chips are client-side filtering (no API calls per filter)
- D3: Directory tree preview panel uses pre-formatted code display
- D4: Directory tree follows same "trinary" import pattern as schema planner — GitHub API (public repos, client-side), local file upload, manual creation
- D5: GitHub file contents loaded lazily on click (not all at import time) to stay within API rate limits
- D6: Pasted tree text parsing uses indent-level heuristic — each 2/4 spaces or tab = 1 depth level. Names ending with `/` or without a file extension are treated as folders
- D7: Export text tree uses Unicode box-drawing chars (├── └── │) for clean output

## Design Fidelity
- Mode: FAITHFUL
- Ideas filter chips must match pass-1 exactly (same categories, same active state styling)
- Directory tree arrows and indentation must match pass-1
- Settings cards layout must match pass-1 (profile, preferences, integrations, danger zone)

## Phase 2 Update (2026-03-18)
- Scope expanded: directory tree now supports trinary data source (Manual, GitHub, Local) + export
- Same architectural pattern as schema planner (7_schema-planner) for consistency
- GitHub import shares same API approach (client-side fetch, public repos only)
- Export formats: Text tree (ASCII art), JSON, Markdown (nested bullet list)
