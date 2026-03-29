# System Docs Management System

System documentation for the system-docs-agent — the agent that creates and maintains this very directory.

## Purpose

Maintains the `.codex/system_docs/` directory as the central reference mapping every agent, skill, configuration, and output path in the project. Automatically invoked after new agents or skills are created to ensure all components are documented, categorized, and indexed.

## When to Use

- After creating a new agent (auto-invoked via creating-claude-agents skill)
- After creating a new skill (auto-invoked via creating-claude-skills skill)
- When modifying or renaming existing agents/skills
- When deprecating agents/skills (moves docs to `deprecated/`)
- When the master index needs a manual refresh

## Architecture

```
┌─────────────────────────────────────────────────┐
│          System Docs Agent                       │
│   (Documentation Maintainer / Index Updater)     │
├─────────────────────────────────────────────────┤
│  1. Reads new agent/skill YAML frontmatter       │
│  2. Classifies: folder vs table entry            │
│  3. Creates system_docs README if folder         │
│  4. Updates master index (file tree + table)     │
│  5. Mirrors to both repos if needed              │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ New Agent│  │ New Skill│  │ Existing │
  │ Created  │  │ Created  │  │ Modified │
  └──────────┘  └──────────┘  └──────────┘
```

## Key Concepts

### Auto-Invocation

Both `creating-claude-agents` and `creating-claude-skills` skills include a mandatory final step that invokes the system-docs-agent.

### Classification

- **Folder** (`system_docs/<name>/README.md`): Multi-component systems, orchestrator/subagent pairs, skills with resources
- **Table entry** (in master index): Single standalone utility skills

### Master Index Sections

1. **File Tree** — visual map of every system folder
2. **Skills Not Mapped** — table for standalone skills
3. **System Overview** — summary table with counts

## Locations

| Component | Path |
|-----------|------|
| Agent | `.claude/agents/system-docs-agent/AGENT.md` |
| Skill | `.claude/skills/system-docs-agent/SKILL.md` |
| Index | `.codex/system_docs/README.md` |

## Integration Points

- **extensibility** — system-docs-agent consumes what the agent/skill creation guides produce
- **claude_codex_sync** — System docs changes may need mirroring via the sync agent
