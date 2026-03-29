#!/bin/bash
# chat-history-reminder.sh — UserPromptSubmit
# Enforces mandatory chat history logging
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
if [ -d "$REPO_ROOT/.chat-history" ]; then
  if grep -q "chat-history-convention" "$REPO_ROOT/.claude/CLAUDE.md" 2>/dev/null || grep -q "chat-history-convention" "$REPO_ROOT/CLAUDE.md" 2>/dev/null; then
    echo "MANDATORY: Log this user message to .chat-history/user-messages.md using the chat-history-convention skill."
  fi
fi
exit 0
