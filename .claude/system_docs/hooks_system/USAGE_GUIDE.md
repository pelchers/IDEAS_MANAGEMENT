# Usage Guide: Hooks System

## Quick Start

1. Create `.claude/settings.json` with hook definitions
2. `chmod +x .claude/hooks/scripts/*.sh`
3. Start Claude Code — hooks fire automatically

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/validate-bash.sh" }] }
    ]
  }
}
```

## Common Patterns

**Block dangerous commands** (PreToolUse, Bash):
```bash
CMD=$(jq -r '.tool_input.command')
echo "$CMD" | grep -qE '^rm\s+-rf\s+/' && { echo "BLOCKED" >&2; exit 2; }
exit 0
```

**Auto-format after edit** (PostToolUse, Edit|Write):
```bash
FILE=$(jq -r '.tool_input.file_path')
echo "$FILE" | grep -qE '\.(ts|js)$' && prettier --write "$FILE" 2>/dev/null; exit 0
```

**Block editing secrets** (PreToolUse, Edit|Write):
```bash
FILE=$(jq -r '.tool_input.file_path')
echo "$FILE" | grep -qE '\.env|\.pem$' && { echo "BLOCKED" >&2; exit 2; }; exit 0
```

## Exit Codes

`0` = allow | `1` = warn + continue | `2` = block

## Matchers

`"Bash"` | `"Edit|Write"` | `"Read"` | `""` (all tools)

## Troubleshooting

**Hook not running** — Check `chmod +x`, `#!/bin/bash` shebang, path in settings.json.

**Blocking unintentionally** — Test manually: `echo '{"tool_input":{"command":"ls"}}' | bash script.sh`

**Multiple hooks per event** — All run in order; any `exit 2` blocks.
