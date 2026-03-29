# Usage Guide: Chat History

## Quick Start

At the start of every conversation:
```
/skill chat-history-convention
```

Appends the current message to `.chat-history/user-messages.md` with all structured sections.

## Detailed Usage

### Entry Format

```text
---
[2026-03-24T00:00:00Z] role=user
<raw user message verbatim>

SESSION CONTEXT:
- What's being worked on, active agents, phase

USER INTENT:
1. First action item (imperative phrasing)

REFERENCE FILES:
- path/to/file — description

KEY DECISIONS:
- None — request only.

AGENT REPORT:
  Initial Response: Plan/commitments made
  Final Response: Files created/modified, systems affected
---
```

### Updating AGENT REPORT After Work Completes

Fill in Final Response after completing work. This turns the log from a user-only transcript into a full conversation record.

### Short Messages

"yes" and "ok" still get all sections — brief is fine. Use `"No agent work — conversational response only."` in AGENT REPORT.

## Troubleshooting

**Log file missing** — Created automatically on first skill run.

**Blank AGENT REPORT** — Agent must actively fill this in after completing work.

**History from old sessions** — All history is append-only in `.chat-history/user-messages.md`. Search within the file.
