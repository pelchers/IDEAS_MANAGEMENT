# Mermaid Diagram System

## Overview
Provides Mermaid diagram authoring, validation, rendering, and auto-suggestion for documentation. Auto-suggests diagrams for complex docs and validates existing Mermaid blocks on every .md file write.

## Components
| Component | Path |
|---|---|
| **Agent** | `.claude/agents/mermaid-cli/AGENT.md` |
| **Skill** | `.claude/skills/mermaid-cli/SKILL.md` (with resources/, references/, templates/, scripts/) |
| **Hook** | `.claude/hooks/scripts/mermaid-doc-assist.sh` (PostToolUse Write\|Edit) |
| **Command** | `.claude/commands/mermaid.md` |

## How It Works
- **Auto-suggest**: PostToolUse hook detects high-value .md files (system_docs, ADR, plans, architecture) that describe flows without diagrams → suggests adding one
- **Auto-validate**: Same hook checks existing Mermaid blocks for syntax issues
- **On-demand**: `/mermaid` command for rendering, validation, and template insertion
- **Inline**: Write ```` ```mermaid ```` blocks directly in .md files — VS Code and GitHub render them natively

## Scope (where suggestions fire)
- `.claude/system_docs/` and `.codex/system_docs/`
- `.adr/orchestration/` files
- `.claude/docs/` and `.codex/docs/`
- `.docs/planning/` files
- Any ARCHITECTURE.md, SYSTEM_OVERVIEW.md, prd.md, technical_requirements.md

## Diagram Types Supported
Flowchart, sequence, state, class, ER, gantt, pie, mindmap, timeline, and more. See `skills/mermaid-cli/resources/references/diagram-catalog.md`.
