# Sync Repos

When adding new agents, skills, or system docs to `.claude/` and `.codex/`, also sync them to these repos:

| Repo | Path | Notes |
|------|------|-------|
| Template | `C:\Template\Claude+Codex Agent+Skill Sync\All` | Primary template — all agents/skills/system_docs |
| MockTrial | `C:\Game\MockTrial.game` | Game project |
| AppDock | `C:\App\AppDock` | App project |
| PortfolioV1 | `C:\App\PortfolioV1` | Portfolio project |
| IDEA-MANAGEMENT | `C:\Ideas\IDEA-MANAGEMENT` | Idea management app  |
| Markdown Mermaid Editor | `C:\Extensions\Markdown Mermaid Editor` | VS Code extension |
| Campus | `C:\coding\apps\campus` | Campus app |

## What to sync

- `.claude/agents/<name>/AGENT.md`
- `.claude/skills/<name>/SKILL.md`
- `.claude/commands/<name>.md` when a component includes a slash command
- `.claude/hooks/scripts/<name>.sh` or `.ps1` when a component includes a hook
- `.claude/hooks/settings.json` when hook registration changes
- `.claude/system_docs/<name>/README.md`
- `.codex/agents/<name>/AGENT.md`
- `.codex/skills/<name>/SKILL.md`
- `.codex/commands/<name>.md` when a mirrored slash command exists
- `.codex/system_docs/<name>/README.md`

## How

Use the `syncing-claude-codex` skill for `.claude/` <-> `.codex/` sync within a repo.
Use the `maintaining-trinary-sync` skill or manual copy for cross-repo sync.
