# Chat History Convention

- User messages are appended to `user-messages.log` in chronological order.
- Format per entry:
  - timestamp (ISO-8601)
  - role (`user`)
  - raw message body
- This file is project-local and can be versioned.
