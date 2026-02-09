# Appendix: Table of Contents

## Root Codex Files
- `.codex/README.md` — repo-scoped Codex folder overview.
- `.codex/CODEX.md` — project guide (instruction discovery + conventions + goals).
- `.codex/AGENTS.md` — session skill discovery list (if present).

## Agents
- `.codex/agents/longrunning-agent/AGENT.md` — phase execution and ADR lifecycle.
- `.codex/agents/research-docs-agent/AGENT.md` — research + docs orchestration.
- `.codex/agents/orchestrator-agent/AGENT.md` — spawns subagents per phase.

## Skills
- `.codex/skills/longrunning-session/SKILL.md` — required ADR workflow.
- `.codex/skills/orchestrator-session/SKILL.md` — orchestration loop rules.
- `.codex/skills/research-docs-session/SKILL.md` — research session workflow.

## Hooks
- `.codex/hooks/settings.json` — hook bindings.
- `.codex/hooks/scripts/orchestrator-poke.ps1` — queue + spawn logic.
- `.codex/hooks/scripts/*.sh` — pre/post tool validation stubs.

## Commands
- `.codex/commands/README.md` — command index.
- `.codex/commands/spawn-subagent.md` — spawn workflow command.
- `.codex/commands/commit-and-push.md` — git workflow helper.
- `.codex/commands/run-full-tests.md` — test suite helper.

## Orchestration
- `.codex/orchestration/README.md` — queue overview.
- `.codex/orchestration/queue/next_phase.template.json` — queue template.
- `.codex/orchestration/history/*` — archived queue items.

## ADR Workflow
- `.codex/adr/orchestration/*` — session task lists + PRD + tech requirements.
- `.codex/adr/current/*` — active phase files.
- `.codex/adr/history/*` — completed phases + reviews.
