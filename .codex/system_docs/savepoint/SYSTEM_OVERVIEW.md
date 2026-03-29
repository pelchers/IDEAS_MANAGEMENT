# System Overview: Savepoint

## What It Is

The Savepoint system creates named milestone branches from the current commit state and pushes them to remote. It provides reproducible rollback points without disrupting the working branch — the agent returns you to your original branch after the savepoint is created.

## Component Map

```
.claude/
├── agents/savepoint-agent/AGENT.md         # Savepoint creation agent
└── skills/savepoint-branching/SKILL.md     # Naming rules, git commands, error handling
```

## When to Use vs Alternatives

| Scenario | Use savepoint | Alternative |
|----------|--------------|-------------|
| Milestone completion (end of phase) | Yes | Tag with `git tag` |
| Before a risky change | Yes | Stash with `git stash` |
| Mid-session checkpoint | Yes | Commit on current branch |
| Formal release | No — use version tags | `git tag v1.0.0` |
| Backing up uncommitted changes | No — commit first | `git stash` |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **adr_setup** | Natural trigger: create savepoint after each phase completes |
| **session_orchestration** | Orchestrators create savepoints at session boundaries |
| **chat_reports** | Report Section 8 (Metrics) includes savepoint branch names created during session |
| **version_control** | Relies on HTTPS remote — never hardcoded URL |

## Naming Convention

Format: `savepoint-<number>-<descriptor>` (all lowercase-kebab)

| User says | Branch created |
|-----------|---------------|
| "savepoint 1 after login" | `savepoint-1-after-login` |
| "milestone phase 3 done" | `savepoint-milestone-phase-3-done` |
| "checkpoint before payments" | `savepoint-checkpoint-before-payments` |

The number is optional but recommended for ordering. The descriptor should be meaningful enough to identify the state without reading the diff.

## What the Agent Does and Doesn't Do

**Does:**
- Normalize the name to lowercase-kebab
- Commit any uncommitted changes before branching (with a warning)
- Push the savepoint branch with upstream tracking
- Return to the original working branch

**Does not:**
- Merge anything
- Delete branches
- Reset or rebase
- Create releases or tags

## Design Decisions

**Why branch instead of tag?**
Branches are easier to navigate and restore from. Tags require additional git commands to create a working branch from. For developers who may need to recover quickly, `git checkout savepoint-1-auth-complete` is more intuitive than `git checkout -b recovery v1.0-savepoint`.

**Why push immediately?**
A savepoint only on the local machine offers no protection against local disk failure. Pushing immediately to remote makes it a true off-machine backup.

**Why return to the original branch?**
The savepoint branch is a read-only reference, not a work branch. Leaving the user on it would cause confusion about where to commit next.

## Constraints

- Remote must be configured as HTTPS (not SSH) per project convention
- Branch names follow strict lowercase-kebab format
- Agent commits uncommitted changes before branching (with explicit warning to user)
- Never force-pushes savepoint branches
