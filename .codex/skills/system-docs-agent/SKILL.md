---
name: system-docs-agent
description: Creates and maintains system documentation entries in .codex/system_docs/ for agents and skills. Automatically invoked after new agents or skills are created to document their purpose, architecture, component locations, and integration points. Use when adding new agents, skills, or systems that need system_docs entries.
---

# System Docs Agent Skill

Manages the `.codex/system_docs/` directory — the central reference mapping every agent, skill, config, and output path in the project. Automatically invoked after agent/skill creation to keep documentation in sync.

## When This Skill Activates

This skill should be invoked whenever:
1. A new agent is created in `.claude/agents/` or `.codex/agents/`
2. A new skill is created in `.claude/skills/` or `.codex/skills/`
3. An existing system's agents/skills are modified, renamed, or deprecated
4. The master index needs updating after structural changes
5. The user requests an audit: "audit system docs", "check which systems have docs", "update system docs", "are there systems without docs?"
6. Via slash command: `/system-docs-audit` or `/system-docs-audit --fix`

### Trigger Phrases (natural language)
- "audit the system docs" / "audit systemdocs"
- "check system docs" / "review system docs"
- "which systems have docs?" / "which systems are missing docs?"
- "update system docs" / "create docs for [system name]"
- "are there any systems without documentation?"
- "run system docs audit"

## System Docs Convention

### Directory Structure

```
.codex/system_docs/
├── README.md                    ← Master index (MUST be updated for every change)
├── <system_name>/               ← One folder per "system"
│   ├── README.md                ← REQUIRED: purpose, component map, integration points
│   ├── USAGE_GUIDE.md           ← REQUIRED: how to use, quick start, examples, troubleshooting
│   ├── ARCHITECTURE.md          ← STANDARD: technical diagrams, flows, state machines (2+ components)
│   ├── SYSTEM_OVERVIEW.md       ← STANDARD: complete reference for back-referencing design decisions
│   ├── <subsystem>/             ← OPTIONAL: subfolder for coalescing sub-systems
│   │   └── README.md
│   └── <topic>.md               ← OPTIONAL: domain-specific deep dives
└── deprecated/                  ← Superseded systems
    ├── DEPRECATED.md
    └── <old_system>/
```

### Minimum File Requirements

| Level | Files Required | When |
|---|---|---|
| **Minimum** | `README.md` + `USAGE_GUIDE.md` | Every system |
| **Standard** | + `ARCHITECTURE.md` + `SYSTEM_OVERVIEW.md` | Systems with 2+ components |
| **Extended** | + subfolders + additional `.md` files | Complex multi-component systems |

### Diagram Requirements

Use a combination of **ASCII art** and **Mermaid diagrams** where appropriate:

