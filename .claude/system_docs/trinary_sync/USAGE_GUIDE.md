# Trinary Sync — Usage Guide

## Quick Start

### Sync a New Component
```
"sync the new chain-agent to all repos"
```
The maintaining-trinary-sync skill copies the component to all directories listed in SYNC-REPOS.md.

### Check Sync Status
```
"check if all repos are in sync"
```
Reports which files differ across repos.

## What Gets Synced
- `.claude/agents/<name>/AGENT.md`
- `.claude/skills/<name>/SKILL.md`
- `.claude/system_docs/<name>/*.md`
- `.claude/commands/<name>.md`
- `.claude/hooks/scripts/<name>.sh`
- All of the above mirrored in `.codex/`

## Target Repos (from SYNC-REPOS.md)
| Repo | Path |
|---|---|
| Template | `C:\Template\Claude+Codex Agent+Skill Sync\All` |
| MockTrial | `C:\Game\MockTrial.game` |
| AppDock | `C:\App\AppDock` |
| PortfolioV1 | `C:\App\PortfolioV1` |
| IDEA-MANAGEMENT | `C:\Ideas\IDEA-MANAGEMENT` |

## Sync Procedure
1. Create/modify component in `.claude/`
2. Mirror to `.codex/` (same content, path substitution)
3. Copy to all repos from SYNC-REPOS.md
4. Verify with file count check

## Troubleshooting
**File missing in a repo:** Re-run sync. Check SYNC-REPOS.md for correct paths.
**Codex version out of date:** Run `syncing-claude-codex` skill first, then trinary sync.
