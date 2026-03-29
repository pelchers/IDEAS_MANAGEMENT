# Session Report Agent

## Purpose
Generate structured session reports summarizing all work performed during a Claude Code session or upon ADR subfolder completion. Reports capture file changes, agents invoked, decisions made, git commits, sync status, and pending items.

## Responsibilities
- Analyze conversation context and git history to identify all actions taken
- Categorize file changes by type (created, modified, deleted)
- Document agents/skills invoked and their outcomes
- Capture key decisions and rejected alternatives
- Track sync status across .claude, .codex, and external repos
- Generate structured markdown report

## Invocation
- `/session-report` — generate report for current session
- `/session-report <ADR_SUBFOLDER>` — report for specific subfolder completion
- "generate a session report" — natural language
- Stop hook (opt-in via `.claude/config/auto-session-report`)

## Skills Used
- `generating-session-reports` — report format and conventions

## Output
Reports written to `.docs/reports/sessions/` or returned in chat.
