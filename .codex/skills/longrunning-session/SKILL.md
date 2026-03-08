---
name: longrunning-session
description: Orchestrate long-running sessions with phase planning, validation, and archival.
---

## Purpose
Enforce the ADR orchestration workflow for long-running sessions with mandatory
validation via Playwright screenshots, user story testing, and structured reporting.

## Required steps (every session)
1) Ensure the session folder exists in orchestration/current/history.
2) Create or update primary task list, PRD, technical requirements, and notes in orchestration.
3) Create a phase plan in `current/` before starting work.
4) Read all project conventions before executing (CLAUDE.md, PRD, tech spec, task list).
5) Execute tasks in that phase file.
6) Validate every item listed in the phase file.
7) Take Playwright PNG screenshots of all UI surfaces into `.docs/validation/<SESSION>/<PHASE>/`.
8) Write user story validation tests against the live running app.
9) Create a user story report at `.docs/validation/<SESSION>/<PHASE>/user-story-report.md`.
10) Create a phase review file in `history/` with file tree + technical summary.
11) Move the phase file to `history/` when complete.
12) Check off the completed phase in the primary task list.
13) Commit and push all phase changes.
14) Create the next phase file before starting new work.

## Orchestrator context handoff
When the orchestrator spawns a subagent, it MUST include in the prompt:
- Prior phase summary (what was built, files changed, test count, deferred items)
- Current phase scope (tasks from primary task list)
- App state expectations (what must be true for the next phase)
- File paths to read (CLAUDE.md, PRD, tech spec, task list, prior review, design concept)
- Validation requirements (Playwright PNGs, user stories, report file)

## Validation policy (MANDATORY)

### Playwright screenshots
- PNG format only — HTML mockups are NOT acceptable.
- Desktop viewport: 1536×960. Mobile viewport: 390×844 @2x.
- Capture every UI surface built or modified in the phase.
- Output path: `.docs/validation/<SESSION>/<PHASE>/`

### User story testing
- Test against the LIVE running app with a real database.
- Mocked unit tests alone are insufficient — must hit real endpoints.
- Every feature must have user story coverage with PASS/FAIL result.

### User story report
- File: `.docs/validation/<SESSION>/<PHASE>/user-story-report.md`
- Must include: summary counts, per-story criteria/test/result/notes.
- ALL stories must PASS before phase completion.
- If a story FAILS: fix the code, retest, document the fix.

## Subagent handoff
- After completing a phase, queue the next phase in `.claude/orchestration/queue/next_phase.json`.
- Use the orchestrator poke hook to spawn the next Claude exec session.
- If an agent name is provided, the orchestrator prefixes the prompt with the agent file path.

## Output requirements
- `primary_task_list.md`
- `prd.md`
- `technical_requirements.md`
- `notes.md`
- `phase_<N>.md`
- `phase_<N>_review.md`
- `.docs/validation/<SESSION>/<PHASE>/` — PNGs + user-story-report.md

## Templates
Use templates in `templates/` for every file type.

## Safety
If access is missing or unclear, stop and request clarification before executing.

## Testing policy
- Never force passing tests. Investigate failures, document causes, and fix for production readiness.
- Never skip validation steps — they are mandatory, not optional.

## Remote handling
Do not hardcode repository remotes; use the repo's configured remote.
Use HTTPS remotes (not SSH) for pushes.
