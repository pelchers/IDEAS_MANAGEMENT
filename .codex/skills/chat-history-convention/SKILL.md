---
name: chat-history-convention
description: Append every user message to .chat-history/user-messages.log with timestamp, role, and raw message body for project-local chat continuity.
---

# Chat History Convention

Use this skill whenever the user asks for message logging, session continuity, or project-local chat transcripts.

## Workflow
1. Ensure `.chat-history/` exists at repo root.
2. Ensure `.chat-history/user-messages.log` exists.
3. Append each incoming user message with:
   - ISO timestamp
   - `role=user`
   - raw message content
4. Separate entries with `---`.

## File Format
```text
[2026-02-09T00:00:00Z] role=user
<raw message>

---
```

## Optional Script
Use `scripts/append-user-message.ps1` when shell automation is preferred.
