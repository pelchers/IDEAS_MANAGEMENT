#!/bin/bash
# todo-sync-reminder.sh — PostToolUse (Edit)
# Reminds to update TODO.md when task lists change
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)
if echo "$FILE_PATH" | grep -q "primary_task_list.md"; then
  REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
  if [ -f "$REPO_ROOT/TODO.md" ]; then
    echo "REMINDER: primary_task_list.md was modified. Consider updating TODO.md to stay in sync."
  fi
fi
exit 0
