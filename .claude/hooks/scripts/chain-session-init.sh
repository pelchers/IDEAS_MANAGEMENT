#!/bin/bash
# chain-session-init.sh — SessionStart hook for chained agents
#
# Loads chain context into a new agent session:
# - Reads chain-plan.json for current phase
# - Reads previous ingest summary
# - Reads frontend_spec.md and checks quality
# - Outputs mandatory reading list
#
# Hook type: SessionStart

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CHAIN_PLAN="$REPO_ROOT/.claude/orchestration/chain-plan.json"

# Only activate if a chain is running
if [ ! -f "$CHAIN_PLAN" ]; then
  exit 0
fi

STATUS=$(jq -r '.status // "none"' "$CHAIN_PLAN" 2>/dev/null)
if [ "$STATUS" != "running" ]; then
  exit 0
fi

# Read current phase info
CHAIN_ID=$(jq -r '.chainId // "unknown"' "$CHAIN_PLAN")
MODE=$(jq -r '.mode // "per-phase"' "$CHAIN_PLAN")
FEA_MODE=$(jq -r '.feaMode // false' "$CHAIN_PLAN")
ORCH_MODE=$(jq -r '.orchestrationMode // "hook"' "$CHAIN_PLAN")

# Find in_progress phase
CURRENT=$(jq -r '.phases[] | select(.status == "in_progress") | "\(.subfolder)/\(.phase // "all")"' "$CHAIN_PLAN" 2>/dev/null | head -1)
SUBFOLDER=$(echo "$CURRENT" | cut -d/ -f1)

if [ -z "$SUBFOLDER" ] || [ "$SUBFOLDER" = "null" ]; then
  exit 0
fi

# Find latest ingest summary
INGEST_DIR="$REPO_ROOT/.adr/agent_ingest"
LATEST_INGEST=$(ls -t "$INGEST_DIR"/chain-*.md 2>/dev/null | head -1)

# Check for frontend spec and its quality
FRONTEND_SPEC=""
SPEC_QUALITY="complete"
if [ -f "$REPO_ROOT/.adr/orchestration/$SUBFOLDER/frontend_spec.md" ]; then
  FRONTEND_SPEC="$REPO_ROOT/.adr/orchestration/$SUBFOLDER/frontend_spec.md"
elif [ -f "$REPO_ROOT/.adr/orchestration/frontend_spec.md" ]; then
  FRONTEND_SPEC="$REPO_ROOT/.adr/orchestration/frontend_spec.md"
fi

if [ -n "$FRONTEND_SPEC" ]; then
  if grep -q "ACTION REQUIRED" "$FRONTEND_SPEC" 2>/dev/null; then
    SPEC_QUALITY="incomplete"
  fi
fi

# Output context for the agent
echo ""
echo "=========================================="
echo " CHAIN CONTEXT"
echo "=========================================="
echo "Chain: $CHAIN_ID (mode: $MODE, orchestration: $ORCH_MODE)"
echo "Current: $CURRENT"
echo ""
echo "MANDATORY — Read these files before starting work:"
echo "  1. .claude/orchestration/chain-plan.json"
echo "  2. .adr/orchestration/$SUBFOLDER/primary_task_list.md"

if [ -n "$FRONTEND_SPEC" ]; then
  echo "  3. $FRONTEND_SPEC"
  if [ "$SPEC_QUALITY" = "incomplete" ]; then
    echo "     WARNING: Spec contains ACTION REQUIRED — needs design input before frontend work"
  fi
else
  echo "  3. (no frontend_spec.md found — will be auto-created on first .tsx write)"
fi

# Project context files
CLAUDE_MD=""
if [ -f "$REPO_ROOT/CLAUDE.md" ]; then CLAUDE_MD="CLAUDE.md"
elif [ -f "$REPO_ROOT/.claude/CLAUDE.md" ]; then CLAUDE_MD=".claude/CLAUDE.md"
fi
if [ -n "$CLAUDE_MD" ]; then
  echo "  4. $CLAUDE_MD"
fi

PRD=$(find "$REPO_ROOT/.adr/orchestration/$SUBFOLDER" -name "prd.md" 2>/dev/null | head -1)
if [ -n "$PRD" ]; then
  echo "  5. ${PRD#$REPO_ROOT/}"
fi

TECH=$(find "$REPO_ROOT/.adr/orchestration/$SUBFOLDER" -name "technical_requirements.md" 2>/dev/null | head -1)
if [ -n "$TECH" ]; then
  echo "  6. ${TECH#$REPO_ROOT/}"
fi

if [ -n "$LATEST_INGEST" ]; then
  echo ""
  echo "Previous phase summary: ${LATEST_INGEST#$REPO_ROOT/}"
fi

if [ "$FEA_MODE" = "true" ]; then
  echo ""
  echo "FEA mode is ON — follow the feature-expansion cycle."
fi

echo "=========================================="
echo ""
