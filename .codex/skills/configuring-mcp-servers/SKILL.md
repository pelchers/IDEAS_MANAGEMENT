---
name: configuring-mcp-servers
description: Configures Model Context Protocol (MCP) servers for Claude Code, including transport types (stdio, SSE, HTTP), scope levels (user/project), and server capabilities (prompts, resources, tools). Use when integrating external tools, data sources, or workflows with Claude.
---

# Configuring MCP Servers

Complete guide for configuring Model Context Protocol (MCP) servers to extend Claude Code with external tools, data sources, and workflows.

## What is MCP?

**Model Context Protocol (MCP)** is an open standard for connecting AI applications to external systems. Think of it as "USB-C for AI" - a universal connector that enables Claude to access:

- **Data Sources**: Files, databases, APIs
- **Tools**: Search engines, calculators, external services
- **Workflows**: Specialized prompts and templates

---

## MCP Architecture

```mermaid
graph LR
    A[Claude Code Client] --> B{MCP Protocol}
    B --> C[Filesystem Server]
    B --> D[GitHub Server]
    B --> E[Slack Server]
    B --> F[Custom Server]

    C --> G[Local Files]
    D --> H[GitHub API]
    E --> I[Slack API]
    F --> J[Your Service]
```

### Client-Server Model

**MCP Server** (Provider):
- Exposes capabilities through standardized interface
- Runs as separate process
- Communicates via transport protocol
- Provides prompts, resources, and/or tools

**MCP Client** (Consumer):
- Claude Code (or other AI applications)
- Connects to multiple servers
- Aggregates capabilities
- Routes requests to appropriate servers

---

## Transport Types

### 1. Stdio (Standard Input/Output)

**Use case**: Local command-line tools and scripts

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {}
    }
  }
}
```

**Characteristics**:
- Simplest transport
- Process-to-process communication
- Local execution only
- No network overhead

**Best for**:
- Local file access
- Command-line utilities
- Development tools
- Simple integrations

### 2. SSE (Server-Sent Events)

**Use case**: HTTP-based streaming connections

```json
{
  "mcpServers": {
    "remote-api": {
      "url": "https://api.example.com/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

**Characteristics**:
- HTTP streaming
- Server-to-client push
- Real-time updates
- Network-based

**Best for**:
- Remote services
- Real-time data feeds
- Cloud integrations
- Streaming responses

### 3. HTTP

**Use case**: RESTful API integrations

```json
{
  "mcpServers": {
    "rest-api": {
      "url": "https://api.example.com/mcp",
      "transport": "http",
      "headers": {
        "X-API-Key": "${API_KEY}"
      }
    }
  }
}
```

**Characteristics**:
- Request-response pattern
- Standard HTTP methods
- Stateless
- Widely supported

**Best for**:
- REST APIs
- Third-party services
- Simple web services
- Standard integrations

---

## Scope Levels

### User-Level Configuration

**Location**: `~/.config/claude/mcp.json` (macOS/Linux) or `%APPDATA%\claude\mcp.json` (Windows)

```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    },
    "google-calendar": {
      "command": "node",
      "args": ["./servers/calendar/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "xxx",
        "GOOGLE_CLIENT_SECRET": "xxx"
      }
    }
  }
}
```

**Use when**:
- Personal tool access (GitHub, Notion, Calendar)
- System-wide integrations
- User-specific credentials
- Global utilities

### Project-Level Configuration

**Location**: `.mcp/config.json` (project root)

```json
{
  "mcpServers": {
    "project-db": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "figma": {
      "command": "node",
      "args": ["./mcp/figma-server.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_TOKEN}"
      }
    }
  }
}
```

**Use when**:
- Project-specific data sources
- Team-shared configurations
- Development database access
- Project tool integrations

---

## Server Capabilities

### Prompts

**Purpose**: Reusable prompt templates and workflows

```typescript
// MCP Server exposes prompts
{
  prompts: [
    {
      name: "code-review",
      description: "Comprehensive code review workflow",
      arguments: [
        { name: "file_path", required: true },
        { name: "focus_areas", required: false }
      ]
    }
  ]
}
```

**Use cases**:
- Standardized workflows
- Team conventions
- Complex multi-step processes
- Domain-specific templates

### Resources

**Purpose**: Access to external data sources

```typescript
// MCP Server exposes resources
{
  resources: [
    {
      uri: "file:///project/src/**/*.ts",
      name: "TypeScript Source Files",
      mimeType: "text/typescript"
    },
    {
      uri: "db://postgres/users",
      name: "User Database",
      mimeType: "application/json"
    }
  ]
}
```

**Use cases**:
- File system access
- Database connections
- API data sources
- Document repositories

### Tools

**Purpose**: Callable functions and operations

```typescript
// MCP Server exposes tools
{
  tools: [
    {
      name: "search_codebase",
      description: "Search across project files",
      parameters: {
        query: { type: "string", required: true },
        file_pattern: { type: "string", required: false }
      }
    }
  ]
}
```

**Use cases**:
- Custom operations
- External API calls
- Automated actions
- Service integrations

---

## Configuration Examples

### Filesystem Access

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"],
      "env": {}
    }
  }
}
```

**Capabilities**: Read/write local files, list directories, search content

### GitHub Integration

```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Capabilities**: Search repositories, read files, create issues, manage PRs

