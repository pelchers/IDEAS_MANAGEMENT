# Agent Chaining System — Usage Guide

This guide covers everything you need to start, monitor, control, and troubleshoot chains.
For the technical architecture, see `ARCHITECTURE.md` in this folder.

---

## Prerequisites

Before running any `/chain` command, confirm the following are in place.

### 1. ADR Folder Structure

The chain reads work from ADR orchestration subfolders. Each subfolder you intend to chain must have:

```
.adr/orchestration/
├── primary_task_list.md          ← root master list (optional, for --full mode)
└── <N>_SESSION_NAME/
    ├── primary_task_list.md      ← REQUIRED — task list with ## Phase and - [ ] items
    ├── prd.md                    ← product requirements
    ├── technical_requirements.md ← technical spec
    └── notes.md                  ← working notes
```

If any targeted subfolder is missing its `primary_task_list.md`, the chain will error out before starting. Run the `adr-setup` agent first to scaffold missing sessions.

### 2. Task Lists with Checkboxes

The chain's source of truth is markdown checkboxes inside `primary_task_list.md`. The format must be:

```markdown
## Phase 1 - Short Phase Title
- [x] Completed deliverable (will be skipped)
- [ ] Pending deliverable (will be picked up)

## Phase 2 - Another Phase
- [ ] Pending deliverable
- [ ] Another pending deliverable
```

Rules:
- Phase headings must start with `## Phase` (case-sensitive)
- Tasks must be `- [ ]` (unchecked) or `- [x]` (checked, already done)
- Indented sub-bullets under a task are treated as notes, not separate tasks
- Blank phases (all items checked) are skipped automatically

### 3. Frontend Spec (for sessions with UI work)

If any session in your chain involves frontend development, it must have a `frontend_spec.md`. See the **Frontend Spec Setup** section below. Without it, the chain agent will halt and ask you to provide one before continuing.

### 4. `orchestrator-poke.ps1` Must Be Reachable

The chain relies on `.claude/hooks/scripts/orchestrator-poke.ps1` to spawn the next agent. Verify the hook is registered in `.claude/hooks/settings.json` under the `Stop` event. If hooks are not firing, check that Claude Code hook execution is enabled for this project.

---

## Quick Start Examples

### Mode 1: `--per-task`

One agent per individual checkbox. Maximum granularity — each agent does exactly one deliverable, checks it off, and exits.

**Best for:** Large, complex tasks where you want to review progress after each item. Sessions with mixed risk (some tasks safe to auto-run, some risky).

```bash
# Run a single session, one task at a time
/chain 3_FRONTEND_DEVELOPMENT --per-task

# Run a range of sessions, one task at a time
/chain 2 - 5 --per-task
```

What happens:
1. Chain scans `3_FRONTEND_DEVELOPMENT/primary_task_list.md` for the first unchecked `- [ ]` item
2. Spawns Agent 1 to complete that one item
3. Agent checks the item off, writes `[CHAIN:TASK_COMPLETE]`, exits
4. Hook finds the next unchecked item, spawns Agent 2
5. Continues until all items in the subfolder are checked

---

### Mode 2: `--per-phase`

One agent per `## Phase N` section. Each agent completes all tasks within a single phase.

**Best for:** Normal development flow. Phases are natural units of work (scaffold → tokens → components → pages). Good balance between autonomy and review cadence.

```bash
# Run one session, one phase at a time
/chain 3_FRONTEND_DEVELOPMENT --per-phase

# Run a range, one phase at a time
/chain 3_FRONTEND_DEVELOPMENT - 5_USER_STORY_TESTING --per-phase

# Shorthand number range
/chain 3 - 5 --per-phase
```

What happens:
1. Chain scans for the first phase with any unchecked items
2. Spawns Agent 1 with scope: "complete all tasks in Phase N"
3. Agent completes all items in that phase, writes `[CHAIN:PHASE_COMPLETE]`, exits
4. Hook finds the next phase with unchecked items, spawns Agent 2
5. When all phases in the subfolder are done → writes `[CHAIN:SUBFOLDER_COMPLETE]`
6. Hook moves to next subfolder in the range

---

### Mode 3: `--per-subfolder`

One agent per ADR session subfolder. Each agent completes the entire subfolder — all phases and all tasks.

