# Usage Guide: Chat History

## Quick Start

At the start of every conversation, run:

```
/skill chat-history-convention
```

This ensures `.chat-history/user-messages.md` exists and appends the current message with full structured analysis.

## Detailed Usage

### Appending a Message

The skill handles this automatically. When invoked, it:
1. Checks that `.chat-history/` directory and `user-messages.md` exist (creates them if not)
2. Appends the current user message with ISO 8601 timestamp
3. Populates all six structured sections

### Manual Log Entry Format

```text
---
[2026-03-24T00:00:00Z] role=user
<raw user message verbatim>

SESSION CONTEXT:
- What's being worked on
- Active agents/skills
- Phase: planning | building | reviewing | debugging

USER INTENT:
1. First action item (imperative phrasing)
2. Second action item

REFERENCE FILES:
- path/to/file — description

KEY DECISIONS:
- None — request only.   (or list decisions made)

AGENT REPORT:
  Initial Response:
  - What the agent planned to do

  Final Response:
  - Files created/modified (count)
  - Systems affected
  - Pending items
---
```

### Updating AGENT REPORT After Work Completes

When finishing a task, update the Final Response section of the most recent log entry:

```
/skill chat-history-convention  (fills Final Response)
```

## Troubleshooting

**Log file missing**
The skill creates it automatically. If the directory doesn't exist, check write permissions on the repo root.

**Entry has blank sections**
The USER INTENT and AGENT REPORT sections require the agent to actively interpret the message. Short messages like "yes" or "ok" should still have all sections, just brief ones.

**Old sessions not visible**
All history is in a single append-only file: `.chat-history/user-messages.md`. Scroll up or search within it.
