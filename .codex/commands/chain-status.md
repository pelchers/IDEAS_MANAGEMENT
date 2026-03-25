---
name: chain-status
description: Check the progress of the current agent chain
invocable: true
---

# Chain Status (/chain-status)

Read `.claude/orchestration/chain-plan.json` and report current chain progress.

## What to Report
1. Chain ID, mode, and status (running/stopped/completed)
2. Progress: N of M phases complete
3. Current phase: subfolder + phase number + assigned tasks
4. Remaining phases with task counts
5. Last signal type and commit SHA
6. Elapsed time since chain started

## If No Chain Active
Report: "No active chain. Use `/chain <path>` to start one."

## If Chain Completed
Report: "Chain completed. N phases, M total tasks, elapsed time."
List all phase completion timestamps and commit SHAs.

$ARGUMENTS
