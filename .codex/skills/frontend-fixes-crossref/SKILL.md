---
name: frontend-fixes-crossref
description: Universal cross-reference library of frontend fixes, patterns, and gotchas. Consult before fixing UI bugs, append new discoveries.
---

# Frontend Fixes Cross-Reference

A living library of non-obvious frontend fixes discovered during development. Each fix is documented with root cause analysis, code, and explainer so the same issue never needs to be re-debugged.

## When to Use
- Before attempting a frontend fix — search the library first
- After discovering a non-obvious fix — add it to the library
- When reviewing code that uses a known-tricky pattern

## How to Search
1. Check `references/index.json` for category/keyword matches
2. Read the matching subfolder's `README.md` for the fix summary
3. Copy from `fix.ts` if applicable

## How to Add a New Entry

### 1. Create the subfolder
```
references/<kebab-case-name>/
```

### 2. Add required files

**README.md** — Quick reference
```markdown
# <Fix Name>

## Problem
<What goes wrong and when>

## Root Cause
<Why it happens — the actual technical reason>

## Fix
<One-paragraph summary of the solution>

## Categories
<comma-separated: animation, layout, state, rendering, carousel, gsap, etc.>
```

**fix.ts** (or .tsx, .css, .js) — The actual fix code, copy-pasteable with comments

**explainer.md** — Deep dive
```markdown
# <Fix Name> — Deep Dive

## Background
<Context: what library/pattern is involved>

## The Bug in Detail
<Step-by-step what happens>

## Why the Fix Works
<Technical explanation>

## Edge Cases
<When this might not apply or needs adjustment>

## References
<Links to docs, articles, forum posts>
```

### 3. Update the index
Add an entry to `references/index.json`:
```json
{
  "name": "<fix-name>",
  "title": "<Human-readable title>",
  "categories": ["animation", "gsap"],
  "keywords": ["carousel", "infinite", "spacing"],
  "added": "YYYY-MM-DD"
}
```

### 4. Commit
Stage all new files and commit with message: `docs: add frontend fix — <name>`

## Library Location
All entries live in: `.claude/skills/frontend-fixes-crossref/references/`
