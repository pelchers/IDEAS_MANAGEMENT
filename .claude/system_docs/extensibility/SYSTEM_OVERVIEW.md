# System Overview: Extensibility

## What It Is

The Extensibility system provides three mechanisms for customizing Claude Code behavior: agents (define who does work), skills (define what expertise is available), and hooks (define when automation fires). Three skills guide the creation process — one for agents, one for skills, and one for hooks.

## Component Map

```
.claude/
├── skills/
│   ├── creating-claude-agents/
│   │   ├── SKILL.md                                    # Agent creation guide
│   │   ├── scripts/agent-template.md                  # Starter template
│   │   └── resources/
│   │       ├── agent-architecture.md                   # Architecture reference
│   │       └── subagent-patterns.md                    # Orchestrator/subagent patterns
│   ├── creating-claude-skills/
│   │   ├── SKILL.md                                    # Skill creation guide
│   │   ├── scripts/skill-template.md                  # Starter template
│   │   └── resources/progressive-disclosure.md        # 3-level disclosure spec
│   └── using-claude-hooks/
│       └── SKILL.md                                    # Hook types, exit codes, patterns
├── agents/                                             # All created agents live here
├── hooks/scripts/                                      # Hook scripts
└── settings.json                                       # Hook registrations
```

## When to Use vs Alternatives

| Need | Use extensibility skill | Alternative |
|------|------------------------|-------------|
| Create a new task-specific agent | creating-claude-agents | Copy-paste an existing agent manually |
| Create reusable expertise module | creating-claude-skills | Embed instructions in CLAUDE.md |
| Auto-fire on user messages | using-claude-hooks | Add to agent instructions |
| Browse existing agents | No — ls .claude/agents/ | N/A |
| Modify an existing agent | No — edit AGENT.md directly | N/A |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **claude_codex_sync** | Post-creation auto-sync to .codex/ is part of the creation workflow |
| **system_docs_management** | system_docs agent is invoked after each new agent/skill to create README + USAGE_GUIDE |
| **agnostic_verification** | Verify new templates before distributing to other repos |
| **feature_expansion** | FEA components (agents, skills, hooks, commands) are created using extensibility skills |

## The Three Extension Types

**Agents** — Scoped personas with specific model settings, tools, permissions, and skill references. Use when you need a repeatable task pattern with distinct behavior from default Claude.

**Skills** — Reusable expertise modules with progressive disclosure. Use when multiple agents need the same procedural knowledge, or when a complex workflow needs documentation.

**Hooks** — Event-driven automation that fires independently of which agent is active. Use for cross-cutting concerns: validation, formatting, keyword injection, cleanup.

## Post-Creation Checklist

After creating any new agent or skill:
- [ ] File created at correct path
- [ ] Synced to `.codex/` via claude_codex_sync
- [ ] System docs created (README.md + USAGE_GUIDE.md minimum)
- [ ] Synced to repos listed in SYNC-REPOS.md
- [ ] Master index/catalog updated

## Design Decisions

**Why progressive disclosure for skills?**
Skills can be large. Loading all detail on every agent invocation wastes context. Three-level disclosure ensures the right amount of context loads at the right time.

**Why YAML frontmatter in agents?**
YAML provides structured metadata (tools, permissions, model) that Claude Code's runtime reads directly. Prose instructions handle the "how" — YAML handles the "what".

**Why hooks apply to all agents uniformly?**
Cross-cutting concerns (linting, validation, keyword detection) should not be duplicated in every agent definition. Hooks centralize this in `settings.json`.
