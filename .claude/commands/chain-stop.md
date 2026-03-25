---
name: chain-stop
description: Emergency stop for a running agent chain
invocable: true
---

# Chain Stop (/chain-stop)

Immediately halt the current agent chain by setting status to "stopped" in chain-plan.json.

## Behavior
1. Read `.claude/orchestration/chain-plan.json`
2. If status is "running" → set to "stopped"
3. The current agent finishes its work naturally (no mid-session interrupt)
4. The Stop hook reads "stopped" status and does NOT spawn the next agent
5. Report: "Chain stopped. Current agent will finish but no new agents will spawn."

## Resuming After Stop
To resume: run `/chain` with the same path and mode. The chain re-scans task lists and picks up from the first unchecked item.

$ARGUMENTS
