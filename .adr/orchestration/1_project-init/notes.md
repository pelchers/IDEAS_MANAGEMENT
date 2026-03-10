# Notes — 1_project-init

## Decisions
- D1: Keep all existing API routes — backend is largely correct, problem was frontend fidelity
- D2: Install Chart.js, SortableJS, Rough.js as npm packages (not CDN) for proper React integration
- D3: Clean frontend completely rather than incremental refactor — less risk of leftover artifacts

## Constraints
- C1: PostgreSQL must be running on localhost:5432, database `idea_management`
- C2: Admin account password is `2322`

## Open Questions
- Q1: Should we keep the existing AI components (chat-input, message-list, etc.) or rebuild those too?
  - Answer: Rebuild them in session 9 for full pass-1 fidelity

## Design Fidelity
- Mode: FAITHFUL
- Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/`
- Orchestrator inferred fidelity from user prompt: "we want to be 100% faithful to the design of the pass"
