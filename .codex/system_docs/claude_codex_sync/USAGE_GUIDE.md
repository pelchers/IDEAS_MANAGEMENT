# Claude-Codex Sync — Usage Guide

## Quick Start

### Sync After Creating New Components
```
User: "sync the new feature-expansion agent to codex"
User: "run claude-codex sync"
```
The sync agent copies and transforms files between `.claude/` and `.codex/` directories.

### Automatic Sync
The `creating-claude-agents` and `creating-claude-skills` skills include a sync step. When you create a new agent or skill, it auto-syncs to the other provider directory.

## What Gets Synced

| Source | Destination | Transform |
|---|---|---|
| `.claude/agents/<name>/AGENT.md` | `.codex/agents/<name>/AGENT.md` | Path substitution (.claude → .codex) |
| `.claude/skills/<name>/SKILL.md` | `.codex/skills/<name>/SKILL.md` | Path substitution |
| `.claude/system_docs/<name>/` | `.codex/system_docs/<name>/` | Path substitution |
| `.claude/commands/<name>.md` | `.codex/commands/<name>.md` | Path substitution |
| `.claude/hooks/scripts/*.sh` | `.codex/hooks/scripts/*.sh` | Direct copy |

## Cross-Repo Sync
For syncing to other repositories (Template, AppDock, etc.), see `SYNC-REPOS.md` in the project root. Use the `maintaining-trinary-sync` skill for multi-repo sync.

## Direction
Sync is bidirectional — changes in either `.claude/` or `.codex/` can be synced to the other. The sync agent detects which side has newer content.

## Components

| Component | Path |
|---|---|
| Agent | `.claude/agents/claude-codex-sync-agent/AGENT.md` |
| Skill | `.claude/skills/syncing-claude-codex/SKILL.md` |
