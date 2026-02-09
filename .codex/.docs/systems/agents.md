# Agents

## Orchestrator Agent
File: `.codex/agents/orchestrator-agent/AGENT.md`

- Reads the current phase plan and prior review.
- Spawns the next phase subagent via queue + hook.
- Requires each phase to end with a review + commit/push.

## Longrunning Agent
File: `.codex/agents/longrunning-agent/AGENT.md`

- Enforces ADR workflow (plan → execute → validate → review).
- Moves phase files to history and checks off task lists.
- Queues the next phase for orchestration.

## Research Docs Agent
File: `.codex/agents/research-docs-agent/AGENT.md`

- Dedicated to research/documentation sessions.
- Uses the ADR workflow with additional sourcing requirements.
