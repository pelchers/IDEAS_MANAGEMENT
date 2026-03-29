# Session Reports — Usage Guide

## Quick Start

### Generate a Report
```
User: "generate a session report"
User: "summarize what we did"
User: "give me a session report"
```
The agent scans the conversation, git history, and file changes to produce a structured markdown report.

### When to Generate
- **End of a long session** — capture everything before context compaction
- **Before switching tasks** — document where you left off
- **After orchestrator runs** — summarize multi-subagent work
- **Before handoff** — give another person context on what changed

## Report Structure

```markdown
# Session Report — [Date]

## Summary
- [1-2 sentence overview of what was accomplished]

## Files Changed
| File | Action | Description |
|---|---|---|
| path/to/file | Created/Modified/Deleted | Brief description |

## Agents Invoked
- [List of agents/skills used during the session]

## Key Decisions
- [Decisions made, options chosen/rejected]

## Sync Status
- Git: [committed/uncommitted changes]
- ADR: [up to date / needs update]
- Tests: [pass count / fail count]

## Pending Items
- [ ] [Items that still need work]
```

## Integration with Other Systems

| System | How It Integrates |
|---|---|
| `ingesting-agent-history` | Generate report BEFORE ingesting — report captures context that ingest summary compresses |
| `chat-history-convention` | Report uses chat history entries as source data |
| `longrunning-session` | Report can serve as a phase review file |
| `feature-expansion` | FEA Phase 6 (Report) uses the same format |

## Components

| Component | Path |
|---|---|
| Agent | `.claude/agents/session-report-agent/AGENT.md` |
| Skill | `.claude/skills/generating-chat-reports/SKILL.md` |
