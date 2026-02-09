# Longrunning Orchestration System

## Overview
The longrunning system is a multi-phase workflow that uses an orchestrator to spawn a new subagent per phase. Each phase has a plan, execution, validation, and a review file that is archived when complete.

## User Guide (How to run)

### 1) Create or update the session files
- `.codex/adr/orchestration/<SESSION>/primary_task_list.md`
- `.codex/adr/orchestration/<SESSION>/prd.md`
- `.codex/adr/orchestration/<SESSION>/technical_requirements.md`
- `.codex/adr/orchestration/<SESSION>/notes.md`

### 2) Create the phase plan
Create `.codex/adr/current/<SESSION>/phase_<N>.md` using the template.

### 3) Execute the phase
Work through tasks; validate each checklist item.

### 4) Close out the phase
- Write `.codex/adr/history/<SESSION>/phase_<N>_review.md`.
- Move the phase plan to `.codex/adr/history/<SESSION>/phase_<N>.md`.
- Update the primary task list status.
- Commit and push.

### 5) Spawn the next subagent
1. Copy `.codex/orchestration/queue/next_phase.template.json` to `next_phase.json`.
2. Edit fields: `session`, `phase`, `agent`, `workdir`, `prompt`.
3. Set `autoSpawn: true` and `dryRun: false` for a real run.
4. Run the hook:
   - `powershell -NoProfile -ExecutionPolicy Bypass -File .codex/hooks/scripts/orchestrator-poke.ps1`

The hook runs `codex exec --cd <repo> --full-auto "<prompt>"`, then archives the queue file.

## Technical Implementation

### Queue format
Location: `.codex/orchestration/queue/next_phase.json`

Fields:
- `session`: session identifier
- `phase`: phase id
- `agent`: agent folder name (e.g. `longrunning-agent`)
- `workdir`: repo root path
- `fullAuto`: set `true` for auto mode
- `autoSpawn`: set `true` to run
- `dryRun`: set `true` to print command without executing
- `prompt`: subagent prompt

### Hook script
File: `.codex/hooks/scripts/orchestrator-poke.ps1`

Responsibilities:
- Parse the queue file.
- Build the `codex exec` command.
- Prefix prompt with agent file path (if provided).
- Start the process (unless dryRun).
- Move queue file to `.codex/orchestration/history/`.

### Trigger points
- Stop hook in `.codex/hooks/settings.json` runs the orchestrator script.
- Manual invocation is allowed using the `/spawn-subagent` command.

## Validation
- Dry run verifies the command format.
- Queue file is archived after each run.

## Notes
- The agent file is referenced by path: `.codex/agents/<agent>/AGENT.md`.
- Use HTTPS remotes for all pushes.
