#!/bin/bash
# FEA Keyword Detection Hook (UserPromptSubmit)
#
# Detects "use fea", "fea process", "apply fea", or "/fea" in user messages
# and outputs workflow reminder text that gets injected into the conversation.
#
# Input: user message via stdin (JSON with .user_prompt.content)

# Read the user message
USER_MSG=$(jq -r '.user_prompt.content // ""' 2>/dev/null)

# Check for FEA trigger keywords (case-insensitive)
if echo "$USER_MSG" | grep -qiE '\buse fea\b|\bfea process\b|\bapply fea\b|\bfea workflow\b'; then
  cat <<'FEAEOF'
<user-prompt-submit-hook>
FEA WORKFLOW DETECTED — Follow the Feature Expansion cycle:
1. AUDIT: Query DB for gaps, review pages for thin content, test APIs
2. IDEATE: Present proposals in chat (Data | UI | Interactivity | Automation) — wait for approval
3. DOCUMENT: Update .adr/orchestration/ notes, create task list
4. EXECUTE: Schema → CLI ingestion → API → Frontend → Admin panel
5. VALIDATE: Playwright E2E tests + screenshots
6. REPORT: Structured chat summary with metrics
Rules: commit after each unit, add CLI to package.json, update docs, expand existing sections over new pages.
</user-prompt-submit-hook>
FEAEOF
fi
