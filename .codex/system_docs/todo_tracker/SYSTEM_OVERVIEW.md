# System Overview: TODO Tracker

## What It Is

The TODO Tracker maintains `TODO.md` at the project root as a human-readable kanban board. It bridges ADR session phases (structured build planning) with ad-hoc developer tasks — giving a single quick-glance view of the full build pipeline alongside day-to-day work items.

## Component Map

```
.claude/
├── agents/todo-tracker/AGENT.md          # Update agent with column semantics
└── skills/todo-tracker/SKILL.md          # User-invocable commands + format rules

TODO.md                                   # OUTPUT: 4-column kanban board (project root)

.adr/orchestration/                       # SOURCE: Session phase data
└── <N>_<session>/
    └── primary_task_list.md             # Phase headings + completion checkboxes
```

## When to Use vs Alternatives

| Scenario | Use todo_tracker | Alternative |
|----------|-----------------|-------------|
| Quick view of what's next | Yes — `/todo` | Read .adr/ directly |
| Add an ad-hoc task | Yes — `/todo add "..."` | Edit TODO.md manually |
| Mark a task complete | Yes — `/todo done "..."` | Edit TODO.md manually |
| View detailed phase plan | No — open ADR task list directly | N/A |
| Project management with teams | No — single-developer tool | GitHub Issues, Linear, etc. |
| Sync state with ADR | Yes — `/todo` + "resync" | Manual comparison |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **adr_setup** | TODO tracker reads `.adr/orchestration/*/primary_task_list.md` for phase data |
| **session_orchestration** | Orchestrators update TODO.md at session start, phase completion, and session end |
| **chat_history** | Planning decisions captured in chat become TODO items |
| **feature_expansion** | FEA Phase 3 (Document) adds new tasks to TODO NEXT |

## Quick Command Reference

| Command | Action |
|---------|--------|
| `/todo` | View current TODO.md |
| `/todo add "Task name"` | Add to TODO NEXT |
| `/todo done "Task name"` | Move to COMPLETED |
| `/todo future "Task name"` | Add to TODO FUTURE |
| `/skill todo-tracker` + "resync" | Full ADR scan and rebuild |

## TODO.md Audience

TODO.md is for the **human developer**, not for agents. Design principles:
- One line per item — readable at a glance
- Verb-first imperative phrasing
- No implementation details (those live in ADR docs)
- Phase items link to their task list for drill-down

Agents read TODO.md to understand current state. Agents write TODO.md to update status. Humans read TODO.md to know what to work on next.

## Design Decisions

**Why phase-level granularity from ADR (not individual checkbox level)?**
Individual checkboxes are too granular for a kanban view — a session might have 40 checkboxes. Phase-level grouping (one line per phase) keeps TODO.md scannable while the link provides drill-down access when needed.

**Why four columns instead of two (done/not-done)?**
TODO FUTURE separates deferred items from prioritized ones, preventing backlog bloat in TODO NEXT. IN PROGRESS separates active work from queued work, making the current focus visible at a glance.

**Why dynamic ADR scan (never hardcoded session names)?**
Hardcoded session names break when sessions are added, renamed, or reordered. Dynamic scanning ensures TODO.md is always derived from actual ADR state, not a stale snapshot.

## Constraints

- TODO.md is a single file at the project root — not split by feature or session
- Items are one line each — no nested sub-tasks
- ADR phases are summarized at phase level — individual checkboxes are not surfaced
- Column assignment comes from checkbox counts in phase files — `status:` field is secondary
