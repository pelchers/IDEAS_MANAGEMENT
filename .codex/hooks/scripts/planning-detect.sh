#!/bin/bash
# planning-detect.sh — UserPromptSubmit
# Detects planning requests
USER_MSG=$(jq -r '.user_prompt.content // ""' 2>/dev/null)
if echo "$USER_MSG" | grep -qiE "\blet'?s plan\b|\bmake a plan\b|\bplan (this|out|for)\b|\bwrite a plan\b|\bcreate a plan\b"; then
  echo "PLANNING DETECTED: Use the pre-planning agent to create a numbered plan file in .docs/planning/plans/"
fi
exit 0
