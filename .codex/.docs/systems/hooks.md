# Hooks

## settings.json
File: `.codex/hooks/settings.json`

- `SessionStart`: environment prep script.
- `PreToolUse`: bash validator and file edit protections.
- `PostToolUse`: format + secret scan + file size guard.
- `Stop`: git context report + orchestrator spawn hook.

## orchestrator-poke.ps1
File: `.codex/hooks/scripts/orchestrator-poke.ps1`

- Reads `next_phase.json`.
- Builds a `codex exec` command.
- Optionally prefixes prompt with agent file path.
- Executes (unless dryRun).
- Archives the queue file.
