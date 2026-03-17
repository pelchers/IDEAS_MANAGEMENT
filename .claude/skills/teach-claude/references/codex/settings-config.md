# OpenAI Codex CLI — Settings & Configuration

## Config file: ~/.codex/config.toml

Codex uses TOML format (not JSON like Claude).

### Example config.toml

```toml
personality = "pragmatic"
model = "gpt-5.4"
model_reasoning_effort = "high"

[features]
powershell_utf8 = true
shell_snapshot = true
unified_exec = true

[mcp_servers]
[mcp_servers.MCP_DOCKER]
command = 'docker.exe'
args = ['mcp', 'gateway', 'run']

[mcp_servers.playwright]
command = 'npx'
args = ['@playwright/mcp@latest']

[projects.'C:\Ideas\IDEA-MANAGEMENT']
trust_level = "trusted"

[windows]
sandbox = "elevated"

[notice]
hide_full_access_warning = true
```

### Key sections

| Section | Purpose |
|---------|---------|
| Top-level | `personality`, `model`, `model_reasoning_effort` |
| `[features]` | Feature flags |
| `[mcp_servers]` | MCP server definitions (each as `[mcp_servers.<name>]`) |
| `[projects.'<path>']` | Per-project settings (trust level) |
| `[windows]` | Windows-specific settings (sandbox mode) |
| `[notice]` | UI/notification preferences |

### Adding an MCP server

Add a new TOML section:

```toml
[mcp_servers.my-server]
command = 'npx'
args = ['@my-scope/my-mcp@latest']
```

### Trust levels

```toml
[projects.'C:\path\to\project']
trust_level = "trusted"    # Can also be "sandboxed" or "untrusted"
```
