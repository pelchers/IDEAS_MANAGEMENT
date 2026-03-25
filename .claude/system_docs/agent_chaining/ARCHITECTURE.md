# Agent Chaining System — Technical Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│  /chain 3_FRONTEND - 5_USER_STORY --per-phase                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CHAIN COMMAND                                  │
│  1. Parse path + range + mode flags                              │
│  2. Scan ADR subfolders for unchecked work                       │
│  3. Create chain-plan.json                                       │
│  4. Execute Phase 1 inline (same session)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         │
┌──────────────────────┐                │
│     AGENT SESSION    │                │
│                      │                │
│  1. SessionStart     │                │
│     hook loads       │                │
│     chain context    │                │
│                      │                │
│  2. Read chain-plan  │                │
│     + task list      │                │
│     + frontend_spec  │                │
│                      │                │
│  3. Execute tasks    │                │
│     (FEA cycle)      │                │
│                      │                │
│  4. Check off items  │                │
│     in task list     │                │
│                      │                │
│  5. Write signal     │                │
│     chain-signal.txt │                │
│                      │                │
│  6. Exit cleanly     │                │
└──────────┬───────────┘                │
           │                            │
           ▼                            │
┌──────────────────────┐                │
│     STOP HOOK        │                │
│  chain-continue.sh   │                │
│                      │                │
│  1. Read signal file │                │
│  2. Parse signal     │                │
│     type             │                │
│  3. Update           │                │
│     chain-plan.json  │                │
│  4. Write            │                │
│     next_phase.json  │                │
│  5. Delete signal    │                │
└──────────┬───────────┘                │
           │                            │
           ▼                            │
┌──────────────────────┐                │
│  orchestrator-poke   │                │
│  .ps1 (existing)     │                │
│                      │                │
│  1. Read queue file  │                │
│  2. Spawn claude     │                │
│     exec process     │                │
│  3. Archive queue    │                │
└──────────┬───────────┘                │
           │                            │
           └────────────────────────────┘
                    (loop continues until
                     all phases complete)
```

## State Machine — chain-plan.json

```
                    ┌──────────┐
         /chain ──▶│ created  │
                    └────┬─────┘
                         │ first agent starts
                         ▼
                    ┌──────────┐
              ┌────│ running  │◀───┐
              │    └────┬─────┘    │
              │         │          │
              │    phase done,     │
              │    more remain     │
              │         │          │
              │         ▼          │
              │   ┌───────────┐    │
              │   │ spawning  │────┘
              │   └───────────┘
              │
              │  /chain-stop
              ▼
        ┌──────────┐
        │ stopped  │
        └──────────┘
              │
              │  /chain (resume)
              ▼
        ┌──────────┐
        │ running  │ (picks up from first unchecked)
        └──────────┘
              │
              │  all phases done
              ▼
        ┌───────────┐
        │ completed │
        └───────────┘
```

## chain-plan.json Schema

```json
{
  "chainId": "string — unique identifier (subfolder name + timestamp)",
  "status": "created | running | stopped | completed",
  "mode": "per-task | per-phase | per-subfolder | full",
  "createdAt": "ISO 8601 timestamp",
  "completedAt": "ISO 8601 timestamp | null",
  "maxPhases": "integer — safety cap (default 20)",
  "pauseAfterPhase": "string | null — phase ID to pause after",
  "feaMode": "boolean — whether to use FEA cycle within each phase",
  "range": {
    "start": "string — first subfolder name or number",
    "end": "string — last subfolder name or number"
  },
  "phases": [
    {
      "id": "integer — sequential phase number in the chain",
      "subfolder": "string — ADR session folder name",
      "phase": "integer | null — phase number within subfolder (null for per-subfolder mode)",
      "taskCount": "integer — number of unchecked items when chain was created",
      "status": "pending | in_progress | completed | skipped",
      "agent": "string — agent definition to use (default: chain-agent)",
      "startedAt": "ISO 8601 | null",
      "completedAt": "ISO 8601 | null",
      "commitSha": "string | null — git commit after phase completion"
    }
  ]
}
```

## chain-signal.txt Format

Written by the agent as its final action before exit:

```
[CHAIN:<SIGNAL_TYPE>]
subfolder=<current_subfolder_name>
phase=<current_phase_number>
tasks_completed=<count>
tasks_remaining=<count>
next_subfolder=<next_subfolder_name | none>
next_phase=<next_phase_number | none>
commit_sha=<git_sha>
timestamp=<ISO 8601>
```

Signal types:
- `TASK_COMPLETE` — one checkbox done, more remain in this phase
- `PHASE_COMPLETE` — all checkboxes in a phase done, more phases remain
- `SUBFOLDER_COMPLETE` — all phases in a subfolder done, more subfolders may remain
- `ORCHESTRATION_COMPLETE` — all subfolders in range are done

## Hook Execution Order

```
1. SessionStart hooks fire (including chain-session-init.sh)
   └─ chain-session-init.sh:
      ├─ Read chain-plan.json → identify current phase
      ├─ Read previous ingest summary from .adr/agent_ingest/
      ├─ Read frontend_spec.md (session → root → halt)
      └─ Output context injection text

2. Agent executes work
   ├─ Reads chain-plan.json for scope
   ├─ Reads primary_task_list.md for tasks
   ├─ Works through assigned tasks
   ├─ Checks off completed items
   └─ Commits changes

