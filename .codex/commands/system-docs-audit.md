---
name: system-docs-audit
description: Audit all system docs for completeness — report gaps and optionally auto-create missing docs
invocable: true
---

# System Docs Audit (/system-docs-audit)

Scan all agents, skills, and hooks in `.claude/` and check if corresponding system documentation exists and meets the minimum requirements defined in the `system-docs-agent` skill.

## What It Does

1. **Scan** all agents (`.claude/agents/*/AGENT.md`), skills (`.claude/skills/*/SKILL.md`), and hooks
2. **Group** related components into systems (agent+skill pairs, orchestrator+subagent pairs)
3. **Check** each system against minimum requirements:
   - README.md exists? (required for all)
   - USAGE_GUIDE.md exists? (required for all)
   - ARCHITECTURE.md exists? (required for 2+ component systems)
   - SYSTEM_OVERVIEW.md exists? (required for 2+ component systems)
4. **Report** gaps in a clear table format
5. **If `--fix` is passed or user approves:** auto-create missing docs using the reference templates from `.claude/skills/system-docs-agent/references/`

## Usage
```
/system-docs-audit              # report only
/system-docs-audit --fix        # report + auto-create missing
```

## Conventions
Follow the `system-docs-agent` skill for:
- Minimum file requirements (README + USAGE_GUIDE for all, + ARCHITECTURE + SYSTEM_OVERVIEW for multi-component)
- Diagram guidelines (Mermaid for complex flows, ASCII for simple trees)
- Reference examples in `.claude/skills/system-docs-agent/references/`

## After Audit
- Mirror all new/updated docs to `.codex/system_docs/`
- Sync to repos listed in `SYNC-REPOS.md`

$ARGUMENTS
