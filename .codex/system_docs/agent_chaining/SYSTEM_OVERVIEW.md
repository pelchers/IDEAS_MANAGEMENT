# Agent Chaining System — Complete Architecture Reference

## Design Principles
1. **All new components** — zero edits to existing agents/skills/hooks (except adr-setup additive enhancement)
2. **ADR task lists are the source of truth** — not a separate queue file
3. **Frontend spec coherence guaranteed** — spec reference baked into ADR setup
4. **Flexible granularity** — 4 modes from single task to full orchestration
5. **Flexible invocation** — path-based, range syntax, shorthand numbers

---

## A. Four Granularity Modes

| Mode | Flag | What Gets Its Own Agent | Signal to Chain |
|---|---|---|---|
| `--per-task` | One agent per checkbox `- [ ]` item | Agent does one deliverable, checks it off, exits | `[CHAIN:TASK_COMPLETE]` |
| `--per-phase` | One agent per `## Phase N` section | Agent completes all `- [ ]` items under that phase heading, exits | `[CHAIN:PHASE_COMPLETE]` |
| `--per-subfolder` | One agent per session subfolder | Agent works through ALL phases + tasks in that subfolder's task list, exits | `[CHAIN:SUBFOLDER_COMPLETE]` |
| `--full` | Entire orchestration tree | Runs per-subfolder across all subfolders with unchecked work | `[CHAIN:ORCHESTRATION_COMPLETE]` |

### ADR Task List Structure (source of truth)

```
.adr/orchestration/
├── primary_task_list.md              ← Master list referencing all subfolders
├── frontend_spec.md                  ← Root default frontend spec
├── 3_FRONTEND_DEVELOPMENT/
│   ├── primary_task_list.md          ← Per-subfolder task list
│   │   ## Phase 1
│   │   - [x] Deliverable A           ← Individual task (--per-task granularity)
│   │   - [x] Deliverable B
│   │   ## Phase 2                     ← Phase boundary (--per-phase granularity)
│   │   - [ ] Deliverable C
│   │   - [ ] Deliverable D
│   ├── frontend_spec.md              ← Session-specific frontend spec
│   ├── prd.md
│   ├── technical_requirements.md
│   └── notes.md
├── 9_DYNAMIC_NAV_AND_DATA_INGESTION/ ← Subfolder boundary (--per-subfolder granularity)
│   ├── primary_task_list.md
│   └── notes.md
└── 10_SUBSCRIPTIONS_AND_PAYMENTS/
    └── ...
```

### Signal Detection Logic

Per-task mode:
```
Agent checks off one - [ ] item → writes [CHAIN:TASK_COMPLETE]
Hook → finds next unchecked item in same phase → spawns agent
If phase has no more items → finds next phase with unchecked items
If subfolder has no more phases → [CHAIN:SUBFOLDER_COMPLETE]
```

Per-phase mode:
```
Agent works all - [ ] items under ## Phase N
All items checked → writes [CHAIN:PHASE_COMPLETE]
Hook → finds next phase heading with unchecked items → spawns agent
If no more phases → [CHAIN:SUBFOLDER_COMPLETE]
```

Per-subfolder mode:
```
Agent works ALL phases and ALL tasks in one subfolder
Entire primary_task_list.md has zero unchecked → [CHAIN:SUBFOLDER_COMPLETE]
Hook → finds next subfolder with unchecked work → spawns agent
If no more subfolders → [CHAIN:ORCHESTRATION_COMPLETE]
```

---

## B. Path-Based Invocation

### Single Target
```bash
/chain 9_DYNAMIC_NAV_AND_DATA_INGESTION              # one subfolder
/chain .adr/orchestration/3_FRONTEND_DEVELOPMENT      # full path
/chain adr/orchestration                               # entire tree (--full implied)
/chain adr\orchestration                               # Windows slashes work too
```

### Range of Subfolders (dash syntax)
```bash
/chain 3_FRONTEND_DEVELOPMENT - 5_USER_STORY_TESTING  # sessions 3, 4, 5
/chain 2_BACKEND - 10_SUBSCRIPTIONS --per-subfolder    # sessions 2 through 10
/chain 2 - 5 --per-phase                               # shorthand numbers
```

