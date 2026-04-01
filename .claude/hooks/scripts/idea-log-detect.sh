#!/bin/bash
# idea-log-detect.sh — UserPromptSubmit
# Detects requests to capture ideas into the repo-local .ideas system.

USER_MSG=$(jq -r '.user_prompt.content // ""' 2>/dev/null)

if echo "$USER_MSG" | grep -qiE '\blog this idea\b|\badd (this|that) to ideas\b|\bcapture this idea\b|\bcreate an idea folder\b|\bidea logger\b|\bplan this idea under \.ideas\b'; then
  echo "IDEA LOGGING DETECTED: Use the idea-logger agent and logging-ideas skill. Update .ideas/ideas.md, create the same-name idea folder, apply repo-setup planning conventions, and sync the resulting .ideas files plus idea-logger component artifacts."
fi

exit 0