**Best for:** Running a single ADR session end-to-end without interruption. Sessions where all phases are related and context continuity matters.

```bash
# Run a single session end-to-end
/chain 9_DYNAMIC_NAV_AND_DATA_INGESTION --per-subfolder

# Run a range of sessions, one full session per agent
/chain 2_BACKEND_DEVELOPMENT - 4_INTEGRATION_AND_WIRING --per-subfolder

# Full path also works
/chain .adr/orchestration/2_BACKEND_DEVELOPMENT --per-subfolder
```

What happens:
1. Agent 1 takes ownership of `2_BACKEND_DEVELOPMENT`
2. Works through ALL phases and ALL tasks in that subfolder
3. When the entire `primary_task_list.md` is fully checked → writes `[CHAIN:SUBFOLDER_COMPLETE]`
4. Hook moves to `3_FRONTEND_DEVELOPMENT`, spawns Agent 2
5. Continues through `4_INTEGRATION_AND_WIRING`

---

### Mode 4: `--full`

Runs the entire ADR orchestration tree. Equivalent to `--per-subfolder` across all subfolders that have unchecked work.

**Best for:** Starting a fresh project from scratch, or resuming a fully-planned project after a long break.

```bash
# Full orchestration tree
/chain adr/orchestration

# Explicit full mode flag (same result)
/chain adr/orchestration --full

# Windows-style path works too
/chain adr\orchestration
```

What happens:
1. Chain scans `.adr/orchestration/` for all numeric-prefixed subfolders (`1_*`, `2_*`, etc.)
2. Filters to subfolders with unchecked work
3. Runs each subfolder via per-subfolder mode in numeric order
4. When all subfolders are done → `[CHAIN:ORCHESTRATION_COMPLETE]`

---

## Range Syntax

Ranges let you target a slice of the ADR tree without typing full paths.

### Number Range (shorthand)

```bash
/chain 2 - 5                    # sessions 2, 3, 4, 5
/chain 2 - 5 --per-phase        # same range, per-phase mode
/chain 6 - 8 --per-subfolder    # sessions 6, 7, 8
```

Numbers are matched to subfolder prefixes: `2` matches `2_BACKEND_DEVELOPMENT`, `5` matches `5_USER_STORY_TESTING`, etc.

### Named Range

```bash
/chain 3_FRONTEND_DEVELOPMENT - 5_USER_STORY_TESTING
/chain 2_BACKEND - 10_SUBSCRIPTIONS --per-subfolder
```

Named ranges strip numeric prefixes and match the first subfolder where the leading number falls in the range. Partial names work as long as they're unambiguous.

### Single Target

```bash
/chain 9_DYNAMIC_NAV_AND_DATA_INGESTION
/chain .adr/orchestration/3_FRONTEND_DEVELOPMENT
```

A single subfolder name without a range dash is treated as a single-target chain.

### Range Resolution Rules

1. If the argument starts with `.adr/` — use as-is
2. If it's a bare subfolder name — prepend `.adr/orchestration/`
3. If it's `adr/orchestration` or `adr\orchestration` — prepend `.`
4. If it's just a number — match the subfolder with that numeric prefix

Invalid ranges (e.g., start > end, unknown subfolder names) cause an immediate error before any agent is spawned.

---

## Checking Progress

### `/chain-status`

```bash
/chain-status
```

Returns a summary of the current chain state from `chain-plan.json`:

```
Chain: 3_FRONTEND - 5_USER_STORY, mode: per-phase
Status: running
Progress: 2 of 9 phases complete
Current: 3_FRONTEND_DEVELOPMENT / Phase 8
Remaining phases: Phase 9 (session 3), Phase 7 (session 5)
Last signal: [CHAIN:PHASE_COMPLETE] Phase 8 — 8 tasks, committed abc1234
```

If no chain is active, `/chain-status` reports "No active chain."

### Manual Check

Inspect the state file directly:

```
.claude/orchestration/chain-plan.json     ← current chain state
.claude/orchestration/chain-signal.txt    ← exists only between agent exit and hook run
.claude/orchestration/logs/               ← per-agent stdout/stderr logs
.claude/orchestration/history/            ← archived next_phase.json files
.adr/agent_ingest/                        ← ingest summaries from completed agents
```

---

## Stopping a Running Chain

### `/chain-stop`

```bash
/chain-stop
```

