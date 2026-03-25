---
name: chain
description: Start an agent chain from ADR task lists — supports per-task, per-phase, per-subfolder, and full modes
invocable: true
---

# Agent Chain (/chain)

Start an autonomous agent chain that progresses through ADR orchestration task lists. Each agent completes its assigned work, writes a completion signal, and the Stop hook spawns the next agent.

## Usage
```
/chain <path> [- <end_path>] [--per-task | --per-phase | --per-subfolder | --full]
```

## Arguments
- `$ARGUMENTS` — path to ADR subfolder, range, or orchestration root

## Path Resolution
1. Full path: `.adr/orchestration/3_FRONTEND_DEVELOPMENT`
2. Subfolder name: `3_FRONTEND_DEVELOPMENT` → prepends `.adr/orchestration/`
3. Number shorthand: `3` → matches subfolder with numeric prefix 3
4. Orchestration root: `adr/orchestration` or `adr\orchestration` → full tree
5. Range: `3 - 5` or `3_FRONTEND - 5_USER_STORY` → sessions 3 through 5

## Granularity Modes
- `--per-task` — 1 agent per checkbox item (maximum granularity)
- `--per-phase` — 1 agent per `## Phase N` section (default)
- `--per-subfolder` — 1 agent per ADR session subfolder
- `--full` — entire orchestration tree (implied when path is orchestration root)

## Orchestration Modes
- `--default` (or no flag) — hook-based: Stop hook auto-spawns next agent. Lightweight, no persistent orchestrator.
- `--orchestrated` — persistent orchestrator agent manages the chain. Validates subagent work, sends feedback, retries on failure. Higher cost but intelligent supervision.

## Workflow
1. Parse path, range, mode, and orchestration flag from arguments
2. Scan targeted ADR subfolder(s) for unchecked `- [ ]` items
3. Create `.claude/orchestration/chain-plan.json` with phases
4. If frontend work detected → verify `frontend_spec.md` exists
5. If `--default`: execute Phase 1 inline, Stop hook chains the rest
6. If `--orchestrated`: spawn orchestrator-chain-agent which manages all phases with validation
7. Chain continues until all tasks checked or `/chain-stop` issued

## Examples
```bash
# Default (hook-based)
/chain 9_DYNAMIC_NAV_AND_DATA_INGESTION --per-phase
/chain 3 - 5 --per-phase
/chain 2_BACKEND - 8_PRODUCTION --per-subfolder
/chain adr/orchestration --full
/chain 3_FRONTEND --per-task

# Orchestrated (with validation + feedback loops)
/chain 3 - 5 --per-phase --orchestrated
/chain 9_DYNAMIC --per-subfolder --orchestrated

# With design references (auto-creates frontend_spec.md)
/chain 9_DYNAMIC --per-phase "build navbar matching https://stripe.com/nav style"
/chain 3_FRONTEND --per-phase "dark theme, round buttons, sans-serif"
```

## Design References
If your `/chain` invocation includes design language (URLs, style descriptions, pass names), a `frontend_spec.md` will be auto-created from it before the chain starts. The `require-frontend-spec` hook also auto-creates a spec on the first frontend file write if none exists.
