# Pre-Planning — Usage Guide

## Quick Start
```
/plan "add a navbar to all pages"
```
Creates `.docs/planning/plans/2-add-navbar.md` (auto-numbered).

## Plan Lifecycle
1. `/plan` → creates Draft
2. User reviews, says "approved" → status updated to Approved
3. Work begins (FEA, chain, manual) → In Progress
4. All phases done → Completed

## File Format
```markdown
# Plan: [Title]
**Plan #:** 2
**Date:** 2026-03-27
**Commit:** abc1234
**Status:** Draft
```

## Tips
- Always plan before multi-phase work
- Reference the plan number in commits: "Implements plan #2"
- Plans persist in `.docs/planning/plans/` for future reference
