# Claude Code — Global Paths & Directory Structure

## Global config directory
`C:\Users\pelyc\.claude\`

## Key files and directories

| Path | Purpose |
|------|---------|
| `~/.claude.json` | Main config file — MCP servers, project-level settings, permissions |
| `~/.claude/settings.json` | User-level settings — permissions, env vars, hooks |
| `~/.claude/skills/<name>/SKILL.md` | Global skills (available in all projects) |
| `~/.claude/agents/<name>/AGENT.md` | Global agents |
| `~/.claude/projects/<project-path>/memory/` | Per-project memory files |
| `~/.claude/projects/<project-path>/memory/MEMORY.md` | Memory index for a project |
| `~/.claude/projects/<project-path>/CLAUDE.md` | User-specific project instructions (not checked into repo) |

## Project-level paths (inside a repo)

| Path | Purpose |
|------|---------|
| `.claude/skills/<name>/SKILL.md` | Project-scoped skills |
| `.claude/agents/<name>/AGENT.md` | Project-scoped agents |
| `.claude/rules/*.md` | Project rules (loaded automatically) |
| `CLAUDE.md` | Root project instructions (checked into repo) |
| `.claude/CLAUDE.md` | Additional project instructions |

## Precedence
- Project-level skills/agents override global ones with the same name
- `CLAUDE.md` files are loaded hierarchically (root > `.claude/` > user-specific)
- Settings merge: project settings extend user settings

## Adding a global skill
Write files to `~/.claude/skills/<skill-name>/SKILL.md` (and optional `references/` subfolder). No registration step needed — Claude discovers skills by scanning the directory.

## Adding a global agent
Write files to `~/.claude/agents/<agent-name>/AGENT.md`. Same auto-discovery.
