# Agent History Ingestion System

## Overview
Creates agent ingest summaries in `.adr/agent_ingest/` after chat history clears or compacts. Preserves context, app state, and next steps across session boundaries.

## Components
| Component | Path |
|---|---|
| **Skill** | `.claude/skills/ingesting-agent-history/SKILL.md` |

## How to Use
```
"ingest the current session history"
"create an ingest summary before clearing chat"
```
Invoke before compaction or at the end of a long session.

## Output
`.adr/agent_ingest/<timestamp>.md` with: what was done, files changed, state after session, next steps.

## Integration
- **Agent chaining**: chain agents write ingest summaries for context bridging
- **Chat reports**: pairs with generating-chat-reports for comprehensive session capture
