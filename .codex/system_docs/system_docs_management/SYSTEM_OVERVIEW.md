# System Docs Management — System Overview

## What This System Does

Maintains the `.codex/system_docs/` directory as the central reference for every agent,
skill, hook, and configuration in the project. Automatically invoked when new components
are created. Keeps the master index accurate with minimal manual effort.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Agent | `.claude/agents/system-docs-agent/AGENT.md` | Documentation maintainer + index updater |
| Skill | `.claude/skills/system-docs-agent/SKILL.md` | Invocation guide + classification rules |
| Master Index | `.codex/system_docs/README.md` | File tree + skills table + system overview |
| System Folders | `.codex/system_docs/<name>/` | Per-system documentation directories |

## When to Use

| Trigger | Action |
|---------|--------|
| Created a new agent | Auto-invoked by `creating-claude-agents` skill |
| Created a new skill | Auto-invoked by `creating-claude-skills` skill |
| Renamed or modified an agent/skill | Manual: `/agent system-docs-agent "Rename X to Y"` |
| Deprecated a component | Manual: `/agent system-docs-agent "Deprecate X"` |
| Master index is stale | Manual: `/agent system-docs-agent "Refresh the master index"` |

## Folder vs Table Row Decision

```
Gets a system_docs/ folder:          Gets a table row only:
─────────────────────────────        ───────────────────────
Orchestrator + subagent pairs        Single-purpose utility skill
Multi-skill systems                  No resources/ subdirectory
Skills with resources/               No paired agent
Hook-backed systems
```

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **extensibility** | system-docs-agent consumes output from `creating-claude-agents` + `creating-claude-skills` |
| **claude_codex_sync** | System docs changes may need mirroring between `.claude/` and `.codex/` |
| **hooks_system** | Auto-invocation is wired into agent/skill creation skills as a final step |

## Output Artifacts

```
.codex/system_docs/
  README.md                 — master index (file tree + skills table + system overview)
  <system-name>/
    README.md               — system-level overview
    ARCHITECTURE.md         — component flow, diagrams, error handling
    SYSTEM_OVERVIEW.md      — reference doc with component map, when-to-use, decisions
    USAGE_GUIDE.md          — invocation examples, troubleshooting
  deprecated/
    <name>/                 — archived docs for removed components
```

## Design Decisions

- **Auto-invocation as default**: documentation is never optional when creating components
- **Filesystem as truth**: the agent re-indexes by scanning the actual directory tree
- **Two-tier classification**: folders for systems (multi-component), table rows for utilities
- **Frontmatter-driven**: `name:` and `description:` fields in AGENT.md/SKILL.md drive generation
- **Mirror awareness**: changes may propagate to `.codex/system_docs/` for cross-environment sync

## Quick Invocation

```
/agent system-docs-agent "Document the new search-agent I just created"
/agent system-docs-agent "Refresh the master index — several agents were modified"
/agent system-docs-agent "Deprecate the old sync-agent"
```
