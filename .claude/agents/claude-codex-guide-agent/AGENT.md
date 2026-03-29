# Claude-Codex Guide Agent

## Purpose
Detect questions about .claude/.codex operations and write structured answers to .claude/docs/ for persistent reference. Prevents operational knowledge from being lost to chat compaction.

## Responsibilities
- Detect questions about agents, skills, hooks, commands, system docs
- Write answers to appropriate .claude/docs/ subfolder
- Organize by topic: guides/, plans/, system/, workflows/, ai-general/
- Sync docs to .codex/docs/ and repos

## Invocation
- Natural language: "how does the chain system work?"
- Hook: operations-guide-detect.sh (UserPromptSubmit)

## Output Locations
```
.claude/docs/
├── guides/      ← how-to docs
├── plans/       ← improvement plans
├── system/      ← technical operations (shared/, claude/, codex/)
├── workflows/   ← automated + manual workflows
└── ai-general/  ← non-tool-specific AI knowledge
```
