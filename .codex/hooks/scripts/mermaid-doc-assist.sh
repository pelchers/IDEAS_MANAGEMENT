#!/bin/bash
# mermaid-doc-assist.sh — PostToolUse hook for Write|Edit
# Suggests Mermaid diagrams for complex/important docs and validates existing blocks.
# Scope: system_docs, .adr/, .claude/docs/, .codex/docs/, .docs/planning/, plan files
# Aggressiveness: moderate — by topic complexity, not file length

FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)

# Only check .md files
if ! echo "$FILE_PATH" | grep -qE '\.md$'; then
  exit 0
fi

# Determine if this is a high-value doc (by location, not length)
IS_HIGH_VALUE=false
if echo "$FILE_PATH" | grep -qE '(system_docs|\.adr/|\.claude/docs/|\.codex/docs/|\.docs/planning|ARCHITECTURE|SYSTEM_OVERVIEW|technical_requirements|prd\.md)'; then
  IS_HIGH_VALUE=true
fi

# Validate existing Mermaid blocks in ANY .md file
if grep -q '```mermaid' "$FILE_PATH" 2>/dev/null; then
  # Basic syntax check — look for unclosed blocks
  OPEN=$(grep -c '```mermaid' "$FILE_PATH" 2>/dev/null)
  CLOSE=$(grep -c '```$' "$FILE_PATH" 2>/dev/null)
  # Rough check — more opens than closes could mean unclosed block
  if [ "$OPEN" -gt 0 ] && [ "$CLOSE" -lt "$OPEN" ]; then
    echo "WARNING: Possible unclosed Mermaid block in $(basename "$FILE_PATH"). Check syntax."
  fi
fi

# Suggest diagrams for high-value docs without any
if [ "$IS_HIGH_VALUE" = true ]; then
  HAS_DIAGRAM=false
  if grep -qE '```mermaid|```ascii|┌|└|├|─|▼|▲' "$FILE_PATH" 2>/dev/null; then
    HAS_DIAGRAM=true
  fi
  if [ "$HAS_DIAGRAM" = false ]; then
    # Check if content describes flows, processes, or architectures
    if grep -qiE 'flow|process|step [0-9]|phase [0-9]|sequence|state|lifecycle|pipeline|cascade|resolution order|hook.*fires|agent.*spawns' "$FILE_PATH" 2>/dev/null; then
      echo "SUGGESTION: $(basename "$FILE_PATH") describes a flow/process but has no diagram. Consider adding a Mermaid flowchart or sequence diagram for visual clarity."
    fi
  fi
fi

exit 0
