# Usage Guide: System Docs Management

## Quick Start

The system-docs-agent is auto-invoked after creating agents or skills. You rarely need to call it directly, but you can trigger it manually to refresh the index or document a new component.

```
/agent system-docs-agent "Document the new search-agent I just created"
```

## Detailed Usage

### Auto-Invocation (Normal Path)

When you use `creating-claude-agents` or `creating-claude-skills`, the system-docs-agent runs as the final step automatically. No manual action needed.

### Manual Refresh

When the master index is out of sync after manual edits:

```
/agent system-docs-agent "Refresh the master index — several agents were modified"
```

### Deprecating a Component

```
/agent system-docs-agent "Deprecate the old sync-agent — it was replaced by claude-codex-sync"
```

The agent moves docs to `.codex/system_docs/deprecated/`.

### Renaming a Component

```
/agent system-docs-agent "Rename research-agent to research-automation-agent in all docs"
```

## Folder vs Table Entry Decision

When a new component is created, the agent decides automatically:
- **Gets a folder** (`system_docs/<name>/README.md`): Multi-component systems, orchestrator/subagent pairs, skills with resources subdirectories
- **Gets a table row** (in `system_docs/README.md`): Single standalone utility skills

## Troubleshooting

**Index is stale after bulk file moves**
Run manual refresh. The agent reads from the filesystem directly, so after moves it will re-index correctly.

**New agent not appearing in index**
Check that its AGENT.md has a valid `name:` frontmatter field. The agent uses frontmatter to classify and name entries.

**system_docs folder created but README.md is sparse**
The agent uses YAML frontmatter from AGENT.md/SKILL.md to generate the README. Ensure the source file has `name:` and `description:` fields.
