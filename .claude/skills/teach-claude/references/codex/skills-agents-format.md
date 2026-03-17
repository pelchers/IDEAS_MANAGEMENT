# OpenAI Codex CLI — Skills & Agents Format

## Skill format

Same directory structure as Claude Code:

```
skills/<skill-name>/
  SKILL.md              # Required — main skill file
  references/           # Optional — supporting docs
  scripts/              # Optional — helper scripts
```

### SKILL.md structure

```markdown
---
name: my-skill
description: One-line description
user_invocable: true
---

# Skill Title

Instructions and reference content.
```

The format is intentionally compatible with Claude Code skills for cross-tool sync.

## Agent format

```
agents/<agent-name>/
  AGENT.md              # Required — agent definition
```

### AGENT.md structure

```markdown
---
name: my-agent
description: What this agent does
tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Agent instructions

Detailed behavior instructions.
```

## Cross-tool sync

Skills and agents use the same file format in both `.claude/` and `.codex/` directories. This enables the `syncing-claude-codex` skill to keep them in sync bidirectionally. When creating a new skill or agent:

1. Write to `.claude/skills/<name>/` (or `.claude/agents/<name>/`)
2. Copy to `.codex/skills/<name>/` (or `.codex/agents/<name>/`)
3. Sync to all repos listed in `SYNC-REPOS.md`

## Differences from Claude

- Codex config is TOML (`config.toml`), not JSON
- Codex uses `CODEX.md` instead of `CLAUDE.md` for project instructions
- MCP servers defined in `config.toml` under `[mcp_servers]` section
- System docs live in `.codex/system_docs/` (Claude doesn't have this)
