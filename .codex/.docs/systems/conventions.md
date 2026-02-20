# Conventions

## ADR Workflow
- All multi-phase work uses ADR session folders.
- Each phase requires a plan, validations, and a review file.
- Phase plans live in `.adr/current/` and move to history once complete.

## Git Workflow
- Commit and push after each phase.
- Use HTTPS remotes only.

## Testing
- Use Playwright for E2E.
- Multi-role coverage for user/mod/admin/owner.

## Subagent Orchestration
- Queue file: `.codex/orchestration/queue/next_phase.json`.
- Hook: `.codex/hooks/scripts/orchestrator-poke.ps1`.
- Queue is archived to `.codex/orchestration/history/` after each run.
