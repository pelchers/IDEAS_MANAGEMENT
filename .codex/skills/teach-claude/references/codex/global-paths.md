# OpenAI Codex CLI — Global Paths & Directory Structure

## Global config directory
`C:\Users\pelyc\.codex\`

## Key files and directories

| Path | Purpose |
|------|---------|
| `~/.codex/config.toml` | Main config file — model, MCP servers, project trust, features |
| `~/.codex/auth.json` | Authentication credentials |
| `~/.codex/skills/<name>/SKILL.md` | Global skills (available in all projects) |
| `~/.codex/agents/<name>/AGENT.md` | Global agents |
| `~/.codex/memories/` | Global memory storage |
| `~/.codex/rules/` | Global rules |
| `~/.codex/sessions/` | Session history |

## Project-level paths (inside a repo)

| Path | Purpose |
|------|---------|
| `.codex/skills/<name>/SKILL.md` | Project-scoped skills |
| `.codex/agents/<name>/AGENT.md` | Project-scoped agents |
| `.codex/system_docs/<name>/README.md` | System documentation entries |
| `.codex/rules/*.md` | Project rules |
| `CODEX.md` | Root project instructions |
| `.codex/CODEX.md` | Additional project instructions |

## Adding a global skill
Write files to `~/.codex/skills/<skill-name>/SKILL.md`. Auto-discovered.

## Adding a global agent
Write files to `~/.codex/agents/<agent-name>/AGENT.md`. Auto-discovered.
