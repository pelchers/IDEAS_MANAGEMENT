---
name: component-creation-pipeline
description: Full pipeline for creating agents, skills, hooks, commands, and system docs with no gaps.
---

## Purpose
Ensures every new component (agent, skill, hook, command) is created with its full supporting infrastructure — no orphaned agents without docs, no skills without hooks, no commands without $ARGUMENTS.

## Pipeline Steps
1. **Determine scope** — what's needed? Agent? Skill? Hook? Command? All?
2. **Create agent** — AGENT.md with purpose, workflow, skills used, constraints
3. **Create skill** — SKILL.md with trigger conditions, behavior rules, references
4. **Create hook** — .sh script if auto-triggering needed, register in settings.json
5. **Create command** — .md with $ARGUMENTS if user-invocable
6. **Create system docs** — README + USAGE_GUIDE minimum, + ARCHITECTURE + SYSTEM_OVERVIEW for multi-component
7. **Mirror to .codex/** — all files
8. **Sync to repos** — SYNC-REPOS.md
9. **Report** — list what was created

## Conventions
- Follow `creating-claude-agents` for agent format
- Follow `creating-claude-skills` for skill format
- Follow `system-docs-agent` for docs format + minimum requirements
- All commands must have `$ARGUMENTS`
- All hooks must be registered in settings.json
