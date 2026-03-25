#!/bin/bash
# require-frontend-spec.sh — PreToolUse hook for Write|Edit
#
# Ensures frontend_spec.md exists before any frontend file is written.
# If missing, auto-creates one from the project's design system and context.
# Validates completeness — warns if spec is incomplete.
#
# Hook type: PreToolUse (matcher: Write|Edit)

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
ROOT_SPEC="$REPO_ROOT/.adr/orchestration/frontend_spec.md"
TOKENS_FILE="$REPO_ROOT/packages/ui-tokens/src/tokens.ts"
PROTOTYPE_DIR="$REPO_ROOT/.docs/planning/frontend/concepts-next/brutalism/pass-1"

# Read file path from tool input
FILE_PATH=$(jq -r '.tool_input.file_path // ""' 2>/dev/null)

# Only check frontend files
if ! echo "$FILE_PATH" | grep -qE '(apps/web/src/.*\.(tsx|ts|css)|packages/ui-tokens/)'; then
  exit 0
fi

# Check if any frontend_spec.md exists
if [ -f "$ROOT_SPEC" ]; then
  exit 0
fi
for spec in "$REPO_ROOT"/.adr/orchestration/*/frontend_spec.md; do
  if [ -f "$spec" ]; then
    exit 0
  fi
done

# --- No spec found — auto-create from project ---

echo "Auto-creating frontend_spec.md — no frontend spec found for frontend file edit"

# Ensure directory exists
mkdir -p "$REPO_ROOT/.adr/orchestration"

# 1. Detect design tokens
PRIMARY=""
SECONDARY=""
ACCENT=""
if [ -f "$TOKENS_FILE" ]; then
  PRIMARY=$(grep "primary:" "$TOKENS_FILE" | head -1 | grep -oP "'#[^']+'" | tr -d "'" 2>/dev/null)
  SECONDARY=$(grep "secondary:" "$TOKENS_FILE" | head -1 | grep -oP "'#[^']+'" | tr -d "'" 2>/dev/null)
  ACCENT=$(grep "accent:" "$TOKENS_FILE" | head -1 | grep -oP "'#[^']+'" | tr -d "'" 2>/dev/null)
fi

# 2. Detect prototype pages
PAGE_TABLE=""
if [ -d "$PROTOTYPE_DIR" ]; then
  for page in "$PROTOTYPE_DIR"/*.html; do
    if [ -f "$page" ]; then
      basename=$(basename "$page")
      view=$(echo "$basename" | sed 's/\.html$//' | sed 's/-/ /g')
      PAGE_TABLE="${PAGE_TABLE}| ${view} | \`.docs/planning/frontend/concepts-next/brutalism/pass-1/${basename}\` |
"
    fi
  done
fi

# 3. Detect project context files
CLAUDE_MD="not found"
if [ -f "$REPO_ROOT/CLAUDE.md" ]; then
  CLAUDE_MD="exists at CLAUDE.md"
elif [ -f "$REPO_ROOT/.claude/CLAUDE.md" ]; then
  CLAUDE_MD="exists at .claude/CLAUDE.md"
fi

PRD_PATH="not yet created"
PRD_FILE=$(find "$REPO_ROOT/.adr/orchestration" -name "prd.md" 2>/dev/null | head -1)
if [ -n "$PRD_FILE" ]; then
  PRD_PATH="${PRD_FILE#$REPO_ROOT/}"
fi

TECH_SPEC_PATH="not yet created"
TECH_FILE=$(find "$REPO_ROOT/.adr/orchestration" -name "technical_requirements.md" 2>/dev/null | head -1)
if [ -n "$TECH_FILE" ]; then
  TECH_SPEC_PATH="${TECH_FILE#$REPO_ROOT/}"
fi

TASK_LIST_PATH="not yet created"
TASK_FILE=$(find "$REPO_ROOT/.adr/orchestration" -name "primary_task_list.md" 2>/dev/null | head -1)
if [ -n "$TASK_FILE" ]; then
  TASK_LIST_PATH="${TASK_FILE#$REPO_ROOT/}"
fi

ADR_STATUS="ADR not set up yet — this spec was created standalone"
ADR_COUNT=$(find "$REPO_ROOT/.adr/orchestration" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
if [ "$ADR_COUNT" -gt 0 ]; then
  ADR_STATUS="orchestration exists with $ADR_COUNT session subfolders"
fi

# 4. Determine completeness
HAS_DESIGN_SYSTEM=false
if [ -n "$PRIMARY" ] || [ -n "$PAGE_TABLE" ]; then
  HAS_DESIGN_SYSTEM=true
fi

# 5. Write the spec
cat > "$ROOT_SPEC" <<SPECEOF
<!--
  FRONTEND SPECIFICATION REFERENCE

  What this file is:
    Design reference for all frontend/UI work in this project.
    Any agent building UI MUST read this file before writing .tsx/.css files.

  Project context (read these if they exist):
    - CLAUDE.md — project conventions and architecture
    - .docs/planning/ — PRD, feature list, user stories
    - .adr/orchestration/ — session task lists and phase plans

  How to use this file:
    1. Read the Spec Source Type to know where the design reference lives
    2. Read the referenced prototype/URL/spec before building ANY UI
    3. Follow the Coherence Rules during implementation
    4. After building, validate output matches this spec

  If this file says "ACTION REQUIRED":
    Auto-generated but no design system detected. Provide design requirements.
-->

# Frontend Specification Reference

Session: Auto-generated (project default)
Date: $(date +%Y-%m-%d)

## Project Context
- **CLAUDE.md:** $CLAUDE_MD
- **PRD:** $PRD_PATH
- **Tech Spec:** $TECH_SPEC_PATH
- **Task List:** $TASK_LIST_PATH
- **ADR Status:** $ADR_STATUS
SPECEOF

if [ "$HAS_DESIGN_SYSTEM" = true ]; then
  cat >> "$ROOT_SPEC" <<SPECEOF

## Spec Source Type
- [x] Internal prototype (HTML/CSS files in project)

## Design System
- **Active Design:** Brutalism Pass 1 ("Raw Concrete Campus")
- **Prototype Path:** \`.docs/planning/frontend/concepts-next/brutalism/pass-1/\`
- **Design Tokens:** \`packages/ui-tokens/src/tokens.ts\`
- **Tailwind Preset:** \`packages/ui-tokens/tailwind-preset.ts\`

## Key Colors
- **Primary:** ${PRIMARY:-not detected}
- **Secondary:** ${SECONDARY:-not detected}
- **Accent:** ${ACCENT:-not detected}

## Reference Pages
| App View | Reference File |
|---|---|
${PAGE_TABLE:-| (none detected) | — |}

## Coherence Rules
1. ALL new UI must match the design system tokens (4px borders, 8px hard shadows, triple-mono typography)
2. Read the relevant prototype HTML file BEFORE building any page/component
3. Match layout structure, spacing, and interaction patterns from the prototype
4. Use ONLY colors from \`packages/ui-tokens/src/tokens.ts\`
5. New pages without a direct reference must follow the closest existing prototype's patterns
SPECEOF
  echo "Created complete frontend_spec.md with design system reference."
else
  cat >> "$ROOT_SPEC" <<'SPECEOF'

## ⚠️ ACTION REQUIRED
No design system was auto-detected in this project. Before proceeding with frontend work, do ONE of:
1. Run `/require-frontend-spec` and describe your design requirements
2. Paste design requirements in the "Chat Spec" section below
3. Create a tokens file at `packages/ui-tokens/src/tokens.ts`
4. Add prototype HTML files to `.docs/planning/frontend/`

## Spec Source Type
- [ ] Internal prototype (none detected — add prototype path)
- [ ] External reference (add URL below)
- [x] Chat-prompted spec (REQUIRES USER INPUT — paste design requirements below)
- [ ] Similarity match

## Design System
- **Active Design:** NOT DETECTED — specify below
- **Prototype Path:** NOT FOUND
- **Design Tokens:** NOT FOUND

## Chat Spec (paste your design requirements here)
<!-- Example:
- Color scheme: dark background (#1A1A1A), pink accent (#FF3366)
- Typography: monospace fonts only
- Borders: 4px solid black, 8px offset shadows
- Cards: white fill, black border, shadow on hover
-->

## Coherence Rules
1. ALL new UI must match the design requirements specified above
2. Maintain visual consistency across all pages
3. Follow responsive design principles
4. Use semantic HTML and accessible patterns
5. New pages must follow the patterns established by existing pages
SPECEOF
  echo "WARNING: No design system found. frontend_spec.md created but needs manual input."
  echo "Run /require-frontend-spec to set up interactively."
fi

exit 0