### Path Resolution
1. If starts with `.adr/` — use as-is
2. If it's a subfolder name (e.g. `9_DYNAMIC...`) — prepend `.adr/orchestration/`
3. If it's `adr/orchestration` or `adr\orchestration` — prepend `.`
4. If it's just a number — match to subfolder with that numeric prefix

### Range Parsing
1. Strip `.adr/orchestration/` prefix if present
2. Extract leading number from each argument
3. List all subfolders matching `[0-9]*_*`
4. Filter to range [start, end] inclusive
5. Sort by number
6. Create chain phases for each

---

## C. Frontend Spec Coherence

### The Problem
When the longrunning orchestrator spawns subagents for frontend work, subagents sometimes ignore the reference design spec. The spec path gets lost in the prompt chain because it exists only in the user's initial prompt, not in the ADR session files.

### The Solution: `frontend_spec.md`

A file that lives alongside the other ADR session files, containing explicit references to the design spec that MUST be followed.

### Location & Resolution Order
1. **Session-level** (primary): `.adr/orchestration/<SESSION>/frontend_spec.md`
2. **Root-level** (fallback): `.adr/orchestration/frontend_spec.md`
3. **Neither exists + frontend work** → agent STOPS and asks user to specify

### Spec Source Types

#### Type 1: Internal Prototype
```markdown
## Spec Source Type
- [x] Internal prototype

## Reference
- Path: `.docs/planning/frontend/concepts-next/brutalism/pass-1/`
- Pages: school-profile.html, academics.html, rankings.html
- Design Tokens: `packages/ui-tokens/src/tokens.ts`
```
Agent reads actual HTML prototype files and matches their structure.

#### Type 2: External Reference
```markdown
## Spec Source Type
- [x] External reference

## Reference
- URL: https://figma.com/file/abc123/campus-v2
- Screenshot: `.docs/planning/frontend/external-spec-screenshot.png`
- Notes: Follow the card layout from frame "School Profile v2"
```
Agent reads screenshot (multimodal) or uses Playwright to capture live URL.

#### Type 3: Chat-Prompted Spec
```markdown
## Spec Source Type
- [x] Chat-prompted spec

## Reference
User specification (captured from chat):
- Persistent top navbar: logo left, school selector center, profile right
- Brutalism styling: 4px borders, hard shadows, monospace typography
- Color scheme: #1A1A1A primary, #FF3366 accent, #00FF88 secondary
```
Agent follows text spec exactly.

#### Type 4: Similarity Match
```markdown
## Spec Source Type
- [x] Similarity match

## Reference
- Match Pass: brutalism pass-1 (85% match target)
- Diverge On: navigation layout (use persistent top bar instead of FAB)
- Keep Identical: color tokens, typography, card styling, spacing
- Reference Page: school-profile.html
```
Agent keeps most patterns, diverges only where specified.

### How Chain Agents Use It
Before any frontend work:
1. Read `frontend_spec.md` (session-level, then root fallback)
2. Read the referenced prototype/screenshot/spec
3. Match patterns from the reference
4. If missing → halt and request from user

---

## D. Chain Agent Task List Validation

### On Startup
1. Read chain-plan.json → identify current phase/subfolder
2. Read `.adr/orchestration/<SESSION>/primary_task_list.md`
3. Parse unchecked items → confirm assigned task exists
4. Read `frontend_spec.md` if phase involves UI work
5. Read previous phase's ingest summary for context

### During Execution
1. Follow FEA process (if enabled) for each task
2. After completing each deliverable, check it off: `- [ ]` → `- [x]`
3. Commit the task list update

### On Completion
1. Re-read primary_task_list.md
2. Count remaining unchecked items
3. Write `.claude/orchestration/chain-signal.txt`:
   - `[CHAIN:TASK_COMPLETE] Task "Add navbar" done. 2 tasks remaining in phase.`
   - `[CHAIN:PHASE_COMPLETE] Phase 8 done. Moving to next phase.`
   - `[CHAIN:SUBFOLDER_COMPLETE] All tasks in 9_DYNAMIC_NAV done.`
   - `[CHAIN:ORCHESTRATION_COMPLETE] All subfolders in range complete.`
4. Write ingest summary to `.adr/agent_ingest/`
5. Exit cleanly → Stop hook fires

---

## E. Signal File Mechanism

### Why a file instead of stdout
- stdout may be truncated or buffered
- File is deterministic — exists with signal or doesn't
- Agent is instructed to ALWAYS write this as its last action

