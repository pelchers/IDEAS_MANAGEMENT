# Subagent Spawning

## Overview

The orchestrator session delegates each phase to an isolated subagent. Spawning is
mediated by a queue file and a PowerShell hook script that invokes `claude exec`.
This architecture keeps each phase in a fresh context window while the orchestrator
maintains session continuity.

## Context Handoff (MANDATORY)

When spawning a subagent, the orchestrator MUST include a comprehensive prompt with:

1. **Prior phase summary**: What was built, key files created/modified, current test
   count, any deferred items or issues.
2. **Current phase scope**: The exact tasks from the primary task list for this phase,
   plus the phase plan file path.
3. **App state expectations**: What state the app must be in when the subagent finishes
   so the NEXT phase can start cleanly.
4. **Files to read on startup** (the subagent must read these before doing any work):
   - `CLAUDE.md` (project conventions and architecture)
   - `.docs/planning/prd.md` (product requirements)
   - `.docs/planning/technical-specification.md` (technical architecture)
   - `.adr/orchestration/<SESSION>/primary_task_list.md` (full task list)
   - `.adr/history/<SESSION>/phase_<N-1>_review.md` (prior phase review)
   - Design concept files if the phase involves UI work
5. **Validation requirements**: Playwright PNG screenshots, user story tests against
   the live app, user story report file — all in `.docs/validation/<SESSION>/<PHASE>/`.

## Spawning Architecture

```
  Orchestrator Chat
       |
       | 1. Builds context handoff prompt
       | 2. Writes next_phase.json
       v
  .claude/orchestration/queue/next_phase.json
       |
       | 3. Hook script reads queue
       v
  orchestrator-poke.ps1
       |
       | 4. Runs claude exec with prompt
       v
  New Claude Subagent
       |
       | 5. Reads project conventions (mandatory startup)
       | 6. Executes phase work
       | 7. Validates with Playwright + user stories
       v
  Poke Back (structured report)
       |
       | 8. Returns to orchestrator
       v
  Orchestrator processes poke
```

## Queue File Format

The queue file is written to `.claude/orchestration/queue/next_phase.json`:

```json
{
  "phase": 3,
  "prompt": "Execute phase 3: implement user profile CRUD operations...",
  "agent": "longrunning-worker-subagent",
  "autoSpawn": true,
  "dryRun": false,
  "sessionDir": "orchestration/current",
  "timestamp": "2025-02-28T12:00:00Z"
}
```

### Field Reference

| Field        | Type    | Required | Description                                         |
|--------------|---------|----------|-----------------------------------------------------|
| `phase`      | number  | yes      | Phase number being dispatched                       |
| `prompt`     | string  | yes      | Full prompt with context handoff for the subagent   |
| `agent`      | string  | no       | Agent name; hook prefixes prompt with agent path    |
| `autoSpawn`  | boolean | yes      | If true, hook spawns subagent immediately           |
| `dryRun`     | boolean | yes      | If true, hook logs but does not execute             |
| `sessionDir` | string  | no       | Path to orchestration session directory             |
| `timestamp`  | string  | no       | ISO 8601 timestamp of queue write                   |

## Poke-Back Requirements

After completing a phase, the subagent must return a structured "poke" containing:

1. **Completed tasks** — task descriptions with pass/fail status
2. **Files changed** — tree snippet of new/modified files
3. **Validation results** — test outcomes, Playwright screenshot status, user story report
4. **Commit confirmation** — commit hash and push status
5. **Next-phase readiness** — ready/blocked with any blockers listed

## Agent Prefixing

When the `agent` field is set in the queue file, the hook script prepends the
agent file path to the `claude exec` invocation.

| Queue `agent` value              | Resolved agent path                                          |
|----------------------------------|--------------------------------------------------------------|
| `longrunning-worker-subagent`    | `.claude/agents/longrunning-worker-subagent/AGENT.md`        |
| `longrunning-orchestrator-agent` | `.claude/agents/longrunning-orchestrator-agent/AGENT.md`     |

## Error Handling

- If the queue file is missing or malformed, the hook logs an error and exits.
- If `dryRun` is `true`, the hook logs the would-be command but does not execute.
- If `claude exec` fails, the queue file remains in `queue/` for retry.
- The orchestrator should check for stale queue files on session start.

## Security

- Queue files should not contain secrets or credentials.
- The hook runs with the caller's permissions; no privilege escalation occurs.
- Agent paths are validated against the `.claude/agents/` directory.
