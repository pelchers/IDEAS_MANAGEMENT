# System Docs: Teach Claude

## Overview

Reference guide for Claude Code and OpenAI Codex CLI configuration systems. Covers global paths, settings, skills/agents format, and MCP server setup for both tools. Enables self-modification of either tool's configuration.

## Components

| Component | Path |
|-----------|------|
| Skill | `.claude/skills/teach-claude/SKILL.md` |
| Claude references | `.claude/skills/teach-claude/references/claude/` |
| Codex references | `.claude/skills/teach-claude/references/codex/` |

## Reference Files

| File | Purpose |
|------|---------|
| `references/claude/global-paths.md` | Where Claude Code stores config, skills, agents, memory on disk |
| `references/claude/settings-config.md` | Permissions, hooks, MCP servers in settings.json |
| `references/claude/skills-agents-format.md` | SKILL.md and AGENT.md frontmatter format |
| `references/codex/global-paths.md` | Codex CLI config paths |
| `references/codex/settings-config.md` | Codex settings format |
| `references/codex/skills-agents-format.md` | Codex skill/agent format |

## How to Use

```
/skill teach-claude
```

Then ask questions like:
- "Where does Claude store global settings?"
- "How do I add an MCP server to Claude Code?"
- "What's the format for a SKILL.md frontmatter?"
- "How do I create a global agent that works across all projects?"

## Why Both Tools?

Both `references/claude/` and `references/codex/` exist in every copy so either tool can read about the other. This enables cross-tool configuration (Claude can modify Codex settings and vice versa).

## Integration Points

- **extensibility** — Creating new skills/agents requires knowing the formats documented here
- **hooks_system** — `references/claude/settings-config.md` covers hook configuration
- **claude_codex_sync** — Understanding both config systems is prerequisite for sync operations
