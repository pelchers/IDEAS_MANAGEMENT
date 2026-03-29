---
name: plan
description: Create a numbered plan file in .docs/planning/plans/
invocable: true
---

# Plan (/plan)

Create a structured plan file before beginning work. Plans are numbered, dated, and linked to a git commit.

## Usage
```
/plan "add subscription system to campus"
/plan "redesign the navbar"
/plan                                      # plan from current chat context
```

## Output
`.docs/planning/plans/#-plan-name.md` with auto-incremented number.

## Plan Includes
- Header: plan #, date, commit hash, status
- Context: current state
- Phases with checkboxes
- Questions for user

$ARGUMENTS