### Signal File Format
**File:** `.claude/orchestration/chain-signal.txt`
```
[CHAIN:PHASE_COMPLETE]
subfolder=3_FRONTEND_DEVELOPMENT
phase=8
tasks_completed=8
tasks_remaining=0
next_subfolder=5_USER_STORY_TESTING
next_phase=7
commit_sha=abc123
```

### Stop Hook Logic (`chain-continue.sh`)
```
1. Read chain-signal.txt (if missing → do nothing, exit)
2. Parse signal type
3. Read chain-plan.json for current state
4. Based on signal:
   TASK_COMPLETE → find next unchecked item → write next_phase.json → poke
   PHASE_COMPLETE → find next phase with unchecked items → write next_phase.json → poke
   SUBFOLDER_COMPLETE → find next subfolder in range → write next_phase.json → poke
   ORCHESTRATION_COMPLETE → mark chain completed, stop
5. Delete chain-signal.txt (consumed)
6. Call orchestrator-poke.ps1 (existing) to spawn claude exec
```

---

## F. Complete Flow Example

### `/chain 3_FRONTEND - 5_USER_STORY --per-phase`

```
User: /chain 3_FRONTEND - 5_USER_STORY --per-phase
  │
  ├─ Resolves range: sessions 3, 4, 5
  ├─ Reads each subfolder's primary_task_list.md
  ├─ Identifies unchecked phases:
  │   Session 3: Phase 8 (8 items unchecked)
  │   Session 4: complete (skip)
  │   Session 5: Phase 7 (1 item unchecked)
  │
  ├─ Creates chain-plan.json:
  │   mode: "per-phase"
  │   phases: [
  │     { subfolder: "3_FRONTEND", phase: 8, items: 8 },
  │     { subfolder: "5_USER_STORY", phase: 7, items: 1 }
  │   ]
  │
  ├─ AGENT 1: Session 3, Phase 8
  │   ├─ Reads .adr/orchestration/3_FRONTEND/frontend_spec.md
  │   │   → brutalism pass-1, reads school-discovery.html prototype
  │   ├─ Works all 8 items: pagination, card layout, N/A display, tags,
  │   │   empty states, logo fallback, wire academics, wire rankings
  │   ├─ Checks each [x] in primary_task_list.md
  │   ├─ All Phase 8 items done → writes chain-signal.txt:
  │   │   [CHAIN:PHASE_COMPLETE] subfolder=3_FRONTEND phase=8
  │   └─ Exits
  │
  ├─ STOP HOOK fires
  │   ├─ chain-continue.sh reads chain-signal.txt
  │   ├─ Reads chain-plan.json → phase 1 of 2 done
  │   ├─ Reads agent 1's ingest summary for context
  │   ├─ Writes next_phase.json:
  │   │   { prompt: "Phase 2: Session 5, Phase 7. Prior: 3_FRONTEND Phase 8 done...",
  │   │     agent: "chain-agent", autoSpawn: true }
  │   └─ Calls orchestrator-poke.ps1 → spawns claude exec
  │
  ├─ AGENT 2: Session 5, Phase 7 (fresh context)
  │   ├─ SessionStart hook loads chain context
  │   ├─ Reads frontend_spec.md (root default — no session-level file)
  │   ├─ Runs data enrichment validation tests
  │   ├─ Checks item off → all Phase 7 items done
  │   ├─ No more phases in session 5, no more subfolders in range
  │   ├─ Writes: [CHAIN:ORCHESTRATION_COMPLETE]
  │   └─ Exits
  │
  └─ STOP HOOK fires
      ├─ Detects ORCHESTRATION_COMPLETE
      ├─ Marks chain-plan.json status: "completed"
      └─ Logs: "Chain complete. 2 agents, 9 tasks, 0 failures."
```

---

## G. Complete Component Map

### New Components (all additive)

