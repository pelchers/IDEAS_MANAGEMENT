# Mermaid CLI — System Documentation

## Purpose
Mermaid diagram authoring, rendering, Markdown transformation, configuration, theming, and troubleshooting.

## Components

| Component | Location |
|-----------|----------|
| Agent | `.claude/agents/mermaid-cli/AGENT.md` |
| Skill | `.claude/skills/mermaid-cli/SKILL.md` |
| Codex Agent | `.codex/agents/mermaid-cli/AGENT.md` |
| Codex Skill | `.codex/skills/mermaid-cli/SKILL.md` |
| Resources | `.claude/skills/mermaid-cli/resources/` |

## Capabilities
- Mermaid syntax authoring for all diagram types
- CLI rendering via `mmdc` (SVG, PNG, PDF)
- Markdown fenced block transformation
- Configuration and theming
- Validation and troubleshooting
- Icon pack integration

## Integration Points
- Used by documentation workflows for visual diagrams
- Referenced by producing-visual-docs skill
- Can be invoked as a subagent for diagram generation tasks
