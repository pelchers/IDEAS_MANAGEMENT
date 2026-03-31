# Frontend Fixes Cross-Reference — System Documentation

## Overview
A universal cross-reference library of frontend fixes, patterns, and gotchas. Each fix is documented with root cause analysis, code snippets, and explainer so non-obvious issues never need to be re-debugged.

## Components

| Component | Location | Purpose |
|---|---|---|
| Agent | `.claude/agents/frontend-fixes-crossref-agent/AGENT.md` | Consult/contribute to the library |
| Skill | `.claude/skills/frontend-fixes-crossref/SKILL.md` | Library structure, add/search workflow |
| Command | `.claude/commands/frontend-fix.md` | `/frontend-fix` slash command |
| References | `.claude/skills/frontend-fixes-crossref/references/` | Fix entries (subfolders) |
| Index | `.claude/skills/frontend-fixes-crossref/references/index.json` | Searchable metadata |

## Architecture
```
frontend-fixes-crossref/
  SKILL.md                          # How to use the library
  references/
    index.json                      # Searchable index of all entries
    <fix-name>/                     # One subfolder per fix
      README.md                     # Problem + root cause + fix summary
      fix.ts                        # Copy-pasteable fix code
      explainer.md                  # Deep dive with edge cases + refs
```

## Current Entries

| Entry | Categories | Added |
|---|---|---|
| `infinite-vertical-carousel` | animation, gsap, carousel | 2026-03-30 |

## Integration Points
- Agent searches library before attempting frontend fixes
- New fixes are added during development when non-obvious solutions are found
- Command provides quick CLI access via `/frontend-fix`
