# Do-Over — Usage Guide

## Quick Start
```
"restore config from do-over-files"
```

## When to Use
- After a failed agent run corrupted configuration files
- To verify the current config matches the pristine copy
- When setting up a new repo from the template

## What It Contains
The `do-over-files/` directory mirrors the `.claude/` and `.codex/` structure with known-good versions of agents, skills, hooks, and system docs.

## Troubleshooting
**Do-over files out of date:** After making intentional changes to agents/skills, update do-over-files too.
