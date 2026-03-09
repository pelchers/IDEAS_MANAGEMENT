# System Docs: TODO Tracker

## Purpose
Maintains `TODO.md` at the project root as a human-readable kanban board for the developer. Updated during planning conversations, orchestrator sessions, and on user request.

## Components

| Component | Path |
|-----------|------|
| Agent | `.codex/agents/todo-tracker/AGENT.md` |
| Skill | `.codex/skills/todo-tracker/SKILL.md` |
| Output | `TODO.md` (project root) |

## Architecture

- **Agent** defines behavior rules: when to update, writing style, column semantics
- **Skill** is user-invocable (`/todo`, `/todo add`, `/todo done`, `/todo future`)
- **Output** is a single markdown file with 4 kanban columns: IN PROGRESS, TODO NEXT, COMPLETED, TODO FUTURE

## Integration Points

- `longrunning-orchestrator-agent` — Updates TODO.md at session start (IN PROGRESS), phase completion (COMPLETED), and session end
- `orchestrator-session` skill — Triggers TODO updates as phases transition
- User conversations — Captures planning decisions as TODO items

## Key Design Decision

TODO.md is for the **human developer**, not for agents. One line per item, verb-first, no implementation details. Deep context lives in ADR docs and phase plans.
