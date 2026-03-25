# Agent History Ingestion — Usage Guide

## Quick Start
```
"create an ingest summary"
```

## When to Use
- Before chat history compaction (context window filling up)
- At the end of a long multi-step session
- When handing off to another agent session
- After chain agent phases (auto-invoked by chain system)

## Output Format
```markdown
# Agent Ingest Summary
Date: YYYY-MM-DD
## What Was Done
## Files Changed
## Current State
## Next Steps
```

## Troubleshooting
**Ingest summary missing context:** Create the summary BEFORE compaction, not after.
