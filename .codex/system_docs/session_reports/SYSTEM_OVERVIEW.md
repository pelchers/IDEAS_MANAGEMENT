# System Overview: Session Reports

## What It Is

Session Reports generates structured 8-section markdown summaries of a work session — capturing files changed, agents dispatched, key decisions, sync status, and pending items. Designed for post-session review, handoff documentation, and continuity across context resets.

## Component Map

```
.claude/
├── agents/session-report-agent/AGENT.md          # Report generation agent
└── skills/generating-chat-reports/SKILL.md    # 8-section format + data gathering rules

.chat-history/
├── user-messages.md                            # Source: prior entries used as context
└── reports/
    └── report_YYYY-MM-DD_HHMM.md              # Optional: saved report files
```

## When to Use vs Alternatives

| Scenario | Use chat_reports | Alternative |
|----------|-----------------|-------------|
| End of a long session | Yes — capture before context compaction | Skip for very short sessions |
| Before ingesting history | Yes — report captures more detail than ingest summary | Ingest alone loses structure |
| After orchestrator runs multiple subagents | Yes — summarize all dispatched work | N/A |
| Handoff to another person | Yes — includes pending items section | Commit message only |
| Quick status check | No — overkill | `git status` + `git log` |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **chat_history** | Reports use chat history entries as source data; can be appended to `user-messages.md` |
| **ingesting_history** | Generate report BEFORE ingesting — report retains structured detail that ingest compresses |
| **savepoint** | Report Section 8 (Metrics) includes savepoint branch names created during session |
| **claude_codex_sync** | Report Section 6 (Sync Status) tracks whether `.codex` mirrors were updated |
| **feature_expansion** | FEA Phase 6 (Report) uses the same 8-section format |

## Report Triggers

Any of these phrases activate the agent:
- "generate a session report"
- "summarize what we did"
- "give me a session report"
- "session summary"

## Output Modes

| Mode | Path | When |
|------|------|------|
| Chat (default) | Printed in conversation | Always unless overridden |
| File | `.chat-history/reports/report_YYYY-MM-DD_HHMM.md` | User asks to "save" or "write to file" |
| Append to log | `.chat-history/user-messages.md` | User asks to "add to log" |

## Design Decisions

**Why 8 sections instead of a free-form summary?**
Consistent structure makes reports machine-parseable and comparable across sessions. Free-form summaries omit different things each time, making them unreliable for continuity.

**Why include Sync Status as a mandatory section?**
Sync status is routinely forgotten in informal summaries. Elevating it to a required section prevents `.codex` mirrors and remote pushes from being silently skipped.

**Why estimate duration?**
Duration gives the human reviewer immediate context for scope. Even rough estimates (±30 min) help calibrate planning for future sessions.

## Constraints

- All 8 sections are required — omitting any section is a format violation
- Reports are printed in chat by default (file output requires explicit user request)
- Report does not modify the codebase — read-only operation except for optional file write
