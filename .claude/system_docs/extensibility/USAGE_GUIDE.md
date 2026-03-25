# Extensibility — Usage Guide

## Quick Start

### Creating a New Agent
```
"create a new agent for [purpose]"
```
The `creating-claude-agents` skill guides you through YAML frontmatter, tool configuration, and permission modes.

### Creating a New Skill
```
"create a new skill for [purpose]"
```
The `creating-claude-skills` skill guides you through the official format with progressive disclosure.

## Agent Creation Steps
1. Define purpose and responsibilities
2. Set YAML frontmatter (name, description, tools)
3. Write workflow section with numbered steps
4. List skills used and constraints
5. Create in `.claude/agents/<name>/AGENT.md`
6. System docs agent auto-invoked to create documentation

## Skill Creation Steps
1. Define trigger conditions (when should it activate)
2. Write YAML frontmatter (name, description)
3. Structure with progressive disclosure (summary → detail)
4. Add reference files if needed (`references/`, `templates/`, `scripts/`)
5. Create in `.claude/skills/<name>/SKILL.md`
6. System docs agent auto-invoked to create documentation

## Post-Creation Checklist
- [ ] Agent/skill file created
- [ ] Mirrored to `.codex/`
- [ ] System docs created (README + USAGE_GUIDE minimum)
- [ ] Synced to repos in SYNC-REPOS.md
- [ ] Master index updated

## Troubleshooting
**Agent not activating:** Check trigger phrases in skill description. Add explicit trigger conditions.
**Skill not loading:** Verify YAML frontmatter has `name` and `description` fields.
