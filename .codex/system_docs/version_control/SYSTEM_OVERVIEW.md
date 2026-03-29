# Version Control — System Overview

## What This System Does

Governs Git workflow conventions for Claude Code agents in this project. Two skills
enforce distinct concerns: atomic, conventional commits for day-to-day discipline,
and savepoint branches for named milestone snapshots. A progress log provides a
human-readable audit trail alongside git history.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Git Workflow Agent | `.claude/agents/git-workflow-agent/AGENT.md` | Day-to-day commit discipline |
| Savepoint Agent | `.claude/agents/savepoint-agent/AGENT.md` | Milestone snapshot branches |
| Git Workflow Skill | `.claude/skills/managing-git-workflows/SKILL.md` | Commit rules + push policy |
| Savepoint Skill | `.claude/skills/savepoint-branching/SKILL.md` | Named savepoint creation |
| Progress Log | `logs/development-progress.md` | Running commit narrative |

## Commit Conventions Summary

```
feat: Add school profile page
fix(auth): handle expired session tokens
docs: Update API endpoint reference
chore(deps): Upgrade Next.js to 15.1
```

- Type prefix always required
- Subject: imperative, lowercase, no period
- Body: "why" not "what"
- Agent commits include `Co-Authored-By:` trailer

## When to Use

| Scenario | Use |
|----------|-----|
| Standard feature commit | `managing-git-workflows` skill (enforced automatically) |
| Session or phase complete | `/savepoint` or `savepoint-branching` skill |
| Pre-deployment milestone | Savepoint branch |
| Committing after a pre-commit hook failure | Create a NEW commit — never amend |
| Audit trail needed | Check `logs/development-progress.md` |

## Savepoint Branch Naming

```
savepoint/session-3-complete
savepoint/pre-deployment-2026-03
savepoint/after-hardening
```

Savepoints are reference branches only — work continues on `main`.

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **session_orchestration** | Step 10 of every phase is a mandatory commit + push |
| **user_story_testing** | Test pass evidence committed at session boundaries |
| **adr_setup** | Phase files, reviews, and task lists committed per phase |
| **hooks_system** | Pre-commit hooks may validate formatting or run type checks |

## Core Principles

1. **Atomic commits** — one logical change per commit
2. **Conventional messages** — typed prefixes for parseable history
3. **Agent attribution** — `Co-Authored-By:` trailer on autonomous commits
4. **Progress logging** — each commit has a corresponding log entry
5. **Savepoints** — named branches at milestones, never destructive
6. **HTTPS only** — no SSH remotes, no hardcoded URLs

## Design Decisions

- **Stage named files** over `git add -A` to prevent accidental secret commits
- **Heredoc for multi-line messages** ensures correct formatting across shells
- **Never amend published commits**: pre-commit hook failure = new commit, not amend
- **Never force-push to main**: blocked by skill guidelines; use feature branches + merge
- **Progress log as narrative**: git log is machine-readable; progress log is human-readable

## Quick Invocation

```
/commit-and-push
/savepoint
"commit these changes with a descriptive message"
```
