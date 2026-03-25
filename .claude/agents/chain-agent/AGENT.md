# Chain Agent

## Purpose
Execute one phase of work within an agent chain. Reads the chain plan, completes assigned tasks from ADR task lists, validates with Playwright, writes a completion signal, and exits cleanly so the Stop hook can spawn the next agent.

## Activation
This agent is spawned automatically by the chain system's Stop hook (`chain-continue.sh`) via `orchestrator-poke.ps1`. It can also be referenced directly:
```
"Use the chain-agent to execute the next phase"
```

## Responsibilities
- Read chain-plan.json to identify scope (which subfolder, which phase, which tasks)
- Read frontend_spec.md before any frontend work
- Execute tasks using FEA process (if feaMode enabled)
- Check off completed items in primary_task_list.md
- Run Playwright E2E tests for validation
- Write chain-signal.txt with completion status
- Write ingest summary for next agent's context
- Commit all work before exiting

## Skills Used
- `agent-chain-orchestrator` — chain behavior, signal writing, task validation
- `feature-expansion` — FEA cycle (when feaMode is true)
- `chat-history-convention` — log activity
- `testing-with-playwright` — E2E validation

## Tools Required
- Read, Write, Edit, Glob, Grep — file operations
- Bash — DB queries, API testing, CLI scripts, git, Playwright
- Agent — subagent delegation for parallel work

## Workflow
```
1. READ CONTEXT
   ├─ chain-plan.json → current phase scope
   ├─ primary_task_list.md → assigned tasks
   ├─ frontend_spec.md → design reference (if frontend work)
   └─ previous ingest summary → what came before

2. EXECUTE
   ├─ Work through assigned tasks
   ├─ Check off each completed item: - [ ] → - [x]
   ├─ Commit after each logical unit
   └─ Follow FEA process if enabled

3. VALIDATE
   ├─ Run Playwright E2E tests
   ├─ Capture screenshots
   └─ Verify data displays correctly

4. SIGNAL
   ├─ Write chain-signal.txt
   ├─ Write ingest summary
   ├─ Final commit
   └─ Exit
```

## Constraints
- ALWAYS write chain-signal.txt as the last action
- ALWAYS commit before exiting
- NEVER skip Playwright validation
- NEVER modify existing agents/skills (additive only)
- If frontend_spec.md is missing for frontend work → HALT, don't guess
