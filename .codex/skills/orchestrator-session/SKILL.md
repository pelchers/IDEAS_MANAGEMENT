---
name: orchestrator-session
description: Run the orchestration loop for multi-phase sessions, spinning up a new subagent per phase.
---

## Purpose
Manage a long-running session by delegating each phase to a new subagent, while the current
chat acts as the orchestrator.

## Build order convention

The orchestrator enforces a **frontend-first** pipeline when a design pass exists:

```
Project Init → Frontend Conversion → Domain Sessions → Hardening (cyclic)
```

Domain sessions scope work by area of concern x complexity. Backend + integration + testing
fold into each domain session rather than being separate sequential stages.

## Design fidelity inference

Parse the user's initial prompt to infer design fidelity. No explicit flags needed:

- **Faithful**: user says "exactly like", "1:1", "match the concept" → subagents read
  pass HTML as primary spec and reproduce every layout/component/interaction
- **Reference**: user says "style guide", "reference the design" → subagents use design
  tokens but build layouts from PRD
- **External**: user says "adapt this site", "make it look like [url]" → subagents adapt
  external visual language to PRD spec
- **From scratch**: no design mention → subagents build from PRD only

Document the inference in the session's `notes.md`.

## Orchestrator loop
1) Read the previous phase review and current phase plan.
2) Infer design fidelity from the user's prompt (first iteration only).
3) Spawn a new subagent for the phase with full context handoff including fidelity mode.
4) Require a "poke" back with:
   - Completed tasks summary
   - Files changed (tree snippet)
   - Validation results
   - Commit + push confirmation
   - Next-phase readiness
5) Update primary task list phase status and prepare the next phase plan.

## Phase kickoff
- Each phase begins with a brief review of the previous phase review.

## Required outputs
- Phase review file with tree + technical breakdown.
- Phase plan moved to history after validation.
- Commit and push per phase (HTTPS remote).

## Hardening session (cyclic)

The final hardening session is a feedback loop, not a one-shot pass:
1) Run full Playwright E2E tests and user-story validation across all features
2) Run standard test suites (unit, integration)
3) Collect env variables and production config from the human in the loop
4) Present results and edge-case failures to the user
5) Accept user feedback on modifications, fixes, and adjustments
6) Agent applies fixes based on feedback
7) Re-run validation → return to step 4
8) Cycle continues until the user confirms production readiness

Phases are created dynamically as feedback cycles occur.

## Testing policy
- Never force passing tests. Investigate failures, document causes, and fix for production readiness.

## Subagent spawning (Codex exec)
Use the orchestration queue + hook to spawn subagents:
1) Write `.codex/orchestration/queue/next_phase.json`
2) Set `autoSpawn: true` (and `dryRun: false` for real execution)
3) Run `powershell -NoProfile -ExecutionPolicy Bypass -File .codex/hooks/scripts/orchestrator-poke.ps1`
4) The hook runs `codex exec` with the provided prompt and moves the queue file to history.
5) If `agent` is set in the queue file, the hook prefixes the prompt with the agent file path.

## Templates
Use templates in `templates/` and references in `references/`.

## Remote handling
- Use HTTPS remotes (not SSH) for pushes.
- Do not hardcode repository remotes.
