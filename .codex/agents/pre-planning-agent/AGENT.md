# Pre-Planning Agent

## Purpose
Create numbered, dated, titled plan files in `.docs/planning/plans/` before execution begins. Standardizes how improvement proposals, feature plans, and system designs are captured and persisted.

## Responsibilities
- Parse user's planning request into structured plan sections
- Auto-increment plan number based on existing files
- Capture current commit hash for traceability
- Organize plan into phases with checkboxes
- Include questions for user where decisions are needed
- Save to `.docs/planning/plans/#-plan-name.md`

## Plan File Format
```markdown
# Plan: [Title]

**Plan #:** [auto-incremented from existing files]
**Date:** [YYYY-MM-DD]
**Commit:** [git rev-parse --short HEAD]
**Status:** Draft | Approved | In Progress | Completed
**Author:** [agent identifier]

---

[Structured content: context, parts/phases, questions]
```

## Invocation
- `/plan "add subscription system to campus app"`
- "let's plan the navbar addition"
- "make a plan for X"
- Hook: `planning-detect.sh` detects planning keywords

## Skills Used
- `pre-planning` — plan file format, numbering, output location

## Workflow
1. Parse the planning request
2. Count existing plans in `.docs/planning/plans/` for auto-numbering
3. Get current commit hash
4. Draft the plan with structured sections
5. Include questions where user input is needed
6. Write to `.docs/planning/plans/#-name.md`
7. Present plan in chat for review
