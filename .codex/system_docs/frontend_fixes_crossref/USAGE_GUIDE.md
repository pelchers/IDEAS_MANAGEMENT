# Frontend Fixes Cross-Reference — Usage Guide

## Searching for a Fix
```
/frontend-fix search carousel
/frontend-fix search gsap spacing
/frontend-fix list
```

Or ask the agent directly:
```
"Check the frontend fixes library for infinite scroll issues"
```

## Adding a New Fix

1. Create subfolder: `.claude/skills/frontend-fixes-crossref/references/<kebab-name>/`
2. Add three files:
   - `README.md` — Problem, root cause, fix summary, categories
   - `fix.ts` (or .tsx/.css/.js) — Copy-pasteable fix code with comments
   - `explainer.md` — Deep dive: why it happens, edge cases, references
3. Update `references/index.json` with entry metadata
4. Commit with: `docs: add frontend fix — <name>`

## Entry Quality Checklist
- [ ] README has Problem, Root Cause, Fix, and Categories sections
- [ ] Fix code file is self-contained and copy-pasteable
- [ ] Explainer includes "Why the Fix Works" and "Edge Cases"
- [ ] Index.json has categories and keywords for searchability
