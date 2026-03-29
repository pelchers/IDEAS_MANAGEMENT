# System Overview: Repo Setup

## What It Is

The Repo Setup system is an interactive project bootstrapper that conducts a structured discovery conversation, then populates planning documentation and AI understanding docs from what was learned. It ensures every new project starts with real content — not empty templates — across a consistent set of planning files.

## Component Map

```
.claude/
├── agents/repo-setup-agent/AGENT.md           # Conversational bootstrapper (8-step workflow)
└── skills/repo-setup-session/SKILL.md          # Templates + writing phase procedures

.ai-ingest-docs/
└── project-goals-understanding.md              # OUTPUT: AI memory doc

.docs/planning/
├── README.md                                   # OUTPUT: Planning index
├── overview.md                                 # OUTPUT: Vision + scope
├── prd.md                                      # OUTPUT: Product requirements
├── technical-specification.md                  # OUTPUT: Architecture + stack
├── user-stories.md                             # OUTPUT: User stories
├── milestones.md                               # OUTPUT: Delivery phases
└── risks-and-decisions.md                      # OUTPUT: Risk log
```

## When to Use vs Alternatives

| Scenario | Use repo_setup | Alternative |
|----------|---------------|-------------|
| Starting a brand new project | Yes | Copy-paste templates manually |
| Adding docs to an undocumented repo | Yes | Write docs directly |
| Updating existing planning docs | No — edit them directly | N/A |
| Generating code scaffolding | No — different concern | Framework CLI tools |
| Small personal script | No — overkill | Single README |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **adr_setup** | Repo setup calls adr-setup to initialize the .adr/ workspace as part of bootstrapping |
| **chat_history** | The discovery conversation is logged; setup context persists across sessions |
| **ingesting_history** | Repo setup session captured in ADR ingest for context continuity |
| **production_frontend** | Planning docs (prd.md, user-stories.md) feed into production spec generation |

## Trigger Phrases

Any of these activate the agent:
- "set up a new project"
- "bootstrap this repo"
- "initialize project docs"
- "create planning docs"

## Document Cross-References

The agent ensures docs reference each other correctly:
- `milestones.md` phases reference `prd.md` feature groups
- `user-stories.md` stories map to `prd.md` features
- `technical-specification.md` stack choices align with `risks-and-decisions.md` decisions
- `README.md` indexes all files with one-line descriptions

## Design Decisions

**Why a discovery conversation before writing?**
Templates filled with placeholder text are worthless. Real content requires real answers. The conversation extracts the specific details that differentiate this project from any other.

**Why separate core from conditional docs?**
A project without auth doesn't need an auth doc. Writing it wastes space and creates maintenance burden. Conditional docs are created only when they contain meaningful content.

**Why `.ai-ingest-docs/project-goals-understanding.md` in addition to `.docs/planning/`?**
Planning docs are for humans. The project-goals file is structured for AI context restoration — brief, structured, designed to be read at session start to quickly orient the agent.

## Constraints

- Discovery conversation must complete before any files are written
- `[TBD — needs input]` is used instead of invented details
- Only writes to `.docs/planning/` and `.ai-ingest-docs/` unless explicitly asked
- Non-template content is never overwritten without a warning
- HTTPS remotes only for initial commit push
