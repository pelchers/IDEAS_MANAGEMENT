#!/bin/bash
# repo-setup-detect.sh — UserPromptSubmit
# Detects repo setup/bootstrap requests
USER_MSG=$(jq -r '.user_prompt.content // ""' 2>/dev/null)
if echo "$USER_MSG" | grep -qiE '\bbootstrap\b|\bset up this repo\b|\binitialize project\b|\bsetup project\b'; then
  echo "REPO SETUP DETECTED: Use the repo-setup-agent to bootstrap project docs via interactive discovery."
fi
exit 0
