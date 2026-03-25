# Agent Chaining System

## Overview
The Agent Chaining system provides autonomous, multi-session development by chaining Claude Code agent sessions together. When one agent completes its work, a hook automatically spawns the next agent to continue. Work is driven by ADR orchestration task lists — the chain progresses as checkbox items get checked off.

## Components

| Component | Path | Purpose |
|---|---|---|
| **Skill** | `.claude/skills/agent-chain-orchestrator/SKILL.md` | Chain-aware agent behavior, 4 granularity modes, ADR validation |
| **Agent** | `.claude/agents/chain-agent/AGENT.md` | Chain execution persona |
| **Stop Hook** | `.claude/hooks/scripts/chain-continue.sh` | Reads completion signal, spawns next agent |
| **Start Hook** | `.claude/hooks/scripts/chain-session-init.sh` | Loads chain context into new agent session |
| **Command** | `.claude/commands/chain.md` | `/chain` — start a chain with path + mode |
| **Command** | `.claude/commands/chain-status.md` | `/chain-status` — check progress |
| **Command** | `.claude/commands/chain-stop.md` | `/chain-stop` — emergency brake |
| **State File** | `.claude/orchestration/chain-plan.json` | Chain state: mode, phases, progress |
| **Signal File** | `.claude/orchestration/chain-signal.txt` | Completion catch phrase written by agent |
| **System Docs** | `.claude/system_docs/agent_chaining/` | This documentation |

## Relationship to Existing Systems

| Existing System | Relationship | Modified? |
|---|---|---|
| `orchestrator-poke.ps1` | Called by chain-continue.sh to spawn `claude exec` | **No** |
| `longrunning-session` skill | Validation patterns reused (Playwright, user stories) | **No** |
| `orchestrator-session` skill | Phase review + history patterns reused | **No** |
| `ingesting-agent-history` skill | Ingest summary format for context bridging | **No** |
| `feature-expansion` skill | FEA cycle used within each phase (optional) | **No** |
| `adr-setup` skill | **Enhanced** — adds `frontend_spec.md` requirement | **Additive only** (~20 lines) |
| `hooks/settings.json` | **Enhanced** — 2 new hook entries appended | **Additive only** |

## How to Use

See `SYSTEM_OVERVIEW.md` in this folder for the complete architecture reference.
