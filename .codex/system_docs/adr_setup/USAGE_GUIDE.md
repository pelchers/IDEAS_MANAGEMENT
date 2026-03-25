# Usage Guide: ADR Setup

## Quick Start

Bootstrap a new project's ADR structure:

```
/agent adr-setup "Initialize .adr/ workspace for this project"
```

## Detailed Usage

### Bootstrap (New Project)

Creates all required directories and a workspace README:

```
/agent adr-setup "Create .adr/ with orchestration/, current/, history/, agent_ingest/"
```

### Create a New Session

Session names follow `<N>_descriptive-domain-name` (domain-based, not layer-based):

```
/agent adr-setup "Create session 4_user-auth with PRD and phase 1 plan"
```

Creates:
- `orchestration/4_user-auth/` with 4 required files
- `current/4_user-auth/phase_1.md`
- `history/4_user-auth/` (empty)

### Complete a Phase

```
/agent adr-setup "Complete phase 1 of 4_user-auth — all tasks done"
```

Agent verifies all tasks are checked, creates `history/4_user-auth/phase_1_review.md`, moves `phase_1.md` to history with `status: complete`, updates `primary_task_list.md`, creates `phase_2.md`.

### Required Phase Metadata

Every phase file must start with:
```
Phase: phase_1
Session: 4_user-auth
Date: 2026-03-24
Owner: my-agent
Status: planned
```

### Commit Convention

```
ADR Session 4 Phase 1: auth UI and login flow complete
```

## Troubleshooting

**Agent says frontend_spec.md is missing**
The skill prompts you to provide the design spec. Answer with: internal path, external URL, paste spec inline, or "match visually". The agent creates `frontend_spec.md` from your answer.

**Phase stuck in current/ after completion**
Run audit: `/agent adr-setup "Audit .adr/ structure"`. The agent will detect orphaned phases and fix them.

**Session folder naming mismatch**
Session names must be lowercase-kebab with numeric prefix: `3_auth-flow` not `3_AuthFlow` or `auth-3`.
