#!/bin/bash
# systemdocs-reminder.sh — PostToolUse hook for Write|Edit
#
# Detects when ANY component file (agent, skill, hook, command) is created
# or modified. Outputs MANDATORY instructions to create the full component
# pipeline if pieces are missing, or update related pieces if modifying.
#
# Hook type: PostToolUse (matcher: Write|Edit)

FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)

# Detect component type and name
COMPONENT_NAME=""
COMPONENT_TYPE=""
IS_NEW=false

if echo "$FILE_PATH" | grep -qE '\.claude/agents/([^/]+)/AGENT\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/agents/\K[^/]+')
  COMPONENT_TYPE="agent"
elif echo "$FILE_PATH" | grep -qE '\.claude/skills/([^/]+)/SKILL\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/skills/\K[^/]+')
  COMPONENT_TYPE="skill"
elif echo "$FILE_PATH" | grep -qE '\.claude/hooks/scripts/[^/]+\.sh$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/hooks/scripts/\K[^/]+' | sed 's/\.sh$//')
  COMPONENT_TYPE="hook"
elif echo "$FILE_PATH" | grep -qE '\.claude/commands/[^/]+\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.claude/commands/\K[^/]+' | sed 's/\.md$//')
  COMPONENT_TYPE="command"
elif echo "$FILE_PATH" | grep -qE '\.codex/agents/([^/]+)/AGENT\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.codex/agents/\K[^/]+')
  COMPONENT_TYPE="agent"
elif echo "$FILE_PATH" | grep -qE '\.codex/skills/([^/]+)/SKILL\.md$'; then
  COMPONENT_NAME=$(echo "$FILE_PATH" | grep -oP '\.codex/skills/\K[^/]+')
  COMPONENT_TYPE="skill"
fi

# Exit if not a component file
if [ -z "$COMPONENT_NAME" ] || [ -z "$COMPONENT_TYPE" ]; then
  exit 0
fi

# Skip deprecated
if echo "$FILE_PATH" | grep -q "deprecated"; then
  exit 0
fi

# Derive repo root
REPO_ROOT=$(echo "$FILE_PATH" | sed 's|/\.claude/.*||' | sed 's|/\.codex/.*||')
if [ -z "$REPO_ROOT" ] || [ ! -d "$REPO_ROOT" ]; then
  exit 0
fi

# Map component name to system_docs folder name
DOCS_NAME=$(echo "$COMPONENT_NAME" | sed 's/-/_/g' | sed 's/_agent$//' | sed 's/_subagent$//')

# Check what exists for this component
HAS_AGENT=false
HAS_SKILL=false
HAS_DOCS=false
HAS_CODEX=false
MISSING=""

# Check for related agent
for check in "$COMPONENT_NAME" "${COMPONENT_NAME}-agent" "${COMPONENT_NAME//-agent/}"; do
  [ -f "$REPO_ROOT/.claude/agents/$check/AGENT.md" ] && HAS_AGENT=true
done

# Check for related skill
for check in "$COMPONENT_NAME" "${COMPONENT_NAME}-agent" "${COMPONENT_NAME//-agent/}"; do
  [ -f "$REPO_ROOT/.claude/skills/$check/SKILL.md" ] && HAS_SKILL=true
done

# Check for system docs
for check in "$DOCS_NAME" "$COMPONENT_NAME" "${COMPONENT_NAME//-/_}"; do
  [ -f "$REPO_ROOT/.claude/system_docs/$check/README.md" ] && HAS_DOCS=true
done

# Check codex mirror
if echo "$FILE_PATH" | grep -q "\.claude/"; then
  CODEX_PATH=$(echo "$FILE_PATH" | sed 's/\.claude\//\.codex\//')
  [ -f "$CODEX_PATH" ] && HAS_CODEX=true
fi

# Build MANDATORY instructions
if [ "$HAS_DOCS" = false ]; then
  MISSING="$MISSING system_docs(README+USAGE_GUIDE)"
fi
if [ "$HAS_CODEX" = false ]; then
  MISSING="$MISSING .codex_mirror"
fi

if [ -n "$MISSING" ]; then
  echo "MANDATORY: $COMPONENT_TYPE '$COMPONENT_NAME' is missing:$MISSING"
  echo "Create the missing pieces now before proceeding with other work."
  if [ "$HAS_DOCS" = false ]; then
    echo "  → Create .claude/system_docs/${DOCS_NAME}/README.md + USAGE_GUIDE.md"
  fi
  if [ "$HAS_CODEX" = false ]; then
    echo "  → Mirror to .codex/ equivalent path"
  fi
fi

exit 0
