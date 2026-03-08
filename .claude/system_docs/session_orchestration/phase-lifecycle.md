# Phase Lifecycle

## Overview

Every phase in the session orchestration system follows a strict lifecycle.
Skipping steps or reordering them will leave the session in an inconsistent state.
The orchestrator enforces this sequence for every phase regardless of session variant.

## The Phase Lifecycle

```
  Step 1   Step 2   Step 3    Step 4   Step 5    Step 6
  Folder   Docs     Plan      Read     Execute   Validate
    |        |        |         |        |         |
    v        v        v         v        v         v
  +---------+---------+----------+---------+---------+---------+
  | Ensure  | Create/ | Write    | Read    | Execute | Validate|
  | session | update  | phase    | project | tasks   | with    |
  | folder  | PTL,PRD | plan in  | docs &  | in the  | Playwright|
  | exists  | tech,   | current/ | prior   | phase   | + user  |
  |         | notes   |          | review  | file    | stories |
  +---------+---------+----------+---------+---------+---------+
                                                         |
  +---------+---------+---------+---------+---------+---------+
  | Create  | Move    | Check   | Commit  | Create  |
  | phase   | phase   | off in  | + push  | next    |
  | review  | to      | primary | all     | phase   |
  | file    | history | task    | changes | plan    |
  |         |         | list    |         |         |
  +---------+---------+---------+---------+---------+
    ^        ^        ^        ^        ^
    |        |        |        |        |
  Step 7   Step 8   Step 9   Step 10  Step 11
  Review   Archive  Checkoff Commit   Next Phase
```

### Step 1: Ensure Session Folder

Verify the session folder exists under `orchestration/current/history`. If missing,
create it along with the required directory structure.

### Step 2: Create or Update Session Documents

Create or refresh the four core documents:
- `primary_task_list.md` — master phase checklist
- `prd.md` — product requirements
- `technical_requirements.md` — architecture and constraints
- `notes.md` — decisions, open questions, running log

### Step 3: Write Phase Plan

Create `phase_<N>.md` in the `current/` directory. The plan must include:
- Numbered task list with clear acceptance criteria
- Validation steps for each deliverable
- Expected output files and locations

### Step 4: Read Project Conventions (MANDATORY)

Before executing ANY work, the subagent MUST read:
1. `CLAUDE.md` — project conventions and architecture
2. `.docs/planning/prd.md` — product requirements
3. `.docs/planning/technical-specification.md` — technical architecture
4. `.adr/orchestration/<SESSION>/primary_task_list.md` — full task list
5. `.adr/history/<SESSION>/phase_<N-1>_review.md` — prior phase review (if not phase 1)
6. `.adr/current/<SESSION>/phase_<N>.md` — current phase plan
7. Design concept files (if the phase involves UI work)

### Step 5: Execute Tasks

Work through every task in the phase plan sequentially. Each task should produce
a testable deliverable.

### Step 6: Validate Every Item

Run validation against every item listed in the phase file:

**Playwright PNG screenshots (mandatory for UI work):**
- Desktop viewport: 1536×960
- Mobile viewport: 390×844 @2x
- PNG format only — HTML mockups are NOT acceptable
- Output path: `.docs/validation/<SESSION>/<PHASE>/`

**User story validation (mandatory for all phases):**
- Test against the LIVE running app with a real database
- Mocked unit tests alone are insufficient
- Every feature must have explicit acceptance criteria and PASS/FAIL result

**User story report (mandatory):**
- File: `.docs/validation/<SESSION>/<PHASE>/user-story-report.md`
- Includes summary counts, per-story criteria/test/result/notes
- ALL stories must PASS before the phase can be marked complete
- If a story FAILS: fix the code, retest, document the fix

**Standard tests:**
- `pnpm typecheck` must pass with zero errors
- `pnpm test` must pass with zero failures, zero regressions

### Step 7: Create Phase Review

Write `phase_<N>_review.md` to the `history/` directory containing:
- File tree snapshot of all changed/created files
- Technical summary of work completed
- Test count and validation results
- Any issues encountered and their resolutions

### Step 8: Move Phase to History

Move the completed `phase_<N>.md` from `current/` to `history/`. This signals
the phase is done and prevents re-execution.

### Step 9: Check Off in Primary Task List

Mark the completed phase in `primary_task_list.md` as done. This provides
the orchestrator a single source of truth for session progress.

### Step 10: Commit and Push

Stage all phase-related changes and commit with a descriptive message. Push
to the remote using HTTPS. Never skip this step — each phase boundary is a
commit boundary.

### Step 11: Create Next Phase Plan

Before starting new work, create the next phase plan in `current/`. This
ensures the session always has a forward-looking plan ready.

## Validation Rules

| Rule                              | Enforcement                              |
|-----------------------------------|------------------------------------------|
| No skipping steps                 | Orchestrator checks step completion       |
| Read conventions before executing | Step 4 must precede Step 5               |
| Phase plan before execution       | Step 3 must precede Step 5               |
| All items validated               | Step 6 covers every task in the plan     |
| Playwright PNGs for UI work       | HTML mockups are not acceptable           |
| User story report required        | ALL stories must PASS                    |
| Review before archival            | Step 7 must precede Step 8               |
| Commit after every phase          | Step 10 is mandatory, not optional       |
| Never force passing tests         | Investigate failures, document causes    |

## Testing Policy

1. **Never force tests to pass.** If a test fails, investigate the root cause.
2. **Document failure causes** in the phase review file.
3. **Fix for production readiness** — do not advance with known failures.
4. **Re-run validation** after fixes to confirm resolution.

## Validation Output Structure

```
.docs/validation/<SESSION>/<PHASE>/
  ├── <feature>-desktop.png          <-- Playwright screenshot (1536×960)
  ├── <feature>-mobile.png           <-- Playwright screenshot (390×844 @2x)
  ├── user-story-report.md           <-- PASS/FAIL for every user story
  └── ...
```

## ADR Output Structure

```
.adr/
  orchestration/<SESSION>/
    primary_task_list.md
    prd.md
    technical_requirements.md
    notes.md
  current/<SESSION>/
    phase_<N>.md            <-- Active phase plan (Step 3)
  history/<SESSION>/
    phase_<N>.md            <-- Archived phase plan (Step 8)
    phase_<N>_review.md     <-- Phase review (Step 7)
```
