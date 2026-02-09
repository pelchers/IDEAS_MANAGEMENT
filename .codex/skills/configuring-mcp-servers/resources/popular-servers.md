# Popular MCP Servers

Comprehensive list of commonly-used MCP servers for various integrations and use cases.

## Official Servers

### Filesystem Server

**Purpose**: Local file and directory access

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**Configuration**:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
      "env": {}
    }
  }
}
```

**Capabilities**:
- Read files and directories
- Write and edit files
- Search file contents
- List directory structures
- Monitor file changes

**Use cases**:
- Project file access
- Documentation reading
- Code analysis
- File manipulation

---

### GitHub Server

**Purpose**: GitHub API integration

**Installation**:
```bash
pip install mcp-server-github
```

**Configuration**:
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

**Required Environment**:
- `GITHUB_PERSONAL_ACCESS_TOKEN`: Personal access token with repo permissions

**Capabilities**:
- Search repositories and code
- Read repository files
- Create and update issues
- Manage pull requests
- List commits and branches
- Fork repositories

**Use cases**:
- Code research
- Issue management
- PR automation
- Repository analysis

---

### Slack Server

**Purpose**: Slack workspace integration

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-slack
```

**Configuration**:
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

**Required Environment**:
- `SLACK_BOT_TOKEN`: Bot user OAuth token
- `SLACK_TEAM_ID`: Workspace team ID

**Capabilities**:
- Send messages to channels
- Read channel history
- Search conversations
- List channels and users
- Upload files
- React to messages

**Use cases**:
- Team communication
- Status updates
- Notification automation
- Message search

---

### PostgreSQL Server

**Purpose**: PostgreSQL database access

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-postgres
```

**Configuration**:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/dbname"
      }
    }
  }
}
```

**Required Environment**:
- `DATABASE_URL`: PostgreSQL connection string

**Capabilities**:
- Execute SQL queries
- Analyze database schema
- List tables and columns
- Query optimization suggestions
- Data export

**Use cases**:
- Database analysis
- Query generation
- Schema exploration
- Data migration

---

### Google Drive Server

**Purpose**: Google Drive file access

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-gdrive
```

**Configuration**:
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

**Required Environment**:
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth client secret

**Capabilities**:
- Read documents and files
- Search Drive contents
- List folders and files
- Download files
- Get file metadata

**Use cases**:
- Document access
- Content search
- File management
- Collaboration

---

## Community Servers

### Notion Server

**Purpose**: Notion database and page access

**Repository**: https://github.com/makenotion/notion-mcp-server

**Configuration**:
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_INTEGRATION_TOKEN}"
      }
    }
  }
}
```

**Capabilities**:
- Query databases
- Read pages and blocks
- Create and update content
- Search across workspace
- Manage properties

---

### Jira Server

**Purpose**: Jira project management

**Repository**: https://github.com/modelcontextprotocol/servers

**Configuration**:
```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["mcp-server-jira"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_TOKEN}"
      }
    }
  }
}
```

**Capabilities**:
- Create and update issues
- Search projects and issues
- Manage sprints
- Update issue status
- Add comments

---

### Figma Server

**Purpose**: Figma design file access

**Repository**: https://github.com/figma/figma-mcp-server

**Configuration**:
```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["./figma-server/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_TOKEN}"
      }
    }
  }
}
```

**Capabilities**:
- Read design files
- Extract components
- Get design tokens
- Export assets
- Analyze designs

---

### Shopify Server

**Purpose**: Shopify store management

**Configuration**:
```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": ["mcp-server-shopify"],
      "env": {
        "SHOPIFY_STORE_URL": "https://your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "${SHOPIFY_TOKEN}"
      }
    }
  }
}
```

**Capabilities**:
- Manage products
- Process orders
- Handle customers
- Update inventory
- Analyze sales

---

### Stripe Server

**Purpose**: Stripe payment operations

**Configuration**:
```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["mcp-server-stripe"],
      "env": {
        "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
      }
    }
  }
}
```

**Capabilities**:
- Process payments
- Manage customers
- Handle subscriptions
- Retrieve invoices
- Generate reports

---

