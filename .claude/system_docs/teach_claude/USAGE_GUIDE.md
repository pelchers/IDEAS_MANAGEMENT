# Usage Guide: Teach Claude

## Quick Start

```
/skill teach-claude
```

After loading, ask configuration questions directly in the conversation.

## Detailed Usage

### Finding Config Paths

Ask: "Where does Claude Code store global settings on Windows/Mac/Linux?"
The skill points you to `references/claude/global-paths.md` which lists exact filesystem paths.

### Modifying Settings

Ask: "How do I add a new MCP server to Claude Code?"
The skill references `references/claude/settings-config.md` with the exact JSON structure.

### Creating Skills/Agents

Ask: "What frontmatter fields are required in SKILL.md?"
References: `references/claude/skills-agents-format.md`

Required frontmatter:
```yaml
---
name: my-skill-name
description: One-line description of what this skill does
---
```

Optional fields: `user_invocable`, `trigger`, `category`, `tags`, `related_skills`

### Cross-Tool Configuration

Ask: "How do I configure an equivalent skill in Codex CLI?"
The skill reads from `references/codex/skills-agents-format.md` to explain the differences.

### MCP Server Setup Example

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my-org/mcp-server"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

Location: `.claude/settings.json` (project) or `~/.claude/settings.json` (global)

## Troubleshooting

**Reference files not found**
The skill references files in `.claude/skills/teach-claude/references/`. If the directory is missing, the skill definition itself (`SKILL.md`) still exists and provides the structure — recreate the references directory from scratch if needed.

**Codex references outdated**
These reference docs are maintained manually. Check the official Codex CLI changelog if behavior differs from what the references describe.
