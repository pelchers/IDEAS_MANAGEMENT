#!/bin/bash
# auto-sync-check.sh — PostToolUse (Write)
# Checks .claude/.codex mirror parity
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
if echo "$FILE_PATH" | grep -q "\.claude/"; then
  CODEX_PATH=$(echo "$FILE_PATH" | sed 's/\.claude\//\.codex\//')
  if [ -f "$FILE_PATH" ] && [ ! -f "$CODEX_PATH" ]; then
    echo "SYNC: .codex/ mirror missing for $(basename "$FILE_PATH"). Run /sync to update."
  fi
elif echo "$FILE_PATH" | grep -q "\.codex/"; then
  CLAUDE_PATH=$(echo "$FILE_PATH" | sed 's/\.codex\//\.claude\//')
  if [ -f "$FILE_PATH" ] && [ ! -f "$CLAUDE_PATH" ]; then
    echo "SYNC: .claude/ mirror missing for $(basename "$FILE_PATH"). Run /sync to update."
  fi
fi
exit 0
