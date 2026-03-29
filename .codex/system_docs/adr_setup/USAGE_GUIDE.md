# Usage Guide: ADR Setup

## Quick Start

Bootstrap a new project:
```
/agent adr-setup "Initialize .adr/ workspace for this project"
```

## Detailed Usage

### Create a New Session

```
/agent adr-setup "Create session 4_user-auth with PRD and phase 1 plan"
```

Session names: `<N>_descriptive-domain-name` (domain-based, lowercase-kebab).

Creates: `orchestration/4_user-auth/` (4 files) + `current/4_user-auth/phase_1.md` + `history/4_user-auth/`.

### Complete a Phase

```
/agent adr-setup "Complete phase 1 of 4_user-auth"
```

Agent verifies all tasks checked, creates `history/.../phase_1_review.md`, moves plan to history, updates task list, creates `phase_2.md`.

### Required Phase Metadata

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

### Audit Structure

```
/agent adr-setup "Audit .adr/ folder structure for convention compliance"
```

## Troubleshooting

**Agent asks for frontend_spec.md** — Provide the design spec path, URL, or paste inline. Agent creates `frontend_spec.md`.

**Phase stuck in current/ after completion** — Run audit. Agent detects orphaned phases.

**Session naming mismatch** — Must be lowercase-kebab with numeric prefix: `3_auth-flow` not `3_AuthFlow`.
