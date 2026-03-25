#!/bin/bash
# systemdocs-reminder.sh — PostToolUse hook for Write
#
# Detects when agent/skill files are created or modified and checks
# if corresponding system_docs exist. Outputs a reminder if missing.
#
# Hook type: PostToolUse (matcher: Write|Edit)

FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)

# Check if this is an agent or skill file
COMPONENT_NAME=""
COMPONENT_TYPE=""

if echo "$FILE_PATH" | grep -qE '\.claude/agents/([^/]+)/AGENT\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/agents/\K[^/]+')
  COMPONENT_TYPE="agent"
elif echo "$FILE_PATH" | grep -qE '\.claude/skills/([^/]+)/SKILL\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/skills/\K[^/]+')
  COMPONENT_TYPE="skill"
elif echo "$FILE_PATH" | grep -qE '\.claude/hooks/scripts/[^/]+\.sh$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/hooks/scripts/\K[^/]+' | sed 's/\.sh$//')
  COMPONENT_TYPE="hook"
elif echo "$FILE_PATH" | grep -qE '\.codex/agents/([^/]+)/AGENT\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.codex/agents/\K[^/]+')
  COMPONENT_TYPE="agent"
elif echo "$FILE_PATH" | grep -qE '\.codex/skills/([^/]+)/SKILL\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.codex/skills/\K[^/]+')
  COMPONENT_TYPE="skill"
fi

# Exit if not an agent/skill/hook file
if [ -z "$COMPONENT_NAME" ]; then
  exit 0
fi

# Derive repo root from file path
REPO_ROOT=$(echo "$FILE_PATH" | sed 's|/\.claude/.*||' | sed 's|/\.codex/.*||')
if [ -z "$REPO_ROOT" ] || [ ! -d "$REPO_ROOT" ]; then
  exit 0
fi

# Check if system_docs exist for this component
# Map component names to potential system_docs folder names
# (agents often have -agent suffix, system_docs use underscores)
DOCS_NAME=$(echo "$COMPONENT_NAME" | sed 's/-/_/g' | sed 's/_agent$//')

FOUND_DOCS=false
for check_name in "$DOCS_NAME" "$COMPONENT_NAME" "${COMPONENT_NAME//-/_}"; do
  if [ -f "$REPO_ROOT/.claude/system_docs/$check_name/README.md" ]; then
    FOUND_DOCS=true
    break
  fi
  if [ -f "$REPO_ROOT/.codex/system_docs/$check_name/README.md" ]; then
    FOUND_DOCS=true
    break
  fi
done

if [ "$FOUND_DOCS" = false ]; then
  echo "REMINDER: System docs missing for $COMPONENT_TYPE '$COMPONENT_NAME'."
  echo "Create: .claude/system_docs/${DOCS_NAME}/README.md (minimum: README + USAGE_GUIDE)"
  echo "Run the system-docs-agent or /system-docs to generate."
fi

exit 0
