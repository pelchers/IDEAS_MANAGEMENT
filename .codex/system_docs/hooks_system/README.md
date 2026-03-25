# System Docs: Hooks System

## Overview

Event-driven automation scripts that execute at specific points in the Claude Code workflow. Enables validation, safety guardrails, auto-formatting, test running, and workflow customization without modifying Claude Code itself.

## Components

| Component | Path |
|-----------|------|
| Skill | `.claude/skills/using-claude-hooks/SKILL.md` |
| Project hooks config | `.claude/settings.json` |
| Hook scripts | `.claude/hooks/scripts/` |

## Hook Types

| Hook | Trigger | Can Block? |
|------|---------|-----------|
| `SessionStart` | Claude Code starts | No |
| `UserPromptSubmit` | Before Claude processes input | Yes (exit 2) |
| `PreToolUse` | Before tool execution | Yes (exit 2) |
| `PostToolUse` | After tool succeeds | No |
| `Stop` | Claude finishes responding | No |
| `SessionEnd` | Session ends | No |
| `Notification` | On notifications | No |

## Exit Codes

- `0` — Allow / success
- `1` — Warning (show error, continue)
- `2` — Block (prevent operation, show error to Claude)

## Configuration Locations

| File | Scope |
|------|-------|
| `.claude/settings.json` | Project (committed, shared with team) |
| `~/.claude/settings.json` | User (all projects) |
| `.claude/settings.local.json` | Local overrides (gitignored) |

## How to Use

```
/skill using-claude-hooks
```

Then ask for a specific hook pattern: safety validation, auto-formatting, test running, session setup, etc.

## Integration Points

- **playwright_testing** — PostToolUse hooks can trigger Playwright tests after code edits
- **version_control** — PreToolUse hooks can validate commit messages, block force-push to main
- **research** — Research hook scripts live in `.claude/hooks/scripts/`
