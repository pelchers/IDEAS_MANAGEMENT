---
name: session-report
description: Generate a structured session report summarizing all work done
invocable: true
---

# Session Report (/session-report)

Generate a structured report of work done in this session or for a specific ADR subfolder completion.

## Usage
```
/session-report                    # report for current session
/session-report 9_DYNAMIC_NAV     # report for ADR subfolder completion
```

## Report Includes
- Files created/modified/deleted
- Agents and skills invoked
- Key decisions made
- Git commits with SHAs
- Sync status (.claude/.codex/repos)
- Pending items

Use the `generating-session-reports` skill conventions.

$ARGUMENTS