3. Agent writes chain-signal.txt

4. Agent exits (naturally or context limit)

5. Stop hooks fire (ALL registered Stop hooks, in order)
   ├─ git-context-report.sh (existing — captures git state)
   ├─ orchestrator-poke.ps1 (existing — checks queue/next_phase.json)
   └─ chain-continue.sh (NEW — reads signal, writes queue, calls poke)

6. chain-continue.sh:
   ├─ Read chain-signal.txt
   ├─ If missing → exit (no chain active or agent crashed)
   ├─ Parse signal type
   ├─ Update chain-plan.json (mark phase completed)
   ├─ Determine next phase based on mode:
   │   per-task: next unchecked item in current phase/subfolder
   │   per-phase: next phase heading with unchecked items
   │   per-subfolder: next subfolder in range
   │   full: next subfolder with unchecked work
   ├─ If next exists:
   │   ├─ Build prompt with context (prior ingest, next scope, FEA flag)
   │   ├─ Write .claude/orchestration/queue/next_phase.json
   │   └─ Call orchestrator-poke.ps1 → spawns claude exec
   ├─ If no next:
   │   └─ Mark chain-plan.json status: "completed"
   └─ Delete chain-signal.txt (consumed)
```

## Context Bridging Between Sessions

Each agent session is a fresh context window. Context bridges via:

### 1. Ingest Summaries
Written to `.adr/agent_ingest/chain-<chainId>-phase-<N>.md`:
```markdown
# Chain Phase Summary

Chain: 3_FRONTEND - 5_USER_STORY
Phase: 1 of 2 (3_FRONTEND / Phase 8)
Mode: per-phase
Date: 2026-03-22

## What Was Done
- [list of completed tasks]

## Files Changed
- [file paths with brief descriptions]

## State After This Phase
- [what's true now that wasn't before]
- [what the next agent needs to know]

## Commits
- abc1234: feat: pagination on discovery page
- def5678: feat: card layout with line-clamp
```

### 2. chain-plan.json
Persistent state file — each agent reads it to know what phase it's on and what came before.

### 3. Git History
The next agent can `git log --oneline -20` to see what the previous agent committed.

### 4. Task List Checkboxes
Already-checked items tell the next agent "this is done, don't redo it."

## Frontend Spec Resolution Algorithm

```
function resolveFrontendSpec(session):
  sessionPath = .adr/orchestration/{session}/frontend_spec.md
  rootPath = .adr/orchestration/frontend_spec.md

  if exists(sessionPath):
    return read(sessionPath)

  if exists(rootPath):
    return read(rootPath)

  // Neither exists — check if this phase has frontend work
  currentTasks = parseUncheckedItems(session/primary_task_list.md)
  frontendKeywords = ["frontend", "UI", "page", "component", "React", "Tailwind",
                       "CSS", "layout", "design", "responsive", "mobile"]

  hasFrontendWork = any(task contains keyword for keyword in frontendKeywords
                        for task in currentTasks)

  if hasFrontendWork:
    HALT("Frontend spec required but not found. Create frontend_spec.md
          in {session}/ or .adr/orchestration/ before continuing.")

  return null  // no frontend work, no spec needed
```

## Task List Parsing

### Extracting Phases
```
Read primary_task_list.md
Split on lines matching: /^## Phase \d+/
Each match starts a new phase section
Phase number = integer after "Phase "
```

### Extracting Tasks
```
Within each phase section:
Find lines matching: /^- \[[ x]\] .+/
- [ ] = unchecked (pending)
- [x] = checked (completed)
Indented lines below a task are notes, not separate tasks
```

### Example Parsing
```markdown
## Phase 8
- [x] Cursor-based pagination          ← completed, skip
- [ ] Fixed-height card layout          ← NEXT TASK (per-task mode)
- [ ] Zero enrollment → "N/A" display
- [ ] Tags on discovery cards
```

Per-task: agent gets "Fixed-height card layout"
Per-phase: agent gets all 3 unchecked items in Phase 8
Per-subfolder: agent gets Phase 8 + any other phases with unchecked items

## Error Handling

### Agent Crashes Mid-Phase
- chain-signal.txt is NOT written
- Stop hook fires but finds no signal → does nothing
- chain-plan.json still shows the phase as "in_progress"
- Recovery: user runs `/chain` again → detects in_progress phase → resumes from first unchecked item

### Signal Written But Poke Fails
- chain-signal.txt exists, next_phase.json may or may not exist
- Recovery: manually run `powershell -File .claude/hooks/scripts/orchestrator-poke.ps1`
- Or: delete signal, run `/chain` again

### Task List Corrupted
- Checkboxes are the single source of truth
- If a task was completed but not checked off → agent will redo it (safe, idempotent if properly written)
- If a task was not completed but checked off → it gets skipped (fix: uncheck it manually)

### maxPhases Exceeded
- chain-continue.sh checks phase count against maxPhases before spawning
- If exceeded → marks chain "stopped" with reason "maxPhases exceeded"
- Recovery: increase maxPhases in chain-plan.json and run `/chain` again

### Concurrent Chains
- Only one chain can be active at a time
- `/chain` checks for existing running chain-plan.json before starting
- If found → error: "Chain already running. Use /chain-stop first."