| # | File | Type | Purpose |
|---|---|---|---|
| 1 | `.claude/orchestration/chain-plan.json` | State | Chain state: mode, phases, progress |
| 2 | `.claude/orchestration/chain-signal.txt` | Signal | Agent writes catch phrase on completion |
| 3 | `.claude/hooks/scripts/chain-continue.sh` | Stop hook | Reads signal → writes next_phase.json → calls poke |
| 4 | `.claude/hooks/scripts/chain-session-init.sh` | SessionStart hook | Loads chain context + frontend spec |
| 5 | `.claude/skills/agent-chain-orchestrator/SKILL.md` | Skill | Chain behavior: 4 modes, ADR validation, spec coherence |
| 6 | `.claude/agents/chain-agent/AGENT.md` | Agent | Chain execution persona |
| 7 | `.claude/commands/chain.md` | Command | `/chain <path> [- <path>] [--mode]` |
| 8 | `.claude/commands/chain-status.md` | Command | `/chain-status` |
| 9 | `.claude/commands/chain-stop.md` | Command | `/chain-stop` |
| 10 | `.claude/system_docs/agent_chaining/` | System docs | Architecture reference (this folder) |
| 11 | `.claude/skills/adr-setup/templates/frontend_spec_template.md` | Template | Frontend spec template |

### Existing Components Modified (minimal, additive only)

| # | File | Change | Lines Added |
|---|---|---|---|
| 12 | `.claude/skills/adr-setup/SKILL.md` | Add `frontend_spec.md` requirement | ~20 lines |
| 13 | `.claude/hooks/settings.json` | Append 2 new hook entries | ~15 lines |

### Existing Components Reused (NOT modified)

| Component | How Reused |
|---|---|
| `orchestrator-poke.ps1` | Called by chain-continue.sh to spawn `claude exec` |
| `longrunning-session` skill | Validation patterns (Playwright, user stories) |
| `orchestrator-session` skill | Phase review + history patterns |
| `ingesting-agent-history` skill | Ingest summary format for context bridging |
| `feature-expansion` skill | FEA cycle within phases (optional) |

---

## H. Safety & Guardrails

| Control | Mechanism |
|---|---|
| Max phases | `maxPhases` in chain-plan.json (default 20) |
| Emergency stop | `/chain-stop` sets status to "stopped" |
| Pause point | `pauseAfterPhase` in chain-plan.json |
| No signal = no chain | Missing chain-signal.txt → hook does nothing |
| Git savepoints | Every phase commits before exit |
| Ingest summaries | Every phase writes to `.adr/agent_ingest/` |
| Frontend coherence | `frontend_spec.md` read before UI work; agent halts if missing |
| Task list validation | Agent verifies assigned task exists in ADR before starting |
| Audit trail | Chain logs in `.claude/orchestration/logs/` |
| Range validation | Invalid ranges → error message, no chain started |

---

## I. Frontend Spec Location & Adaptability

### Where It Lives
Two possible levels with cascading resolution:

1. **Session-level** (primary): `.adr/orchestration/<SESSION>/frontend_spec.md`
   - Specific to that session, overrides the root default
   - Different sessions can reference different specs

2. **Root-level** (fallback): `.adr/orchestration/frontend_spec.md`
   - Applies to any session that doesn't have its own
   - Good for projects with one consistent design system

3. **Neither exists + frontend work** → Agent STOPS and asks user to specify

### Resolution Order
```
Chain agent starts frontend work
  → Check .adr/orchestration/<CURRENT_SESSION>/frontend_spec.md
  → If exists: use it
  → If not: check .adr/orchestration/frontend_spec.md
  → If exists: use it
  → If not: HALT — ask user "Which design spec should this session follow?"
```

### Adaptability Across Sessions
```
.adr/orchestration/
├── frontend_spec.md                  ← Root default (brutalism pass-1)
├── 3_FRONTEND_DEVELOPMENT/
│   └── frontend_spec.md              ← Uses internal prototype
├── 9_DYNAMIC_NAV.../
│   └── (no file)                     ← Falls back to root default
├── 10_SUBSCRIPTIONS.../
│   └── frontend_spec.md              ← Uses external Figma reference
└── 11_MOBILE_APP/
    └── frontend_spec.md              ← Uses chat-prompted spec
```

### The 4 Source Types Are Mixable
A single `frontend_spec.md` could even combine sources:
```markdown
## Spec Source Type
- [x] Internal prototype
- [x] Chat-prompted spec

## Reference
- Layout: Follow `.docs/planning/frontend/concepts-next/brutalism/pass-1/school-profile.html`
- Navigation: Override with persistent top navbar (not FAB) per chat spec below

## Chat Spec Overrides
- Top navbar: logo left, school selector center, profile icon right
- Sticky on scroll, 60px height, border-b-brutal
```

---

## J. Orchestrated Mode (`--orchestrated`)