### Slack Integration

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
      }
    }
  }
}
```

**Capabilities**: Send messages, read channels, search conversations

### Database Access

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

**Capabilities**: Query tables, analyze schema, execute SQL

### Google Drive

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gdrive"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}"
      }
    }
  }
}
```

**Capabilities**: Read documents, search files, manage folders

---

## Environment Variables

### Secure Credential Management

**Use environment variables** for sensitive data:

```json
{
  "mcpServers": {
    "api-service": {
      "command": "node",
      "args": ["./server.js"],
      "env": {
        "API_KEY": "${API_KEY}",
        "API_SECRET": "${API_SECRET}"
      }
    }
  }
}
```

**Best practices**:
1. Never hardcode credentials in config
2. Use `${VAR_NAME}` syntax for substitution
3. Store secrets in `.env` file (gitignored)
4. Use system environment variables for user-level config
5. Document required environment variables

### Environment File Example

**.env** (project root):
```bash
# MCP Server Credentials
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
DATABASE_URL=postgresql://localhost:5432/mydb
FIGMA_TOKEN=figd_xxxxxxxxxxxxx
API_KEY=xxxxxxxxxxxxx
```

**Load in shell** (before running Claude Code):
```bash
export $(cat .env | xargs)
claude
```

---

## Creating Custom MCP Servers

### Basic Server Structure

```typescript
// my-mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "my-custom-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Register tools
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "custom_operation",
      description: "Performs custom operation",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string" },
        },
      },
    },
  ],
}));

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "custom_operation") {
    const result = performOperation(request.params.arguments.input);
    return { result };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Register Custom Server

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./my-mcp-server.js"],
      "env": {}
    }
  }
}
```

---

## Popular MCP Servers

### Official Servers

| Server | Purpose | Transport |
|--------|---------|-----------|
| `@modelcontextprotocol/server-filesystem` | File access | stdio |
| `@modelcontextprotocol/server-github` | GitHub API | stdio |
| `@modelcontextprotocol/server-slack` | Slack integration | stdio |
| `@modelcontextprotocol/server-postgres` | PostgreSQL | stdio |
| `@modelcontextprotocol/server-gdrive` | Google Drive | stdio |

### Community Servers

- **Notion**: Access Notion databases and pages
- **Jira**: Create/update issues, search projects
- **Figma**: Read designs, extract assets
- **Shopify**: Manage products, orders
- **Stripe**: Payment operations, customer management

**Find more**: https://github.com/modelcontextprotocol/servers

---

## Best Practices

### Configuration Organization

```json
{
  "mcpServers": {
    // Group by category

    // Version Control
    "github": { "command": "uvx", "args": ["mcp-server-github"] },

    // Communication
    "slack": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-slack"] },

    // Data Sources
    "postgres": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres"] },
    "filesystem": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem"] }
  }
}
```

### Performance Optimization

1. **Limit concurrent servers**: Only load what you need
2. **Use project scope**: Don't load user-level servers for every project
3. **Lazy loading**: Start servers on-demand when possible
4. **Cache responses**: Implement caching in custom servers
5. **Monitor resources**: Track memory and CPU usage

### Security Guidelines

1. **Minimal permissions**: Grant least privilege access
2. **Validate inputs**: Sanitize all tool parameters
3. **Audit logging**: Log all MCP operations
4. **Rate limiting**: Prevent abuse of external APIs
5. **Credential rotation**: Regularly update tokens and keys

### Error Handling

```typescript
// Custom server with proper error handling
server.setRequestHandler("tools/call", async (request) => {
  try {
    const result = await performOperation(request.params.arguments);
    return { result };
  } catch (error) {
    return {
      error: {
        code: "OPERATION_FAILED",
        message: error.message,
      },
    };
  }
});
```

---

## Troubleshooting

### Common Issues

**Issue: Server not connecting**
```bash
# Check server is installed
npx @modelcontextprotocol/server-filesystem --version

# Test server directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | npx @modelcontextprotocol/server-filesystem /tmp
```

**Issue: Environment variables not loading**
```json
// Verify variable is set
{
  "command": "sh",
  "args": ["-c", "echo $GITHUB_TOKEN && node server.js"]
}
```

**Issue: Permission denied**
```bash
# Check file permissions
chmod +x ./my-mcp-server.js

# Verify allowed directories
# Filesystem server only accesses specified paths
```

### Debugging

**Enable verbose logging:**
```json
{
  "mcpServers": {
    "debug-server": {
      "command": "node",
      "args": ["--inspect", "./server.js"],
      "env": {
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

---

## Advanced Topics

For detailed information on:
- **MCP protocol specification** → `resources/mcp-architecture.md`
- **Popular MCP servers** → `resources/popular-servers.md`
- **Testing MCP connections** → `scripts/test-mcp-connection.js`
- **Configuration template** → `scripts/mcp-config-template.json`

## References

- **MCP Specification**: https://modelcontextprotocol.io/
- **Official Servers**: https://github.com/modelcontextprotocol/servers
- **SDK Documentation**: https://github.com/modelcontextprotocol/typescript-sdk
- **Claude Code MCP**: https://code.claude.com/docs/en/mcp