## Specialized Servers

### Brave Search Server

**Purpose**: Web search with Brave Search API

**Configuration**:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**Capabilities**:
- Web search
- News search
- Image search
- Video search

---

### Puppeteer Server

**Purpose**: Browser automation and web scraping

**Configuration**:
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {}
    }
  }
}
```

**Capabilities**:
- Take screenshots
- Generate PDFs
- Scrape web pages
- Fill forms
- Click elements

---

### Git Server

**Purpose**: Local Git repository operations

**Configuration**:
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "env": {}
    }
  }
}
```

**Capabilities**:
- Commit changes
- Create branches
- View history
- Show diffs
- Manage remotes

---

### Memory Server

**Purpose**: Persistent memory storage

**Configuration**:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {}
    }
  }
}
```

**Capabilities**:
- Store key-value pairs
- Persist across sessions
- Search stored data
- Update values
- Delete entries

---

## Development Tools

### Sequential Thinking Server

**Purpose**: Structured problem-solving workflows

**Configuration**:
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    }
  }
}
```

**Capabilities**:
- Structured thinking process
- Step-by-step reasoning
- Problem decomposition

---

### Everart Server

**Purpose**: AI image generation

**Configuration**:
```json
{
  "mcpServers": {
    "everart": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everart"],
      "env": {
        "EVERART_API_KEY": "${EVERART_API_KEY}"
      }
    }
  }
}
```

**Capabilities**:
- Generate images
- Edit images
- Apply styles
- Batch processing

---

## Server Selection Guide

### By Use Case

**Personal Productivity**:
- Google Drive (documents)
- Notion (notes)
- Google Calendar (scheduling)
- Slack (communication)

**Software Development**:
- GitHub (code repositories)
- Git (local version control)
- PostgreSQL (database)
- Filesystem (local files)

**E-commerce**:
- Shopify (store management)
- Stripe (payments)
- Google Analytics (analytics)

**Design & Creative**:
- Figma (design files)
- Everart (image generation)
- Puppeteer (screenshots)

**Project Management**:
- Jira (issue tracking)
- GitHub (project boards)
- Notion (documentation)
- Slack (communication)

### By Scope

**User-Level** (Personal tools):
- GitHub
- Google Drive
- Slack
- Notion

**Project-Level** (Team/project-specific):
- Filesystem
- PostgreSQL
- Git
- Figma

### By Complexity

**Simple** (Quick setup):
- Memory
- Filesystem
- Git

**Medium** (OAuth required):
- Google Drive
- Slack
- GitHub

**Complex** (Custom configuration):
- PostgreSQL
- Shopify
- Stripe

---

## Multi-Server Configurations

### Full-Stack Development

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "${DATABASE_URL}" }
    },
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

### Content Creation

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
    },
    "notion": {
      "command": "npx",
      "args": ["@notionhq/notion-mcp-server"],
      "env": { "NOTION_TOKEN": "${NOTION_TOKEN}" }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "${BRAVE_API_KEY}" }
    }
  }
}
```

### E-commerce Platform

```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": ["mcp-server-shopify"],
      "env": {
        "SHOPIFY_STORE_URL": "${SHOPIFY_STORE_URL}",
        "SHOPIFY_ACCESS_TOKEN": "${SHOPIFY_TOKEN}"
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["mcp-server-stripe"],
      "env": { "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}" }
    },
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

---

## Finding More Servers

### Official Registry

**GitHub Organization**: https://github.com/modelcontextprotocol/servers

**NPM Packages**: Search for `@modelcontextprotocol/server-*`

**PyPI Packages**: Search for `mcp-server-*`

### Community Resources

**Awesome MCP**: https://github.com/modelcontextprotocol/awesome-mcp

**Discord Community**: https://discord.gg/modelcontextprotocol

**Forum**: https://discuss.modelcontextprotocol.io

### Creating Custom Servers

See MCP SDK documentation for building your own servers:
- TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Python SDK: https://github.com/modelcontextprotocol/python-sdk

---

This list provides a comprehensive overview of available MCP servers for various integration needs. Choose servers based on your specific use case, scope requirements, and technical complexity.

