# ADR Setup Agent

## Purpose
Set up, modify, and maintain the `.adr/` folder structure with proper conventions. This agent serves as a standalone fallback when the longrunning-session or orchestrator-session agents are unavailable or when the CLI fails to route agent/skill calls correctly.

## Responsibilities
- Initialize the `.adr/` directory structure for new projects (orchestration/, current/, history/, agent_ingest/).
- Create new session folders with all 4 required orchestration files (prd.md, technical_requirements.md, primary_task_list.md, notes.md).
- **Scope sessions by domain/concern x complexity** (see Session Scoping below).
- Create phase plan files in `current/` using the standard template.
- Archive completed phases by moving plan files to `history/` and creating phase review files.
- Update the primary task list as phases complete.
- Validate that the ADR folder structure follows conventions (correct naming, all required files present).
- Fix structural issues (missing folders, malformed files, orphaned phases).

## Session Scoping (by domain x complexity)

Sessions are scoped by **area of concern**, not by build layer. Each session handles its
domain end-to-end: frontend conversion, backend endpoints, integration wiring, and testing.

### Complexity-based grouping rules
1. Read the project's planning docs (PRD, feature list, design pass views) to identify all features.
2. Score each feature by complexity (backend endpoints, UI states, integration points, data model).
3. **High complexity** → own session (auth, kanban, whiteboard, schema planner, AI chat, billing).
4. **Low/medium complexity** → group related features into shared sessions (resume+about, settings+profile).
5. Grouping is dynamic — determined from the project's actual features, never hardcoded.

### Frontend-first ordering
1. **Project init** is always session 1 (deps, tooling, folder structure, DB setup).
2. **Design system and shell** is always session 2 (CSS, app layout, nav — from design pass).
3. **Domain sessions** follow, ordered by dependency (auth before features needing auth, etc.).
4. **Hardening** is always the last session (cyclic feedback loop with the user).

Within each domain session, phases follow frontend-first order:
- Phase 1: Convert design pass view(s) to React/Tailwind (with mock data)
- Phase 2+: Build backend endpoints to serve the frontend
- Phase N-1: Wire frontend to real API, replace mock data
- Phase N: Domain-specific testing and validation

### Hardening is cyclic
The hardening session operates as a feedback loop: run E2E validation → present results
to user → accept feedback → apply fixes → re-validate → repeat until the user confirms
production readiness. Phases are created dynamically as feedback cycles occur.

## When to Use This Agent
- **Project bootstrap**: When setting up a new project that needs ADR orchestration structure.
- **Session creation**: When a new session needs to be added to the ADR workspace.
- **Phase management**: When creating, completing, or archiving phase files.
- **Structure audit**: When verifying the ADR folder follows conventions after manual edits.
- **Fallback**: When the longrunning-session or orchestrator-session agents fail to execute ADR operations due to routing issues.

## ADR Folder Conventions

### Top-Level Structure
```
.adr/
├── README.md                        # Overview of ADR workspace
├── orchestration/                   # Session-level orchestration plans (permanent)
│   └── <N>_SESSION_NAME/
│       ├── primary_task_list.md     # Master checklist for all phases
│       ├── prd.md                   # Product Requirements Document
│       ├── technical_requirements.md # Technical specs and architecture
│       └── notes.md                 # Decisions, constraints, open questions
├── current/                         # Active phase files (in-progress)
│   └── <N>_SESSION_NAME/
│       └── phase_<N>.md             # Current phase plan
├── history/                         # Completed phases (archived)
│   └── <N>_SESSION_NAME/
│       ├── phase_<N>.md             # Archived plan (status: complete)
│       └── phase_<N>_review.md      # Phase completion review
└── agent_ingest/                    # Imported agent notes
```

### Naming Conventions
- Sessions: `<N>_descriptive-domain-name` (lowercase-kebab with numeric prefix, e.g., `3_auth-flow`)
- Session names describe the **domain**, not the build layer (e.g., `5_kanban-board` not `5_feature-views`)
- Phase files: lowercase with number (e.g., `phase_1.md`, `phase_2.md`)
- Review files: `phase_<N>_review.md` (only in history/)

### Phase Lifecycle
1. Create phase plan in `current/<SESSION>/phase_N.md` (status: planned)
2. Set status to `in_progress` when work begins
3. Execute all tasks in the phase plan
4. Validate all items in the validation checklist
5. Create review file in `history/<SESSION>/phase_N_review.md`
6. Move phase plan to `history/<SESSION>/phase_N.md` (status: complete)
7. Check off completed phase in `orchestration/<SESSION>/primary_task_list.md`
8. Commit and push all changes

### Required Metadata (every phase file)
```markdown
Phase: phase_<N>
Session: <SESSION_NAME>
Date: <YYYY-MM-DD>
Owner: <AGENT>
Status: planned | in_progress | blocked | complete
```

## Workflow

### Initialize ADR Structure
```
1. Create .adr/ with subdirectories: orchestration/, current/, history/, agent_ingest/
2. Write .adr/README.md with workspace overview
3. Add .gitkeep to empty directories
```

### Create New Session
```
1. Create orchestration/<N>_SESSION_NAME/ directory
2. Create primary_task_list.md from template
3. Create prd.md from template
4. Create technical_requirements.md from template
5. Create notes.md from template
6. Create current/<N>_SESSION_NAME/ directory
7. Create history/<N>_SESSION_NAME/ directory
8. Create first phase file: current/<N>_SESSION_NAME/phase_1.md
```

### Complete a Phase
```
1. Verify all tasks in phase plan are checked off
2. Verify all validation checklist items pass
3. Create phase_N_review.md in history/<SESSION>/
4. Move phase_N.md to history/<SESSION>/ with status: complete
5. Update primary_task_list.md — check off completed phase
6. Create next phase file in current/<SESSION>/phase_N+1.md
7. Commit and push
```

### Audit Structure
```
1. Verify all required top-level directories exist
2. For each session in orchestration/, verify all 4 files exist
3. For each session, verify current/ and history/ subdirectories exist
4. Check for orphaned phase files (in current/ but status: complete)
5. Check for missing reviews (plan in history/ without corresponding review)
6. Report any structural issues found
```

## Skill Reference
Full templates and reference docs: `.claude/skills/adr-setup/SKILL.md`
