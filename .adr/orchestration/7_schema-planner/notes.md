# Notes — 7_schema-planner

## Decisions
- D1: Own session — high complexity (entity graph, relations, Rough.js SVG rendering)
- D2: Use Rough.js for relation lines to match pass-1 hand-drawn aesthetic
- D3: Entity cards use CSS Grid for field rows, not table elements
- D4: GitHub import uses public REST API directly from client (no backend proxy) — 60 req/hr is sufficient for one-time imports
- D5: Parsers for Prisma/TS/SQL are inline regex-based — no external dependencies. Covers 90% of real-world schemas. Edge cases can be manually fixed post-import.
- D6: Local directory import via file upload (not filesystem access) since browser can't read local paths. Pasted tree text gives structure only (no file contents).
- D7: Export generates valid, usable output — not just pretty-printed. Prisma export should be copy-pasteable into a schema.prisma file.

## Design Fidelity
- Mode: FAITHFUL
- Rough.js relation lines must match pass-1 visual style
- Field type badges must use IBM Plex Mono matching pass-1

## Phase 2 Update (2026-03-17)
- Scope expanded: added GitHub repo import, local directory import, and multi-format export
- Original Phase 2 split into Phases 2-5 for clearer execution
- GitHub import uses unauthenticated API — private repos deferred to V2 (needs OAuth)
- Three parsers needed: Prisma, TypeScript, SQL — all regex-based inline implementations
