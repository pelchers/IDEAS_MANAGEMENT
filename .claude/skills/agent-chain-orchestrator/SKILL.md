---
name: agent-chain-orchestrator
description: Chain-aware agent behavior with 4 granularity modes, ADR task list validation, and frontend spec coherence.
---

## Purpose
Defines how each agent in a chain should behave — reading the chain plan, executing assigned work, checking off tasks, writing completion signals, and bridging context to the next agent.

## On Startup (every chained agent)
1. Read `.claude/orchestration/chain-plan.json` → identify current phase
2. Read `.adr/orchestration/<SESSION>/primary_task_list.md` → find assigned tasks
3. If phase involves frontend work → read `frontend_spec.md` (session-level, then root default)
4. If frontend_spec.md missing and frontend work detected → HALT and ask user
5. Read previous phase's ingest summary from `.adr/agent_ingest/` for context
6. Read `CLAUDE.md` for project conventions

## During Execution
1. Follow FEA process if `feaMode: true` in chain-plan.json (audit → build → validate)
2. For each completed deliverable: change `- [ ]` to `- [x]` in primary_task_list.md
3. Commit after each logical unit of work
4. Add CLI scripts to `package.json` under `data:*` if applicable
5. Run Playwright E2E tests for affected features
6. If frontend work: verify output matches frontend_spec.md reference

## On Completion
1. Re-read primary_task_list.md → count remaining unchecked items
2. Determine signal type based on mode and remaining work:
   - `--per-task`: wrote one item → `[CHAIN:TASK_COMPLETE]`
   - `--per-phase`: all items in phase done → `[CHAIN:PHASE_COMPLETE]`
   - `--per-subfolder`: all phases done → `[CHAIN:SUBFOLDER_COMPLETE]`
   - No more work in range → `[CHAIN:ORCHESTRATION_COMPLETE]`
3. Write `.claude/orchestration/chain-signal.txt` with signal + metadata
4. Write ingest summary to `.adr/agent_ingest/chain-<chainId>-phase-<N>.md`
5. Commit all changes
6. Exit cleanly (Stop hook handles the rest)

## Signal File Format
```
[CHAIN:<SIGNAL_TYPE>]
subfolder=<current_subfolder_name>
phase=<current_phase_number>
tasks_completed=<count>
tasks_remaining=<count>
next_subfolder=<next | none>
next_phase=<next | none>
commit_sha=<sha>
timestamp=<ISO 8601>
```

## Frontend Phase Reading Order (MANDATORY)
Before writing ANY .tsx or .css file, read these in this exact order:
1. `frontend_spec.md` — session-level first, then root default. If contains "ACTION REQUIRED", ask user for design input before proceeding.
2. The referenced prototype/URL/spec from step 1 — read the actual HTML file, or screenshot the URL
3. `CLAUDE.md` — project conventions, architecture, design system info
4. `.adr/orchestration/<SESSION>/prd.md` (if exists) — what's being built and why
5. `.adr/orchestration/<SESSION>/technical_requirements.md` (if exists) — tech constraints
6. The specific prototype HTML for the page being built — e.g. school-profile.html if building the school profile

After building: validate with Playwright screenshot comparison against the reference.

## Task List Parsing
- Phase headings: lines matching `## Phase <N>`
- Tasks: lines matching `- [ ]` (pending) or `- [x]` (done)
- Indented sub-bullets are notes, not separate tasks
- Blank phases (all checked) are skipped

## Constraints
- Never modify existing agents/skills/hooks (except adr-setup additive changes)
- Always commit after each logical unit
- Always write chain-signal.txt as the LAST action before exit
- Always write ingest summary for context bridging
- Never skip validation — Playwright tests are mandatory

## Orchestration Modes

### Default Mode (`--default` or no flag)
Hook-based orchestration. No persistent manager. The Stop hook (`chain-continue.sh`) reads the signal file and spawns the next agent automatically. chain-plan.json has `"orchestrationMode": "hook"`.

### Orchestrated Mode (`--orchestrated`)
Persistent orchestrator agent manages the chain. chain-plan.json has `"orchestrationMode": "orchestrated"`.

When `orchestrationMode` is `"orchestrated"`:
- The Stop hook (`chain-continue.sh`) does NOT spawn the next agent — it exits early
- The `orchestrator-chain-agent` manages spawning via the Agent tool
- Subagents stay alive for feedback loops (orchestrator can SendMessage to fix issues)
- The orchestrator validates each phase before accepting it

### Orchestrated Mode Behavior (for the orchestrator agent)
When running as the orchestrator (NOT as a subagent):
1. You ARE the persistent manager — do NOT write chain-signal.txt yourself
2. Use the Agent tool to spawn chain-agent for each phase
3. After each subagent returns, run the Post-Phase Validation Checklist:
   - Were task list items checked off?
   - Was chain-signal.txt written by the subagent?
   - Did the subagent commit its work?
   - Does the output match frontend_spec.md? (if frontend work)
   - Do full E2E tests still pass? (regression check)
   - Do new components integrate with existing ones?
4. If validation fails: SendMessage to the subagent with specific, actionable feedback
5. Allow up to 3 feedback loops per phase, then escalate to user
6. After all phases: run final E2E suite, write chain-report.md, mark chain completed

### Post-Phase Validation Checklist (orchestrator performs)
```markdown
1. Task Completion
   - [ ] All assigned items marked [x] in primary_task_list.md
   - [ ] chain-signal.txt written with correct signal type
   - [ ] Git commit made

2. Frontend Spec Coherence (if UI work)
   - [ ] Output matches frontend_spec.md reference
   - [ ] Design tokens used correctly
   - [ ] Layout matches prototype structure

3. Regression Check
   - [ ] Full E2E suite passes
   - [ ] Test count same or higher
   - [ ] Previously-passing pages still render

4. Integration Check
   - [ ] Works with global components (nav, footer, Cmd+K)
   - [ ] New API endpoints return correct data
   - [ ] New pages accessible from navigation

5. Code Quality
   - [ ] No hardcoded values (should use design tokens)
   - [ ] No debug code left in
   - [ ] Clean imports
```
