# Claude Code — Skills & Agents Format

## Skill format

A skill is a directory containing a `SKILL.md` file with YAML frontmatter:

```
skills/<skill-name>/
  SKILL.md              # Required — main skill file
  references/           # Optional — supporting docs
    some-reference.md
  scripts/              # Optional — helper scripts
    helper.js
```

### SKILL.md structure

```markdown
---
name: my-skill
description: One-line description of what the skill does
user_invocable: true    # Can be called with /my-skill
---

# Skill Title

Instructions, examples, and reference content.
The body teaches Claude how to perform the task.
```

### Frontmatter fields
| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (kebab-case) |
| `description` | Yes | One-line description — used for skill matching |
| `user_invocable` | No | If `true`, user can invoke with `/<name>` |

## Agent format

An agent is a directory containing an `AGENT.md` file:

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
subagent_type: general-purpose
model: sonnet
---

# Agent instructions

Detailed instructions for the agent's behavior.
```

### Frontmatter fields
| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier |
| `description` | Yes | Used to match agent to task |
| `tools` | No | List of tools the agent can use |
| `subagent_type` | No | Agent type classification |
| `model` | No | Model override (sonnet, opus, haiku) |

## Best practices
- Keep skill names kebab-case: `my-skill-name`
- Put large reference content in `references/` subfolder, not in SKILL.md body
- Skills are auto-discovered — no registration needed
- Test with `/skill-name` after creating
