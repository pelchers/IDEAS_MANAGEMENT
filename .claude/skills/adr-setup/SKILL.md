---
name: adr-setup
description: Set up, modify, and maintain the .adr/ folder structure with proper conventions, templates, and phase lifecycle management.
---

## Purpose
Provide a standalone skill for initializing, modifying, and maintaining the `.adr/` Architecture Decision Record workspace. This skill contains all templates, conventions, and lifecycle rules needed to manage ADR folders without depending on the longrunning-session or orchestrator-session skills.

## When to Use
- Bootstrapping a new project's ADR structure
- Adding a new session to an existing ADR workspace
- Creating, completing, or archiving phase files
- Auditing ADR folder structure for convention compliance
- As a fallback when longrunning/orchestrator skills fail to route correctly

## Session Scoping (by domain x complexity)

Sessions are scoped by **area of concern**, not by build layer. Each session handles its
domain end-to-end: frontend, backend, integration, and testing — all as phases within one session.

### Complexity-based grouping
1. Read the project's planning docs (PRD, feature list, design pass views) to identify all features.
2. Score each feature by complexity (backend endpoints, UI states, integration points, data model).
3. **High complexity** → own session (auth, kanban, whiteboard, schema planner, AI chat, billing).
4. **Low/medium complexity** → group related features into shared sessions (resume+about, settings+profile, file-tree+directory-display).
5. Grouping is dynamic — determined from the project's actual features, never hardcoded.

### Frontend-first ordering
1. **Project init** — always session 1.
2. **Design system and shell** — always session 2.
3. **Domain sessions** — ordered by dependency (auth before features needing auth).
4. **Hardening** — always last. Cyclic feedback loop with the user (see below).

Within each domain session, phases follow frontend-first order:
- Phase 1: Convert design pass view(s) to React/Tailwind (with mock data)
- Phase 2+: Build backend endpoints
- Phase N-1: Wire frontend to real API
- Phase N: Domain-specific testing

### Hardening is cyclic
The hardening session is a feedback loop: run full E2E validation → present results to
user → accept feedback → apply fixes → re-validate → repeat until user confirms
production readiness. Phases are created dynamically as feedback cycles occur.

## ADR Folder Structure

### Required Top-Level Directories
```
.adr/
├── README.md
├── orchestration/           # Permanent session-level docs
├── current/                 # Active phase files
├── history/                 # Completed phase archives
└── agent_ingest/            # Imported agent notes
```

### Per-Session Files
Each session (`orchestration/<N>_SESSION_NAME/`) requires exactly 4 files (5 if frontend work):

| File | Purpose |
|------|---------|
| `primary_task_list.md` | Master checklist of all phases |
| `prd.md` | Product Requirements Document |
| `technical_requirements.md` | Technical constraints and architecture |
| `notes.md` | Decisions (D#), Constraints (C#), Open Questions (Q#) |
| `frontend_spec.md` | Frontend design reference — **required if session has frontend phases** |

### Phase Files
- Plan files live in `current/<SESSION>/phase_N.md` while active
- On completion, plan moves to `history/<SESSION>/phase_N.md` (status updated to `complete`)
- Review files are created only in `history/<SESSION>/phase_N_review.md`

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Session folder | `<N>_descriptive-domain-name` (lowercase-kebab with numeric prefix) | `3_auth-flow` |
| Phase plan | lowercase with number | `phase_1.md` |
| Phase review | lowercase with number + review | `phase_1_review.md` |
| Orchestration files | lowercase snake_case | `primary_task_list.md` |

## Phase Lifecycle (11 Steps)

0. If session involves frontend work, verify `frontend_spec.md` exists (session-level, then root default). If missing, prompt user: "Which design spec should this session follow?" Options: internal prototype path, external URL, paste spec in chat, or similarity match. Create `frontend_spec.md` from their answer using `templates/frontend_spec_template.md`.
1. Ensure session folders exist in orchestration/, current/, history/
2. Create or update the 4 orchestration files (prd, tech_reqs, task_list, notes)
3. Create phase plan in `current/` before starting work
4. Execute tasks listed in the phase file
5. Validate every item in the phase validation checklist
6. Create phase review file in `history/` with file tree + technical summary
7. Move the phase plan to `history/` with status updated to `complete`
8. Check off completed phase in primary_task_list.md
9. Commit and push all phase changes
10. Create next phase file before starting new work

## Required Phase Metadata
Every phase file must include these fields at the top:
```
Phase: phase_<N>
Session: <SESSION_NAME>
Date: <YYYY-MM-DD>
Owner: <AGENT>
Status: planned | in_progress | blocked | complete
```

## Status Transitions
```
planned --> in_progress --> complete
                |
                +--> blocked --> in_progress --> complete
```

## Templates
All templates are in `templates/` subdirectory:
- `phase_template.md` — Phase plan with objectives, tasks, deliverables, validation
- `phase_review_template.md` — Phase completion review with file tree and technical breakdown
- `prd_template.md` — Product Requirements Document
- `technical_requirements_template.md` — Technical specs
- `primary_task_list_template.md` — Master phase checklist
- `notes_template.md` — Decisions, constraints, open questions
- `adr_readme_template.md` — .adr/README.md template

## References
- `references/conventions.md` — Complete ADR conventions reference document

## Validation Checklist (per phase)
```markdown
- [ ] All tasks complete
- [ ] Sources captured with citations
- [ ] Media references verified
- [ ] Docs match sitemap placements
- [ ] Phase file ready to move to history
- [ ] Phase review file created in history
- [ ] Changes committed and pushed
- [ ] frontend_spec.md exists and references valid source (if frontend session)
- [ ] New UI visually matches referenced spec (Playwright screenshot comparison)
```

## Commit Convention
After each phase completes, commit with session and phase reference:
```
ADR Session N Phase M: <brief description of work completed>
```

## Safety
- If access is missing or unclear, stop and request clarification before executing
- Never force passing tests; investigate failures, document causes, fix for production
- Use the repo's configured HTTPS remote for pushes (no hardcoded remotes, no SSH)
