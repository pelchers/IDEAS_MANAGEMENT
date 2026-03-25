# Version Control — Usage Guide

## Quick Start

### Commit Current Work
```
/commit-and-push
```
Creates an atomic commit following project conventions and pushes to remote.

### Standard Commit (manual)
```
"commit these changes with a descriptive message"
```
The managing-git-workflows skill enforces atomic commits with clear messages.

## Commit Conventions
- Prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
- Co-author line: `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
- HTTPS remotes only (no SSH)
- Never amend published commits unless explicitly asked
- Never force-push to main/master

## Workflow
1. Stage specific files (prefer named files over `git add -A`)
2. Write descriptive commit message (why, not just what)
3. Use heredoc for multi-line messages
4. Push with `-u` flag for new branches

## Branch Strategy
- `main` is the primary branch
- Feature work committed directly to main (this project's convention)
- Savepoint branches via `/savepoint` for milestones

## Troubleshooting
**Pre-commit hook fails:** Fix the issue, create a NEW commit (don't amend).
**Merge conflicts:** Resolve conflicts rather than discarding changes.