**Use Mermaid (` ```mermaid `) for:**
- Flow diagrams (component flows, resolution cascades)
- State machines (status transitions)
- Sequence diagrams (agent↔subagent interactions)
- Architecture diagrams (component relationships)

**Use ASCII art for:**
- Simple directory trees
- Inline decision trees (` → Folder` / `→ Table entry`)
- Small 2-3 step flows

**Rules:**
- Include diagrams where they help different learner types (visual + textual)
- Don't duplicate — if a table explains it clearly, don't also make a diagram
- Complex flows (5+ steps) should ALWAYS have a diagram
- Simple concepts should NOT have forced diagrams

### Reference Examples

See `.claude/skills/system-docs-agent/references/` for templates:
- `example-readme.md` — README structure with component map
- `example-usage-guide.md` — usage guide with quick start and troubleshooting
- `example-architecture.md` — architecture doc with Mermaid diagrams

### What Constitutes a "System"

A **system** is a group of related agents and/or skills that work together. Examples:
- An orchestrator + subagent pair = one system
- A skill + its dedicated agent = one system
- A standalone agent with a unique skill = one system

**Standalone skills** that don't have a dedicated agent or don't form a system go in the "Skills Not Mapped to System Docs" table in the master index instead of getting their own folder.

### Decision: Folder vs Table Entry

```
Does the agent/skill have:
  - Multiple components (agent + skill + config)? → Folder
  - An orchestrator/subagent pattern? → Folder
  - Complex architecture worth documenting? → Folder
  - Resource files or scripts? → Folder
  - Just a single standalone skill? → Table entry
  - A utility with no dedicated agent? → Table entry
```

## README.md Format (Per-System Folder)

Every system folder's README.md MUST follow this structure:

```markdown
# <System Display Name>

System documentation for the <description> agents and skills.

## Purpose

<2-3 sentences explaining what this system does and why it exists.>

## When to Use

- <Bullet list of trigger conditions>
- <When should a user/agent invoke this system?>

## Architecture

<Diagram showing component relationships.
Use Mermaid for complex flows (```mermaid flowchart/sequence/state).
Use ASCII box-drawing (┌ ─ ┐ │ ├ ┤ └ ┘ ▼ ▲) for simple trees.>

## Key Concepts

<Brief explanations of important patterns or conventions specific to this system.>

## Workflow

<Numbered steps describing how the system operates end-to-end.>

## Agent & Skill Locations

| Component | Claude Path | Codex Path |
|-----------|-------------|------------|
| <Agent/Skill Name> | `.claude/<path>` | `.codex/<path>` |

## Integration with Other Systems

- **<system-name>**: <How this system relates to or depends on another system.>
```

### Required Sections
- Purpose, Agent & Skill Locations are ALWAYS required
- Architecture diagram is required if system has multiple components
- When to Use is required for systems invoked by users/agents
- Key Concepts, Workflow, Integration are included when relevant

### Optional Sections (Add When Relevant)
- Output Locations (if system produces files)
- Configuration (if system has config files)
- Comparison tables (if system has a sibling/alternative)
- Example output (if helps clarify what system produces)

## Master Index Format (system_docs/README.md)

The master index has three sections that MUST all be updated:

### 1. File Tree — Agent & Skill → System Docs Mapping

```
system_docs/
├── <system_name>/               ← <Display Name>
│   └── README.md
│       Agents:
│         .codex/agents/<agent-name>/
│       Skills:
│         .codex/skills/<skill-name>/
│       Config:
│         <config paths if any>
│       Output:
│         <output paths if any>
```

### 2. Skills Not Mapped to System Docs

Table for standalone skills that don't warrant their own folder:

```
| Skill | Purpose | Related System |
|-------|---------|---------------|
| `skill-name` | Brief purpose | parent_system or — |
```

### 3. System Overview

Summary table with counts:

```
| System | Purpose | Agent Count | Skill Count |
|--------|---------|-------------|-------------|
| <Name> | <Brief> | N | N |
```

Update the **Total** row at the bottom.

## Procedure: Documenting a New Agent/Skill

### Step 1: Read the New Component

Read the YAML frontmatter and body of the new agent/skill to extract:
- Name and description
- Skills referenced (for agents)
- Tools used
- Resource files
- Related systems

### Step 2: Determine Classification

Apply the folder-vs-table decision tree above.

### Step 3: Create Documentation

**If folder:**
1. Create `.codex/system_docs/<system_name>/README.md`
2. Follow the per-system README format above
3. Include ASCII architecture diagram
4. Map all component paths (Claude + Codex)

**If table entry:**
1. Add a row to the "Skills Not Mapped" table in the master index

### Step 4: Update Master Index

1. Add entry to the file tree section
2. Add/update the system overview table
3. Update the Total row

### Step 5: Mirror to Both Repos

Ensure `.codex/system_docs/` changes exist in both:
- The current working repo
- The template repo (if maintaining-trinary-sync applies)

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| System folder | snake_case | `game_development` |
| README | Always `README.md` | `README.md` |
| Detail docs | kebab-case .md | `architecture.md` |
| Display names | Title Case | `Game Development System` |

## Anti-Patterns

- **Don't create empty system_docs folders** — every folder needs at least a README.md
- **Don't duplicate agent/skill content** — system_docs summarize and map, they don't repeat instructions
- **Don't skip the master index** — it's the primary navigation entry point
- **Don't create a folder for a single standalone utility skill** — use the table instead
