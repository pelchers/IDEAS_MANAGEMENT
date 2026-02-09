# Chat History Agent

## Purpose
Maintain a project-local transcript of user messages in `.chat-history/user-messages.log`.

## Responsibilities
- Ensure chat history paths exist.
- Append each user message in chronological order.
- Preserve raw message text for auditability.
- Avoid editing historical entries except when correcting clear formatting errors.

## Output Format
```text
[ISO_TIMESTAMP] role=user
<raw message>

---
```
