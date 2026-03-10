# Notes — 3_auth-flow

## Decisions
- D1: Keep existing auth API routes unchanged — they work correctly
- D2: Rebuild only the frontend pages to match pass-1 styling
- D3: Auth is its own session because it's high complexity (multiple endpoints, security concerns, middleware)

## Design Fidelity
- Mode: FAITHFUL
- Auth pages should use the same card/form/button patterns from pass-1
