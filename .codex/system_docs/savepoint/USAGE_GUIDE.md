# Usage Guide: Savepoint

## Quick Start

After completing a significant milestone:

```
/agent savepoint-agent "savepoint 3 - backend API complete"
```

Result: branch `savepoint-3-backend-api-complete` created and pushed.

## Detailed Usage

### Basic Savepoint

```
/agent savepoint-agent "Create savepoint after login feature is done"
```

The agent normalizes the name, creates the branch from current HEAD, pushes it, then returns to your working branch.

### With Uncommitted Changes

If you have uncommitted work, the agent commits it first on the current branch before creating the savepoint:

```
/agent savepoint-agent "savepoint 2 - midway through auth, save progress"
```

Agent will commit outstanding changes, then branch.

### Savepoint Without Agent (Manual)

```bash
# Get current branch
git branch --show-current  # e.g., main

# Create and push savepoint
git branch savepoint-1-my-milestone
git push origin savepoint-1-my-milestone --set-upstream

# Stay on current branch (don't checkout savepoint)
```

### Restoring from a Savepoint

```bash
git checkout savepoint-1-my-milestone
```

Or create a new working branch from it:

```bash
git checkout -b recovery-from-savepoint-1 savepoint-1-my-milestone
```

## Troubleshooting

**Push fails with authentication error**
Ensure the remote is set to HTTPS (not SSH): `git remote get-url origin`. Update if needed: `git remote set-url origin https://...`.

**Agent commits wrong files**
The agent stages all changes before committing. To control what gets committed, manually stage files before requesting a savepoint.

**Branch name already exists**
Use a unique descriptor or number: `savepoint-1b-auth-hotfix` instead of `savepoint-1-auth`.
