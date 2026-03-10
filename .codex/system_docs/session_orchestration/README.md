# Session Orchestration System

## Purpose

The session orchestration system manages long-running, multi-phase work sessions by
enforcing a structured lifecycle: planning, execution, validation, review, and archival.
Three skill variants serve different use cases but share the same foundational phase
architecture and subagent delegation pattern.

## Architecture Overview

```
                     +---------------------------+
                     |   Orchestrator Session     |
                     |   (persistent chat)        |
                     +---------------------------+
                              |
              +---------------+---------------+
              |               |               |
         Phase 1          Phase 2          Phase N
         Subagent         Subagent         Subagent
              |               |               |
         "poke back"     "poke back"     "poke back"
              |               |               |
         Review +         Review +         Review +
         Archival         Archival         Archival
```

## Skill and Agent Locations

| Component               | Path                                                          |
|--------------------------|---------------------------------------------------------------|
| Longrunning session      | `.codex/skills/longrunning-session/SKILL.md`                 |
| Orchestrator session     | `.codex/skills/orchestrator-session/SKILL.md`                |
| Research-docs session    | `.codex/skills/research-docs-session/SKILL.md`               |
| Longrunning agent        | `.codex/agents/longrunning-agent/AGENT.md`                   |
| Orchestrator agent       | `.codex/agents/orchestrator-agent/AGENT.md`                  |
| Research-docs agent      | `.codex/agents/research-docs-agent/AGENT.md`                 |
| Orchestration queue      | `.codex/orchestration/queue/next_phase.json`                 |
| Orchestrator poke hook   | `.codex/hooks/scripts/orchestrator-poke.ps1`                 |
| Templates                | `.codex/skills/<variant>/templates/`                         |
| References               | `.codex/skills/<variant>/references/`                        |

## Key Concepts

- **Phase**: A bounded unit of work with a plan, execution steps, and a review.
- **Poke**: A structured report returned by a subagent after phase completion, containing
  completed tasks, files changed, validation results, commit confirmation, and next-phase
  readiness.
- **Queue file**: `next_phase.json` written by the orchestrator to trigger subagent spawning.
- **Phase review**: A file written to `history/` with a file tree snapshot and technical
  summary of what was accomplished.
- **Primary task list**: The master checklist tracking all phases across the session.

## Output Artifacts

Every session produces these files in the orchestration directory:

| File                         | Purpose                                        |
|------------------------------|------------------------------------------------|
| `primary_task_list.md`       | Master checklist of all phases                 |
| `prd.md`                     | Product requirements document                  |
| `technical_requirements.md`  | Technical constraints and architecture notes   |
| `notes.md`                   | Running notes, decisions, open questions        |
| `phase_<N>.md`               | Plan for phase N (moved to history on complete)|
| `phase_<N>_review.md`        | Review of phase N (written to history)         |

## Related Documentation

- [Phase Lifecycle](./phase-lifecycle.md) -- The 11-step lifecycle every phase follows
- [Subagent Spawning](./subagent-spawning.md) -- Queue file format, context handoff, and hook mechanism
- [Session Variants](./session-variants.md) -- Differences between the three session types

## Build Order Convention

The orchestrator enforces a **frontend-first** pipeline when a design pass exists:

```
Project Init → Frontend Conversion → Domain Sessions → Hardening (cyclic)
```

Domain sessions scope work by area of concern x complexity. Backend + integration + testing
fold into each domain session rather than being separate sequential stages. Complex features
get their own session; simple features are grouped. See [System Improvements](./system-improvements.md).

## Design Fidelity Inference

The orchestrator infers design fidelity from the user's natural language (no flags):
- **Faithful**: 1:1 conversion of design pass → framework (subagents read pass HTML as primary spec)
- **Reference**: design tokens as style guide, layouts from PRD
- **External**: adapt external site's visual language to PRD spec
- **From scratch**: PRD requirements only

See [System Improvements](./system-improvements.md) for full context handoff per mode.

## Hardening (Cyclic)

The hardening session is a feedback loop: run E2E validation → present to user → accept
feedback → apply fixes → re-validate → repeat until user confirms production readiness.
Phases are created dynamically as feedback cycles occur.

## Context Handoff

The orchestrator MUST pass a comprehensive context prompt to each subagent on spawn,
including prior phase summary, current scope, app state expectations, files to read,
**design fidelity mode with per-mode instructions**, and validation requirements. See
[Subagent Spawning](./subagent-spawning.md) for the full checklist and
[System Improvements](./system-improvements.md) for fidelity-specific handoff details.

## Mandatory Validation

Every phase must produce:
- **Playwright PNG screenshots** (desktop 1536x960, mobile 390x844 @2x) for UI work
- **User story tests** against the LIVE running app with a real database
- **User story report** at `.docs/validation/<SESSION>/<PHASE>/user-story-report.md`
- ALL stories must PASS before phase completion

## Testing Policy

All session variants enforce the same testing policy: never force passing tests. Investigate
failures, document root causes, and fix for production readiness.

## Remote Handling

All variants use the repo's configured remote with HTTPS (not SSH). No hardcoded remotes.