Sets `chain-plan.json` status to `"stopped"`. The Stop hook reads this status before spawning the next agent — if status is `"stopped"`, it does nothing. The current agent finishes its work naturally; no agent is mid-session interrupted.

To resume after stopping: fix whatever needed fixing, then re-run `/chain` with the same range and mode. The chain will skip all already-checked items and pick up from the first unchecked one.

### Pause After a Specific Phase

Set `pauseAfterPhase` in `chain-plan.json` before the chain reaches that phase:

```json
{
  "pauseAfterPhase": "3_FRONTEND_DEVELOPMENT/Phase 8"
}
```

When the hook fires after that phase completes, it marks the chain paused instead of spawning the next agent. Resume by clearing `pauseAfterPhase` and running `/chain-status` to restart.

---

## Setting Up `frontend_spec.md`

Frontend spec files tell chain agents which design to follow. Without one, agents doing UI work will halt and ask you to provide it.

### When Is It Required?

Any chain phase that involves frontend work (keywords: "frontend", "UI", "page", "component", "React", "Tailwind") triggers a spec lookup.

### Resolution Order

1. `.adr/orchestration/<SESSION>/frontend_spec.md` — session-specific spec (takes priority)
2. `.adr/orchestration/frontend_spec.md` — root default for all sessions
3. Neither exists → agent halts

### Type 1: Internal Prototype

Use this when you have HTML/CSS prototype files in the repo.

```markdown
# Frontend Specification Reference

Session: 3_FRONTEND_DEVELOPMENT
Date: 2026-03-05

## Spec Source Type
- [x] Internal prototype

## Design System
- Active Design: Brutalism Pass 1 ("Raw Concrete Campus")
- Prototype Path: .docs/planning/frontend/concepts-next/brutalism/pass-1/
- Design Tokens: packages/ui-tokens/src/tokens.ts
- Tailwind Preset: packages/ui-tokens/tailwind-preset.ts

## Reference Pages
| App View | Reference File |
|---|---|
| School Discovery | school-discovery.html |
| School Profile | school-profile.html |
| Rankings | rankings.html |
| Compare | compare.html |

## Coherence Rules
1. Read the relevant prototype HTML before building each page
2. Match layout structure, element hierarchy, and interactions
3. Use only colors from ui-tokens
4. New pages without a direct reference follow school-profile.html patterns
```

The agent reads the HTML files directly from the prototype path and converts them to React/Tailwind.

### Type 2: External Reference

Use this when the spec lives outside the repo (Figma, a live website, screenshots).

```markdown
## Spec Source Type
- [x] External reference

## Reference
- URL: https://figma.com/file/abc123/campus-v2
- Screenshot: .docs/planning/frontend/external-spec-screenshot.png
- Notes: Follow the card layout from frame "School Profile v2"
```

The agent reads the screenshot (multimodal) or navigates to the URL with Playwright to capture it before building.

### Type 3: Chat-Prompted Spec

Use this when you've described the design in text — either from a previous chat or written directly into the file.

```markdown
## Spec Source Type
- [x] Chat-prompted spec

## Reference
User specification:
- Persistent top navbar: logo left, school selector center, profile right
- Brutalism styling: 4px borders, 8px hard shadows, monospace typography
- Colors: #1A1A1A primary, #FF3366 accent, #00FF88 secondary accent
- Cards: white fill, 4px black border, 8px black shadow offset, hover lifts shadow
- Typography: JetBrains Mono for code/data, Space Mono for headings
```

The agent follows the text spec literally. Be explicit — vague descriptions produce vague output.

### Type 4: Similarity Match

Use this when you want a new session to follow an existing pass but diverge on specific elements.

```markdown
## Spec Source Type
- [x] Similarity match

## Reference
- Match Pass: brutalism pass-1 (85% match target)
- Diverge On: navigation layout (use persistent top bar instead of FAB)
- Keep Identical: color tokens, typography, card styling, spacing
- Reference Page: school-profile.html
```

Useful for building variant designs or adapting the system for a new platform (e.g., mobile-first).

### Combining Types

Multiple types can be checked:

```markdown
## Spec Source Type
- [x] Internal prototype
- [x] Chat-prompted spec

## Reference
- Layout: Follow .docs/planning/frontend/concepts-next/brutalism/pass-1/school-profile.html
- Navigation override: persistent top bar per chat spec below

## Chat Spec Overrides
- Top navbar: sticky 60px, logo left, school selector center, profile icon right
- Replace FAB with top bar on all pages
```

