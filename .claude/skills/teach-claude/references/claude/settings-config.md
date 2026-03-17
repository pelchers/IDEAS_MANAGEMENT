# Claude Code — Settings & Configuration

## Config files

### ~/.claude.json
Main config file (JSON). Contains:
- `mcpServers` — MCP server definitions per project
- Project-specific settings (keyed by project path)
- Enabled/disabled MCP JSON servers

Example MCP server entry:
```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {}
    }
  }
}
```

### ~/.claude/settings.json
User-level settings. Contains:
- `permissions` — allowed/denied tool patterns
- `env` — environment variables
- `hooks` — pre/post tool execution hooks

Example:
```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read", "Write"],
    "deny": ["Bash(rm -rf *)"]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Project-level settings
`.claude/settings.json` or `.claude/settings.local.json` in the repo root.

## MCP server management (CLI)

```bash
# Add MCP server (project scope by default)
claude mcp add <name> <command> [args...]

# Add globally (user scope)
claude mcp add --scope user <name> <command> [args...]

# Remove
claude mcp remove <name>

# List
claude mcp list
```

## Hooks
Hooks run shell commands before/after tool calls:

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Write", "command": "echo 'About to write a file'" }
    ],
    "PostToolUse": [
      { "matcher": "Bash", "command": "echo 'Bash command completed'" }
    ]
  }
}
```

## Permissions
Control which tools Claude can use without asking:

```bash
# Allow via CLI
claude settings permissions allow "Bash(npm run *)"

# Or edit settings.json directly
```
