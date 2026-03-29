---
name: pre-planning
description: Create numbered plan files in .docs/planning/plans/ before execution begins.
---

## Purpose
Standardize how plans are captured. Every significant piece of work should start with a plan file that persists the what/why/how before coding begins.

## When to Use
- Before any multi-phase feature addition
- Before system architecture changes
- Before agent/skill system modifications
- When the user says "plan", "let's plan", "make a plan", "plan out"

## Output Location
`.docs/planning/plans/#-plan-name.md`

## Numbering
Auto-increment by scanning existing files: `ls .docs/planning/plans/*.md | wc -l` + 1

## Required Sections
1. **Header** — Plan #, date, commit hash, status, author
2. **Context** — what exists now, what's the gap
3. **Plan content** — organized by parts or phases with checkboxes
4. **Questions** — where user input is needed before execution

## Status Values
- `Draft` — just created, awaiting review
- `Approved` — user reviewed and approved
- `In Progress` — execution has begun
- `Completed` — all phases done

## Rules
- Always get the commit hash at time of creation
- Always auto-increment the number
- Always include a status field
- Always present the plan in chat after writing the file
- Never execute work from a plan that's still in Draft status
