# Skills

## longrunning-session
File: `.codex/skills/longrunning-session/SKILL.md`

- Enforces ADR workflow for each phase.
- Requires commits and pushes for phase completion.
- Queues next phase for subagent spawn.

## orchestrator-session
File: `.codex/skills/orchestrator-session/SKILL.md`

- Runs the phase loop and ensures subagent handoffs.
- Uses the queue + hook system to spawn subagents.

## research-docs-session
File: `.codex/skills/research-docs-session/SKILL.md`

- Focused on research and documentation ingestion.
- Adds validation requirements for citations and sources.
