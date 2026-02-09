# Risks and Decisions

## Key Risks
- Canvas performance degradation with large whiteboards.
- File corruption risk from abrupt process termination.
- CLI sidebar security and command safety boundaries.
- Maintaining consistency between indexed metadata and filesystem state.

## Mitigations
- Virtualized rendering and selective redraw.
- Snapshot + rollback strategy for critical files.
- Command allowlist and path sandboxing for CLI actions.
- Periodic integrity reconciliation jobs.

## Initial Decisions
- Local-first architecture.
- Project artifacts stored as readable files.
- Split pane project workspace with filesystem-backed navigation.
- Incremental delivery by feature modules.