---

## Troubleshooting

### Chain Stalls (No New Agent Spawns)

**Symptom:** The last agent exited but no new agent started after 30–60 seconds.

**Diagnosis steps:**

1. Check if `chain-signal.txt` was written:
   ```
   .claude/orchestration/chain-signal.txt
   ```
   If missing, the agent exited without writing a signal — the hook had nothing to act on.

2. Check the last agent's log:
   ```
   .claude/orchestration/logs/subagent_<timestamp>.log
   .claude/orchestration/logs/subagent_<timestamp>_err.log
   ```
   Look for crash messages, unhandled errors, or the absence of the signal write step.

3. Check `chain-plan.json` status:
   ```json
   { "status": "stopped" }   ← chain was stopped intentionally or hit an error
   { "status": "running" }   ← hook should have fired
   { "status": "completed" } ← chain finished normally
   ```

4. Check if the Stop hook is registered:
   In `.claude/hooks/settings.json`, confirm there is a `Stop` entry calling `orchestrator-poke.ps1`.

**Recovery:**
- If the agent crashed without writing the signal, manually write the signal file and re-run the poke:
  ```
  echo "[CHAIN:TASK_COMPLETE]" > .claude/orchestration/chain-signal.txt
  powershell -File .claude/hooks/scripts/orchestrator-poke.ps1
  ```
- If `chain-plan.json` is corrupted, manually set `"status": "running"` and write the correct `next_phase.json`, then re-run the poke.

---

### Resuming After Interruption

Because the chain uses checkboxes as state, resuming is straightforward:

1. Run the same `/chain` command you used originally
2. The chain re-scans the task lists
3. Already-checked items are skipped automatically
4. The chain picks up at the first unchecked item

No manual state repair needed as long as the agent that was interrupted committed its checkboxes before crashing.

If the agent crashed before committing:
- Manually check off the items it completed (or leave them unchecked to redo them)
- Re-run the `/chain` command

---

### Skipping a Phase

To skip a phase you don't want to run:

1. Open the phase's `primary_task_list.md`
2. Mark all items in that phase as checked: change `- [ ]` to `- [x]`
3. Commit the change
4. Re-run or resume the chain — the hook will skip that phase entirely

---

### Agent Builds Wrong Design

**Symptom:** The agent produced UI that doesn't match the design spec.

**Cause:** `frontend_spec.md` is missing, incomplete, or the agent didn't read it.

**Fix:**
1. Create or update `frontend_spec.md` with an explicit spec (Type 1 or Type 3 are most reliable)
2. Add a `Coherence Rules` section with explicit instructions
3. Uncheck the affected tasks
4. Resume the chain

---

### "frontend_spec.md not found" Halt

The agent stopped because it detected frontend work but couldn't find a spec file.

**Fix:** Create `.adr/orchestration/<SESSION>/frontend_spec.md` (or the root default) with any of the four source types. The simplest to create quickly is Type 3 (chat-prompted spec) — just paste your design requirements.

---

## Tips: Choosing the Right Mode

| Situation | Recommended Mode |
|---|---|
| First time running a session, want to review each deliverable | `--per-task` |
| Normal development flow, phases are well-defined | `--per-phase` |
| Session is tightly coupled (all phases share heavy context) | `--per-subfolder` |
| Starting fresh or resuming a fully-planned project | `--full` |
| Risky session (DB migrations, auth changes) | `--per-task` or `--per-phase` |
| Well-tested session (repeatable test validation) | `--per-subfolder` |
| Multiple sessions with independent scopes | `--per-subfolder` with range |
| Need to audit every individual change | `--per-task` |

**General rule:** Start with `--per-phase` for most sessions. Drop to `--per-task` when you want more control. Move up to `--per-subfolder` when a session is stable and well-understood.

---

## Common Command Reference

```bash
# Start chains
/chain 3_FRONTEND_DEVELOPMENT --per-phase
/chain 3 - 5 --per-phase
/chain 2_BACKEND - 8_PRODUCTION --per-subfolder
/chain adr/orchestration --full

# Monitor
/chain-status

# Stop
/chain-stop
```
