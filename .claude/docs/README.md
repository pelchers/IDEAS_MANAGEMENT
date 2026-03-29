# .claude/docs — Persistent Documentation

This folder contains persistent documentation generated during agent sessions. Unlike chat history (which compacts) or system_docs (which documents agent/skill architecture), this folder captures operational knowledge, guides, plans, and workflows that persist across sessions.

## Structure

```
docs/
├── README.md              ← this file
├── guides/                ← how-to guides for users
├── plans/                 ← improvement plans from ideation sessions
├── system/                ← technical operations documentation
│   ├── shared/            ← applies to both claude + codex
│   ├── claude/            ← claude-specific operations
│   └── codex/             ← codex-specific operations
├── workflows/             ← automated + manual workflow documentation
└── ai-general/            ← AI knowledge not specific to claude/codex tooling
```

## What Goes Where

| Folder | Content | Example |
|---|---|---|
| `guides/` | User-facing how-to docs | "How to create a new agent" |
| `plans/` | Design plans and improvement proposals | "Agent-hook audit plan 2026-03-26" |
| `system/` | Technical operations of .claude/.codex | "Hook lifecycle", "Settings format" |
| `workflows/` | Step-by-step workflow docs | "FEA cycle", "Chain agent workflow" |
| `ai-general/` | AI knowledge (non-tool-specific) | "Agent design patterns" |

## Sync
This folder mirrors to `.codex/docs/` and syncs to repos listed in `SYNC-REPOS.md`.
