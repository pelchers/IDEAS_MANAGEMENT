---
name: teach-claude
description: Reference guide for Claude and Codex configuration systems — global paths, settings, skills/agents format, and MCP server setup. Enables self-modification of either tool's configuration.
user_invocable: true
---

# Teach Claude (and Codex)

This skill provides reference documentation for configuring and extending both Claude Code and OpenAI Codex CLI tools. Use it when you need to:

- Find where global config, skills, agents, or memory files live on disk
- Modify settings (permissions, hooks, MCP servers)
- Create or modify skills and agents
- Understand how one tool's configuration differs from the other

## References

### Claude Code
- [Global paths & directory structure](references/claude/global-paths.md)
- [Settings & configuration](references/claude/settings-config.md)
- [Skills & agents format](references/claude/skills-agents-format.md)

### OpenAI Codex CLI
- [Global paths & directory structure](references/codex/global-paths.md)
- [Settings & configuration](references/codex/settings-config.md)
- [Skills & agents format](references/codex/skills-agents-format.md)

## Why both?

Both reference subfolders exist in every copy so that either tool can read about the other. This enables cross-tool configuration — e.g., Claude can modify Codex settings and vice versa when instructed by the user.
