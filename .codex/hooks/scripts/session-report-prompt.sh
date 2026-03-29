#!/bin/bash
# session-report-prompt.sh — Stop (opt-in)
# Reminds to generate session report if config exists
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CONFIG="$REPO_ROOT/.claude/config/auto-session-report"
if [ -f "$CONFIG" ]; then
  MODE=$(jq -r '.mode // "remind"' "$CONFIG" 2>/dev/null)
  if [ "$MODE" = "remind" ]; then
    echo "SESSION ENDING: Consider generating a session report. Run /session-report."
  fi
fi
exit 0
