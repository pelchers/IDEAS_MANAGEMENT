# System Overview: Chat History

## What It Is

Chat History is the project's permanent, append-only transcript of every user message. It gives Claude Code structured memory across sessions — every request is captured with intent analysis, file references, decisions made, and agent work summaries. It is the primary continuity mechanism when context windows reset.

## Component Map

```
.claude/
├── agents/chat-history-agent/AGENT.md      # Agent that manages logging
└── skills/chat-history-convention/SKILL.md # Skill defining entry format + rules

.chat-history/
├── user-messages.md                         # Primary log (append-only)
└── reports/                                 # Optional: saved session reports
    └── report_YYYY-MM-DD_HHMM.md
```

## When to Use vs Alternatives

| Scenario | Use chat_history | Alternative |
|----------|-----------------|-------------|
| Every session start | Yes — mandatory per CLAUDE.md | None — no alternative |
| Logging agent completions | Yes — fill AGENT REPORT | Omitting it breaks continuity |
| Searching prior context | Read user-messages.md directly | N/A |
| Full session summary | Use chat_reports system | chat_reports is more structured for summaries |
| Very short confirmations | Yes — brief sections OK | Still required |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **CLAUDE.md** | Declares chat-history mandatory for every session |
| **chat_reports** | Reports reference chat history as source data; can be appended to the same log |
| **all agents** | Every agent is expected to fill in AGENT REPORT sections on completion |
| **session_orchestration** | Orchestrators read prior entries to reconstruct project state |
| **ingesting_history** | Ingest summaries compress prior sessions; chat history retains the full record |

## Mandatory Status

Per CLAUDE.md, this system is **non-negotiable**:
- Invoked at the start of every conversation
- Applied to every user message without exception
- Skipping it is a violation of project conventions

## Log Properties

- **Append-only**: entries are never edited, rotated, or deleted
- **Verbatim raw message**: user text is never cleaned up or paraphrased
- **Separator**: `---` (three dashes on their own line) between entries
- **Timestamps**: ISO 8601 format `[YYYY-MM-DDTHH:MM:SSZ]`
- **File encoding**: UTF-8

## Design Decisions

**Why keep the raw message verbatim?**
Paraphrasing introduces interpretation bias. The raw message is the ground truth; USER INTENT is the interpretation layer. Both are needed for accurate reconstruction.

**Why require all sections even for short messages?**
Consistent structure makes the log machine-parseable and prevents gaps in the record. A one-liner under each section is sufficient.

**Why is AGENT REPORT split into Initial + Final?**
Initial captures intent before work begins; Final captures outcomes after. Together they close the loop on every request.

## Constraints

- Never modify past entries — append only
- USER INTENT uses imperative phrasing (verb-first bullets)
- AGENT REPORT Final Response left blank if work is still in progress
- File path: `.chat-history/user-messages.md` (not `.log` despite what CLAUDE.md says in one section)
