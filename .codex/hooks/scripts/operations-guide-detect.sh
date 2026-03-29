#!/bin/bash
# operations-guide-detect.sh — UserPromptSubmit
# Detects questions about .claude/.codex operations
USER_MSG=$(jq -r '.user_prompt.content // ""' 2>/dev/null)
if echo "$USER_MSG" | grep -qiE 'how does (the |our )?(\.claude|\.codex|agent|skill|hook|chain|orchestrat|longrunning).*work|explain.*(agent|skill|hook|chain) system|how do I use.*(agent|skill|hook|chain)'; then
  echo "OPERATIONS GUIDE: This question is about .claude/.codex operations. Consider writing the answer to .claude/docs/ for future reference."
fi
exit 0
