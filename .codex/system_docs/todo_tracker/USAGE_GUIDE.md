# Usage Guide: TODO Tracker

## Quick Start

```
/todo                          # show current TODO.md
/todo add "Build auth flow"    # add item to TODO NEXT
/todo done "Set up database"   # move item to COMPLETED
/todo future "Mobile app"      # add to TODO FUTURE
```

## Detailed Usage

### First-Time Setup (Sync with ADR)

When `TODO.md` doesn't exist, or when you want to sync it with your ADR build plan:

```
/skill todo-tracker  (then say: "Create TODO.md and sync with .adr/orchestration/")
```

The skill scans all session folders in `.adr/orchestration/`, reads each `primary_task_list.md`, and populates TODO NEXT with all phases grouped by session.

### During Orchestrator Sessions

The todo-tracker integrates with `longrunning-orchestrator-agent` automatically:

- **Session start**: Active tasks move to IN PROGRESS
- **Phase complete**: Phase moves to COMPLETED with one-line summary
- **Session end**: Remaining items move to TODO NEXT or TODO FUTURE

### Manual Update

```
/agent todo-tracker "Phase 2 of 3_auth-flow is complete — 7/7 tests passing. Move to COMPLETED."
```

### TODO.md Format

```markdown
## IN PROGRESS
- [ ] Build login API endpoint

## TODO NEXT
- [ ] Add email verification flow

## COMPLETED
### Session 3: Auth Flow
- [x] Phase 1: Login UI — converted to React/Tailwind (7/7 pass)

## TODO FUTURE
- [ ] Implement SSO integration
```

## Troubleshooting

**TODO.md out of sync with ADR sessions**
Run: `/skill todo-tracker` and ask it to "resync with .adr/orchestration/". It re-reads all primary task lists.

**Item shows in wrong column**
The agent determines column by phase status (`[x]` = COMPLETED, actively running = IN PROGRESS, future = TODO NEXT). If a phase plan has wrong status, fix the phase file first.

**TODO.md has too many items in IN PROGRESS**
IN PROGRESS should only contain actively running work. Move completed items to COMPLETED, future items to TODO NEXT, and deprioritized items to TODO FUTURE.
