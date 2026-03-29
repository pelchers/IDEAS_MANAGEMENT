# Usage Guide: Savepoint

## Quick Start

After completing a milestone:
```
/agent savepoint-agent "savepoint 3 - backend API complete"
```

Result: branch `savepoint-3-backend-api-complete` created, pushed, original branch restored.

## Detailed Usage

### Basic Savepoint

```
/agent savepoint-agent "Create savepoint after login feature is done"
```

Agent normalizes the name, creates branch from HEAD, pushes to remote, returns to original branch.

### With Uncommitted Changes

Agent commits outstanding changes first, then creates the savepoint branch.

### Manual (Without Agent)

```bash
git branch savepoint-1-my-milestone
git push origin savepoint-1-my-milestone --set-upstream
# Stay on current branch
```

### Restoring from a Savepoint

```bash
# Inspect
git checkout savepoint-1-my-milestone

# New branch from savepoint
git checkout -b recovery savepoint-1-my-milestone
```

### Naming Convention

| User input | Branch name |
|-----------|-------------|
| `savepoint 1 - auth complete` | `savepoint-1-auth-complete` |
| `milestone after phase 3` | `savepoint-milestone-after-phase-3` |

## Troubleshooting

**Push fails with auth error** — Verify remote is HTTPS: `git remote get-url origin`. Update with `git remote set-url origin https://...`.

**Agent commits wrong files** — Manually stage specific files before requesting savepoint.

**Branch name conflict** — Use a unique suffix: `savepoint-1b-auth-hotfix`.
