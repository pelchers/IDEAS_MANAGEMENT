#!/bin/bash
# chain-continue.sh — Stop hook for agent chaining
#
# Reads chain-signal.txt after an agent exits, determines the next phase,
# writes next_phase.json, and calls orchestrator-poke.ps1 to spawn the next agent.
#
# Hook type: Stop
# Fires: after every agent session ends

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CHAIN_PLAN="$REPO_ROOT/.claude/orchestration/chain-plan.json"
CHAIN_SIGNAL="$REPO_ROOT/.claude/orchestration/chain-signal.txt"
QUEUE_FILE="$REPO_ROOT/.claude/orchestration/queue/next_phase.json"
LOGS_DIR="$REPO_ROOT/.claude/orchestration/logs"

# Exit early if no chain is active
if [ ! -f "$CHAIN_PLAN" ]; then
  exit 0
fi

# Check chain status — only continue if running
STATUS=$(jq -r '.status // "none"' "$CHAIN_PLAN" 2>/dev/null)
if [ "$STATUS" != "running" ]; then
  exit 0
fi

# Check orchestration mode — if orchestrated, the orchestrator agent manages spawning
ORCH_MODE=$(jq -r '.orchestrationMode // "hook"' "$CHAIN_PLAN" 2>/dev/null)
if [ "$ORCH_MODE" = "orchestrated" ]; then
  # Orchestrator manages the chain — don't double-spawn
  # Just clean up the signal file if it exists
  rm -f "$CHAIN_SIGNAL"
  exit 0
fi

# Check for signal file — if agent didn't write one, don't chain
if [ ! -f "$CHAIN_SIGNAL" ]; then
  exit 0
fi

# Read signal
SIGNAL_TYPE=$(head -1 "$CHAIN_SIGNAL" | grep -oP '\[CHAIN:\K[A-Z_]+' || echo "")

if [ -z "$SIGNAL_TYPE" ]; then
  # Invalid signal format — don't chain
  rm -f "$CHAIN_SIGNAL"
  exit 0
fi

# Parse signal metadata
CURRENT_SUBFOLDER=$(grep -oP 'subfolder=\K.*' "$CHAIN_SIGNAL" || echo "")
CURRENT_PHASE=$(grep -oP 'phase=\K.*' "$CHAIN_SIGNAL" || echo "")
TASKS_REMAINING=$(grep -oP 'tasks_remaining=\K.*' "$CHAIN_SIGNAL" || echo "0")
NEXT_SUBFOLDER=$(grep -oP 'next_subfolder=\K.*' "$CHAIN_SIGNAL" || echo "none")
NEXT_PHASE=$(grep -oP 'next_phase=\K.*' "$CHAIN_SIGNAL" || echo "none")
COMMIT_SHA=$(grep -oP 'commit_sha=\K.*' "$CHAIN_SIGNAL" || echo "")

# Read chain mode
MODE=$(jq -r '.mode // "per-phase"' "$CHAIN_PLAN")
CHAIN_ID=$(jq -r '.chainId // "unknown"' "$CHAIN_PLAN")
MAX_PHASES=$(jq -r '.maxPhases // 20' "$CHAIN_PLAN")
FEA_MODE=$(jq -r '.feaMode // false' "$CHAIN_PLAN")

# Count completed phases
COMPLETED=$(jq '[.phases[] | select(.status == "completed")] | length' "$CHAIN_PLAN")

# Check max phases safety cap
if [ "$COMPLETED" -ge "$MAX_PHASES" ]; then
  jq '.status = "stopped" | .stopReason = "maxPhases exceeded"' "$CHAIN_PLAN" > "${CHAIN_PLAN}.tmp"
  mv "${CHAIN_PLAN}.tmp" "$CHAIN_PLAN"
  rm -f "$CHAIN_SIGNAL"
  echo "Chain stopped: maxPhases ($MAX_PHASES) exceeded."
  exit 0
fi

# Check pauseAfterPhase
PAUSE_AFTER=$(jq -r '.pauseAfterPhase // ""' "$CHAIN_PLAN")
if [ -n "$PAUSE_AFTER" ] && [ "$CURRENT_SUBFOLDER/$CURRENT_PHASE" = "$PAUSE_AFTER" ]; then
  jq '.status = "paused"' "$CHAIN_PLAN" > "${CHAIN_PLAN}.tmp"
  mv "${CHAIN_PLAN}.tmp" "$CHAIN_PLAN"
  rm -f "$CHAIN_SIGNAL"
  echo "Chain paused after phase: $PAUSE_AFTER"
  exit 0
