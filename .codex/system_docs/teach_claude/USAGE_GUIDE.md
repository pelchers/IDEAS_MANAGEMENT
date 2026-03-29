# Usage Guide: Teach Claude

## Quick Start

```
/skill teach-claude
```

Then ask configuration questions in the conversation.

## Detailed Usage

### Finding Config Paths

Ask: "Where does Claude Code store global settings on Windows?"
References `references/claude/global-paths.md`.

### Skill Frontmatter Format

```yaml
---
name: my-skill-name
description: One-line description
user_invocable: true   # optional — enables /skill invocation
---
```

Full format: `references/claude/skills-agents-format.md`

### Adding an MCP Server

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my-org/mcp-server"],
      "env": { "API_KEY": "${MY_API_KEY}" }
    }
  }
}
```

File: `.claude/settings.json` (project) or `~/.claude/settings.json` (global).
Full config: `references/claude/settings-config.md`

### Cross-Tool (Codex CLI)

Ask: "How do I create the same skill in Codex CLI?"
References `references/codex/skills-agents-format.md`.

## Troubleshooting

**Reference files missing** — Recreate the `references/` subdirectories from the SKILL.md structure definition.

**Codex references outdated** — Maintained manually; check the official Codex CLI changelog if behavior differs.
