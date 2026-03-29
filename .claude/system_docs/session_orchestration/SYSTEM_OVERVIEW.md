# Session Orchestration — System Overview

## What This System Does

Manages long-running, multi-phase work sessions by enforcing a structured 11-step lifecycle:
planning, execution, validation, review, and archival. An orchestrator agent dispatches
isolated subagents per phase via `claude exec`, collects "poke back" reports, and advances
the session forward only when validation passes.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Orchestrator Agent | `.claude/agents/longrunning-orchestrator-agent/AGENT.md` | Drives the phase loop |
| Worker Subagent | `.claude/agents/longrunning-worker-subagent/AGENT.md` | Executes one phase |
| Research Agent | `.claude/agents/research-docs-agent/AGENT.md` | Research variant |
| Longrunning Skill | `.claude/skills/longrunning-session/SKILL.md` | Validation enforcement |
| Orchestrator Skill | `.claude/skills/orchestrator-session/SKILL.md` | Loop + dispatch |
| Research Skill | `.claude/skills/research-docs-session/SKILL.md` | ADR-backed research |
| Poke Hook | `.claude/hooks/scripts/orchestrator-poke.ps1` | Spawns subagents |
| Queue File | `.claude/orchestration/queue/next_phase.json` | Phase handoff state |

## Three Session Variants

| Variant | Best For |
|---------|---------|
| `longrunning-session` | Feature development sessions with strict validation |
| `orchestrator-session` | Multi-phase projects with many sequential subagent dispatches |
| `research-docs-session` | Structured research with ADR archival and citation tracking |

## When to Use

| Scenario | Use |
|----------|-----|
| Starting a multi-phase ADR session (e.g., session 3 frontend) | `orchestrator-session` |
| Single long-running feature with validation gates | `longrunning-session` |
| Research work that must be archived in `.adr/` | `research-docs-session` |
| Manual phase retry after subagent crash | Move phase file from `current/` to `history/` manually |

## Key Concepts

- **Phase**: Bounded unit with a plan, execution, validation, and review
- **Poke**: Structured report from subagent — completed tasks, files changed, validation status
- **Queue file**: `next_phase.json` written by orchestrator → triggers next subagent spawn
- **Primary task list**: Master checklist; single source of truth for session progress

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **playwright_testing** | Every phase requires Playwright PNG screenshots (mandatory) |
| **adr_setup** | All session artifacts live in `.adr/orchestration/`, `current/`, `history/` |
| **version_control** | Step 10 commits and pushes after every phase |
| **user_story_testing** | User story report required before phase can complete |
| **frontend_spec** | Subagents read `frontend_spec.md` before any frontend work |

## Related Documentation

| File | Content |
|------|---------|
| `phase-lifecycle.md` | Full 11-step lifecycle with acceptance criteria per step |
| `subagent-spawning.md` | Queue file format, context handoff checklist, hook mechanism |
| `session-variants.md` | Differences between the three session types |

## Design Decisions

- **Subagent isolation via `claude exec`**: each phase gets a fresh context window
- **Poke-back pattern**: subagents don't push forward — orchestrator always drives
- **Validation before archival**: phases cannot move to history without passing all checks
- **Never force-pass tests**: failures must be fixed and retested, not bypassed
- **HTTPS remotes only**: no SSH, no hardcoded URLs