### Overview
An optional flag that replaces hook-based spawning with a persistent orchestrator agent (`orchestrator-chain-agent`) that manages the entire chain. The orchestrator spawns subagents via the Agent tool, validates their work, and sends feedback before accepting results.

### Two Orchestration Modes

| Mode | Flag | How It Works |
|---|---|---|
| **Default (hook)** | `--default` or no flag | Stop hook reads signal → spawns next agent. No persistent manager. |
| **Orchestrated** | `--orchestrated` | Persistent `orchestrator-chain-agent` spawns subagents, validates, sends feedback. |

### Why Orchestrated Mode Exists
The orchestrator has **whole-project awareness** that individual subagents lack:

| Issue Type | Subagent Catches? | Orchestrator Catches? |
|---|---|---|
| Task not completed | Yes | Yes |
| Build doesn't match frontend spec | Maybe | Yes (compared against spec) |
| Breaks existing functionality | No (limited context) | Yes (runs full E2E suite) |
| Duplicates existing code | No | Yes (saw all prior phases) |
| Inconsistent with prior phase | No (fresh context) | Yes (reviewed prior results) |
| Missing integration points | No (focused on task) | Yes (knows full architecture) |

### Orchestrated Flow

```
/chain 3 - 5 --per-phase --orchestrated
  │
  ├─ Creates chain-plan.json with orchestrationMode: "orchestrated"
  ├─ Spawns orchestrator-chain-agent (persistent session)
  │
  ├─ ORCHESTRATOR starts
  │   ├─ Reads chain-plan, PRD, tech spec, frontend spec
  │   ├─ Builds mental model of the full project
  │   │
  │   ├─ PHASE 1:
  │   │   ├─ Spawns chain-agent subagent via Agent tool
  │   │   ├─ Subagent does work, returns result
  │   │   ├─ ORCHESTRATOR VALIDATES:
  │   │   │   ├─ Tasks checked off? ✓
  │   │   │   ├─ Spec match? ✓
  │   │   │   ├─ Regression tests? ✓
  │   │   │   ├─ Integration? ✗ — issue found
  │   │   │   └─ SENDS FEEDBACK → subagent fixes → re-validates
  │   │   ├─ All checks pass → accept phase
  │   │   └─ Update chain-plan.json
  │   │
  │   ├─ PHASE 2: (orchestrator retains context from Phase 1)
  │   │   ├─ Spawns subagent with prior context
  │   │   ├─ Validates with knowledge of Phase 1 results
  │   │   └─ Accept → next
  │   │
  │   ├─ ALL PHASES DONE
  │   │   ├─ Run final comprehensive E2E suite
  │   │   ├─ Write chain-report.md
  │   │   └─ Mark chain completed
  │   │
  │   └─ ORCHESTRATOR EXITS
```

### Validation-Feedback Loop (Key Feature)

The orchestrator keeps the subagent alive via the Agent tool's SendMessage, allowing feedback loops:

```
Orchestrator spawns subagent → subagent builds navbar
  → Orchestrator checks: "navbar missing on /careers page"
  → SendMessage to subagent: "Fix: navbar not rendering on /careers"
  → Subagent fixes, returns updated result
  → Orchestrator re-validates: all pages have navbar ✓
  → Accept phase
```

Up to 3 feedback loops per phase. After 3 failures, escalate to user.

### When to Use Each Mode

| Situation | Mode | Why |
|---|---|---|
| Well-defined tasks, low risk | `--default` | Cheap, fast |
| Frontend work with strict spec | `--orchestrated` | Validates spec coherence |
| First time running a session | `--orchestrated` | Catch issues early |
| Data ingestion / backend only | `--default` | Low risk |
| Cross-cutting features (navbar, auth) | `--orchestrated` | Integration checks |
| Long chain (10+ phases) | `--orchestrated` | Prevents cascading errors |

### Components

| Component | Path | Role |
|---|---|---|
| `orchestrator-chain-agent` | `.claude/agents/orchestrator-chain-agent/AGENT.md` | Persistent orchestrator with validation |
| `chain-agent` | `.claude/agents/chain-agent/AGENT.md` | Subagent spawned per phase |
| `agent-chain-orchestrator` | `.claude/skills/agent-chain-orchestrator/SKILL.md` | Behavior rules for both agents |
| `chain-continue.sh` | `.claude/hooks/scripts/chain-continue.sh` | Skips when orchestrationMode="orchestrated" |
