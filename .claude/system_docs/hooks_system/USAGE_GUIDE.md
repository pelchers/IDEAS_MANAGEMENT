# Usage Guide: Hooks System

## Quick Start

Create `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/validate-bash.sh" }]
      }
    ]
  }
}
```

Make scripts executable: `chmod +x .claude/hooks/scripts/*.sh`

## Detailed Usage

### Block Dangerous Commands

```bash
#!/bin/bash
# .claude/hooks/scripts/validate-bash.sh
CMD=$(jq -r '.tool_input.command')
if echo "$CMD" | grep -qE '^rm\s+-rf\s+/'; then
  echo "BLOCKED: Cannot rm -rf from root" >&2
  exit 2
fi
exit 0
```

### Auto-Format After Edit

```json
"PostToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/format-code.sh" }]
  }
]
```

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  prettier --write "$FILE_PATH" 2>/dev/null
fi
exit 0
```

### Block Editing Sensitive Files

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')
if echo "$FILE_PATH" | grep -qE '\.env|\.key|\.pem$'; then
  echo "BLOCKED: Cannot edit secret files" >&2
  exit 2
fi
exit 0
```

### Session Start Info

```json
"SessionStart": [
  { "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/session-info.sh" }] }
]
```

### Tool Matchers

- `"Bash"` — bash commands only
- `"Edit|Write"` — file modifications
- `"Read"` — file reads
- `""` — all tools

## Troubleshooting

**Hook not running**
1. Check script is executable: `chmod +x script.sh`
2. Verify shebang: `#!/bin/bash`
3. Confirm path in settings.json matches actual file location
4. Check matcher matches the tool name exactly

**Hook blocking unintentionally**
Test manually: `echo '{"tool_input":{"command":"ls"}}' | bash script.sh; echo $?`
Exit code should be `0` for allowed commands.

**Multiple hooks for same event**
All hooks run in order. If any returns exit 2, the operation is blocked. If you need one hook to conditionally skip, check your pattern logic carefully.
