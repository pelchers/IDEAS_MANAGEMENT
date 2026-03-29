#!/bin/bash
# savepoint-detect.sh — UserPromptSubmit
# Detects "savepoint" keyword
USER_MSG=$(jq -r '.user_prompt.content // ""' 2>/dev/null)
if echo "$USER_MSG" | grep -qiE '\bsavepoint\b|\bsave point\b'; then
  echo "SAVEPOINT REQUESTED: Use the savepoint-agent to create a savepoint branch from the current commit."
fi
exit 0
