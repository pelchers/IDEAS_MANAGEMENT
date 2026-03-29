# System Overview: Agnostic Verification

## What It Is

Agnostic Verification scans agents, skills, hooks, and orchestration files for hardcoded machine-specific values — absolute paths, project names, usernames — that would break portability when the same config is copied to a different machine or repository. It classifies findings by severity and auto-fixes blocking issues.

## Component Map

```
.claude/
├── agents/agnostic-verifier/AGENT.md                           # Scan + fix agent
└── skills/verifying-agnosticism/
    ├── SKILL.md                                                  # Severity rules, fix patterns
    └── scripts/scan-hardcoded-paths.js                          # Standalone scan script
```

## When to Use vs Alternatives

| Scenario | Use agnostic_verification | Alternative |
|----------|--------------------------|-------------|
| After syncing template files from another repo | Yes — first thing to run | Manual grep |
| Before publishing agents/skills to a template | Yes | Code review only |
| After cloning a template into a new project | Yes — one-time run | N/A |
| Routine development on a single machine | Not required | Skip |
| Checking a specific file | Script with `--dir` flag | `grep -rn "C:\\" file` |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **claude_codex_sync** | Run agnostic verification after any sync to catch leaked project-specific values |
| **extensibility** | Agent/skill templates should be verified before being distributed |
| **repo_setup** | Onboarding step: run once after cloning a template repo |
| **trinary_sync** | After trinary sync propagates files across repos, verify agnosticism in receiving repos |

## What "Agnostic" Means

A file is agnostic when it contains **no machine-specific, user-specific, or project-specific hardcoded values**. It can be dropped into any repo on any machine and work without modification. Dynamic path resolution (relative `__dirname`, `$PSScriptRoot`, `git rev-parse`) is always preferred.

## Scan Scope

Default scan covers:
- `.claude/` — all agents, skills, hooks, commands, settings
- `.codex/` — mirrored content
- `.adr/` — orchestration templates (not session notes)

Excluded from scan:
- `.chat-history/` — intentionally project-specific
- `node_modules/`
- Binary files

## Design Decisions

**Why auto-fix only Blocking severity?**
Portability issues require context to fix correctly — a project name in a doc might be intentional documentation. Auto-fixing those would break meaning. Only unambiguously wrong values (absolute OS paths) are auto-fixed.

**Why keep Cosmetic findings in the report?**
Example code blocks with hardcoded paths are acceptable when labeled, but they should be visible. Future maintainers might copy the example and forget the context.

**Why use `git rev-parse --show-toplevel` for shell scripts?**
It is the most portable way to find the repo root on any OS with git installed, regardless of where the script is called from.

## Constraints

- Agent never auto-fixes Portability or Cosmetic severity items
- All auto-fixes are verified with a second grep pass before reporting clean
- Scripts must be run from repo root unless `--dir` is specified
