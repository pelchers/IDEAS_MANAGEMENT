# Orchestration Guide (Longrunning)

## Phase lifecycle
- Always create the phase plan before starting work.
- Read all project conventions (CLAUDE.md, PRD, tech spec) before executing.
- Every phase must include validations.
- Move completed phase files to history.
- Keep primary task list and PRD in orchestration/<SESSION>.
- Create a phase review file with tree + technical summary.
- Check off completed phases in the primary task list.
- Commit and push changes after each completed phase.

## Orchestrator → subagent context handoff
The orchestrator MUST pass to each subagent:
1. Prior phase summary (what was built, key files, test count, deferred items)
2. Current phase scope (exact tasks from primary task list)
3. App state expectations (what must be true when phase ends for next phase)
4. File paths to read (CLAUDE.md, PRD, tech spec, task list, prior review)
5. Design system reference (if UI work — concept style.css + README)
6. Validation requirements (Playwright PNGs, user stories, report file)

## Subagent startup protocol
Before doing ANY work, the subagent reads:
1. CLAUDE.md (project conventions)
2. PRD (product requirements)
3. Technical specification
4. Primary task list
5. Prior phase review (if not phase 1)
6. Current phase plan
7. Design concept (if UI phase)

## Validation policy
- Playwright PNG screenshots (desktop 1536×960, mobile 390×844 @2x)
- User story tests against LIVE running app (not mocked)
- User story report file at `.docs/validation/<SESSION>/<PHASE>/user-story-report.md`
- ALL stories must PASS before phase is marked complete
- `pnpm typecheck` and `pnpm test` must pass with zero failures
