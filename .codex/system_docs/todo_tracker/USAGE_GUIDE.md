# Usage Guide: TODO Tracker

## Quick Start

```
/todo                          # view current TODO.md
/todo add "Build auth flow"    # add to TODO NEXT
/todo done "Set up database"   # move to COMPLETED
/todo future "Mobile app"      # add to TODO FUTURE
```

## Detailed Usage

### First-Time Setup (Sync with ADR)

```
/skill todo-tracker  → "Create TODO.md and sync with .adr/orchestration/"
```

Scans all session folders, reads `primary_task_list.md` files, populates TODO NEXT with all phases grouped by session.

### During Orchestrator Sessions

Integration is automatic with `longrunning-orchestrator-agent`:
- **Session start** → active tasks move to IN PROGRESS
- **Phase complete** → phase moves to COMPLETED with one-line summary
- **Session end** → remaining items move to TODO NEXT/FUTURE

### Manual Update

```
/agent todo-tracker "Phase 2 of 3_auth-flow is complete — 7/7 pass. Move to COMPLETED."
```

### Column Reference

| Column | Content | Checkbox |
|--------|---------|----------|
| IN PROGRESS | Actively running work | `- [ ]` |
| TODO NEXT | Next work cycle | `- [ ]` |
| COMPLETED | Done, grouped by theme | `- [x]` |
| TODO FUTURE | Deferred / nice-to-have | `- [ ]` |

## Troubleshooting

**TODO.md out of sync** — Run `/skill todo-tracker` and ask to "resync with .adr/orchestration/".

**Wrong column** — Fix the phase file's status field first; the agent reads status to determine column.

**Too many IN PROGRESS items** — Move completed work to COMPLETED, future work to TODO NEXT.
