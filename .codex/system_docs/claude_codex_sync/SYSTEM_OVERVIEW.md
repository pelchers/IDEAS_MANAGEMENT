# System Overview: Claude-Codex Sync

## What It Is

Claude-Codex Sync maintains bidirectional parity between `.claude/` (Claude Code's native format) and `.codex/` (OpenAI Codex/Agents format). The two providers use different naming conventions and structural requirements; this system translates between them automatically without losing content.

## Component Map

```
.claude/
├── agents/claude-codex-sync-agent/agent.md     # Sync execution agent
└── skills/syncing-claude-codex/SKILL.md         # Transformation rules

.claude/  (source or target)          .codex/  (source or target)
├── agents/<name>/agent.md    ←────→  ├── agents/<name>/AGENT.md
│                                     │   agents/<name>.md  (stub)
├── skills/<name>/SKILL.md    ←────→  ├── skills/<name>/SKILL.md
│   ├── references/           ←────→  │   ├── references/
│   └── scripts/              ←────→  │   └── scripts/
└── system_docs/<folder>/     ←────→  └── system_docs/<folder>/
```

## When to Use vs Alternatives

| Scenario | Use claude_codex_sync | Alternative |
|----------|----------------------|-------------|
| New agent created in .claude/ | Yes — sync to .codex/ immediately | Manual copy (error-prone) |
| Agent edited in .codex/ | Yes — sync back to .claude/ | Manual copy |
| Pre-commit check | Yes — bidirectional verify | `diff -r` (no transformation) |
| Syncing to other repositories | No — use trinary_sync instead | trinary_sync |
| Syncing hooks or commands | Partial — commands yes, hooks are .codex/ only | N/A |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **extensibility** | creating-claude-agents and creating-claude-skills include a sync step |
| **agnostic_verification** | Run verification after sync to catch leaked project-specific values |
| **trinary_sync** | trinary_sync propagates across repos; claude-codex sync translates within a repo |
| **feature_expansion** | New FEA components sync after creation |

## What Is Never Synced

- `deprecated/` folders — maintained independently per provider
- Runtime artifacts: `.cache/`, `logs/`, `temp/`
- Provider-specific configs: `mcp.json`, `CODEX.md`, `AGENTS.md`
- Codex-only directories: `commands/`, `hooks/`, `orchestration/`, `templates/`

## Recommended Sync Order

When both trinary sync and claude-codex sync are needed:
1. Run claude-codex sync first (format translation within the repo)
2. Run trinary sync second (propagate the result to other repo copies)

## Design Decisions

**Why strip YAML frontmatter in the Codex → Claude direction?**
Claude Code's agent format is plain markdown — YAML frontmatter breaks agent loading. The metadata is only needed by Codex's agent runtime.

**Why generate a stub file in .codex/ but not in .claude/?**
Codex has a separate agents index that reads stub files for discovery. Claude Code discovers agents by directory scan — no stub needed.

**Why substitute paths in markdown body only (not frontmatter)?**
Frontmatter field values are structured data, not prose. Path references appear in the prose body where they direct humans to the right files.

## Constraints

- Sync never deletes target files — only overwrites or creates
- Exclusion list is checked before any write operation
- After sync, run agnostic_verification to confirm no absolute paths leaked through