fi

# Handle completion signals
case "$SIGNAL_TYPE" in
  "ORCHESTRATION_COMPLETE")
    jq ".status = \"completed\" | .completedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" "$CHAIN_PLAN" > "${CHAIN_PLAN}.tmp"
    mv "${CHAIN_PLAN}.tmp" "$CHAIN_PLAN"
    rm -f "$CHAIN_SIGNAL"
    echo "Chain complete: $CHAIN_ID"
    exit 0
    ;;

  "TASK_COMPLETE"|"PHASE_COMPLETE"|"SUBFOLDER_COMPLETE")
    # Determine what comes next
    if [ "$NEXT_SUBFOLDER" = "none" ] && [ "$NEXT_PHASE" = "none" ]; then
      # Nothing left
      jq ".status = \"completed\" | .completedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" "$CHAIN_PLAN" > "${CHAIN_PLAN}.tmp"
      mv "${CHAIN_PLAN}.tmp" "$CHAIN_PLAN"
      rm -f "$CHAIN_SIGNAL"
      echo "Chain complete: no more work."
      exit 0
    fi

    # Build the prompt for the next agent
    INGEST_DIR="$REPO_ROOT/.adr/agent_ingest"
    LATEST_INGEST=$(ls -t "$INGEST_DIR"/chain-*.md 2>/dev/null | head -1)
    PRIOR_CONTEXT=""
    if [ -n "$LATEST_INGEST" ]; then
      PRIOR_CONTEXT="Previous phase summary available at: $LATEST_INGEST. Read it for context."
    fi

    PROMPT="You are a chain agent (chain: $CHAIN_ID, mode: $MODE).
Read .claude/orchestration/chain-plan.json for your assigned phase.
Read .adr/orchestration/${NEXT_SUBFOLDER}/primary_task_list.md for tasks.
$PRIOR_CONTEXT
Follow the agent-chain-orchestrator skill. Complete your assigned work, check off items, validate with Playwright, write chain-signal.txt, and exit."

    if [ "$FEA_MODE" = "true" ]; then
      PROMPT="$PROMPT
Use the feature-expansion (FEA) process for each task."
    fi

    # Update chain-plan.json — mark next phase in_progress
    jq "(.phases[] | select(.status == \"pending\") | select(.subfolder == \"$NEXT_SUBFOLDER\")) |= (.status = \"in_progress\" | .startedAt = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\")" "$CHAIN_PLAN" > "${CHAIN_PLAN}.tmp" 2>/dev/null
    if [ -f "${CHAIN_PLAN}.tmp" ]; then
      mv "${CHAIN_PLAN}.tmp" "$CHAIN_PLAN"
    fi

    # Write queue file for orchestrator-poke
    mkdir -p "$(dirname "$QUEUE_FILE")"
    cat > "$QUEUE_FILE" <<QEOF
{
  "autoSpawn": true,
  "dryRun": false,
  "agent": ".claude/agents/chain-agent/AGENT.md",
  "prompt": $(echo "$PROMPT" | jq -Rs .),
  "chain": {
    "chainId": "$CHAIN_ID",
    "subfolder": "$NEXT_SUBFOLDER",
    "phase": "$NEXT_PHASE",
    "mode": "$MODE"
  }
}
QEOF

    # Log
    mkdir -p "$LOGS_DIR"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Chain $CHAIN_ID: $SIGNAL_TYPE → spawning next: $NEXT_SUBFOLDER phase $NEXT_PHASE" >> "$LOGS_DIR/chain.log"

    # Consume signal
    rm -f "$CHAIN_SIGNAL"

    # Call orchestrator-poke to spawn
    powershell -NoProfile -ExecutionPolicy Bypass -File "$REPO_ROOT/.claude/hooks/scripts/orchestrator-poke.ps1" 2>/dev/null &

    echo "Chaining to: $NEXT_SUBFOLDER / phase $NEXT_PHASE"
    ;;

  *)
    # Unknown signal type — don't chain
    rm -f "$CHAIN_SIGNAL"
    echo "Unknown chain signal: $SIGNAL_TYPE"
    ;;
esac
