---
name: operations-guide
description: Detect questions about .claude/.codex operations and write persistent answers to .claude/docs/.
---

## Purpose
When users ask about how agents, skills, hooks, commands, or system docs work, write structured answers to .claude/docs/ so the knowledge persists across sessions.

## Trigger Phrases
- "how does the * agent/system work"
- "explain the * system"
- "how do I use *"
- "what hooks/agents/skills do we have"

## Output Locations
| Topic | Folder |
|---|---|
| How-to guides | `.claude/docs/guides/` |
| Improvement plans | `.claude/docs/plans/` |
| Technical operations | `.claude/docs/system/` |
| Workflow docs | `.claude/docs/workflows/` |
| General AI knowledge | `.claude/docs/ai-general/` |

## Rules
- Write to file, not just chat (persists across sessions)
- Sync .claude/docs/ to .codex/docs/ after writing
- Use Mermaid diagrams where appropriate
