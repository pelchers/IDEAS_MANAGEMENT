# Category Folder Proposal: Frontend / Backend / Planning / Orchestration / Database

**Source**: `C:\Template\Claude+Codex Agent+Skill Sync\All\`
**Targets**: The 5 sibling folders in the same repo root

Each category folder gets the same `.claude/` + `.codex/` dual-system structure as `All/`, but containing **only** the agents, skills, hooks, and infrastructure relevant to that category. Files are copied (not moved) from `All/` — `All/` stays untouched as the complete set.

---

## Proposed Categorization

```
Frontend/          6 agents, 7 skills    — UI/visual concept generation + validation
Backend/           2 agents, 3 skills    — Git workflows, DevOps, security tooling
Planning/          3 agents, 4 skills    — Research, documentation, user story validation
Orchestration/     4 agents, 5 skills    — Session management, ADR, phase orchestration
Database/          0 agents, 0 skills    — Empty (no data-layer agents in current set)
```

---

## Frontend/

**What belongs here**: Everything related to generating, validating, and documenting UI/visual concepts.

### Agents (6)

| Agent | Why Frontend |
|-------|-------------|
| `planning-frontend-design-orchestrator` | Core 1 — dispatches frontend concept generation |
| `frontend-design-subagent` | Core 1 — generates each frontend concept pass |
| `planning-visual-creative-orchestrator` | Core 2 — dispatches visual/creative generation |
| `visual-creative-subagent` | Core 2 — generates each visual showcase |
| `playwright-testing-agent` | Visual validation — captures screenshots for concept review |
| `user-dev-docs-agent` | Documents generated frontend concepts into visual guides |

### Skills (7)

| Skill | Why Frontend |
|-------|-------------|
| `planning-frontend-design-orchestrator` | Orchestrator workflow for frontend concepts |
| `frontend-design-subagent` | Subagent workflow + scripts (Playwright capture, uniqueness check) |
| `planning-visual-creative-orchestrator` | Orchestrator workflow for visual/creative |
| `visual-creative-subagent` | Subagent workflow + scripts (Playwright showcase capture) |
| `testing-with-playwright` | Foundation E2E testing skill used by both concept systems |
| `testing-user-stories-validation` | Validates concepts against user story acceptance criteria |
| `producing-visual-docs` | Creates visual documentation from generated concepts |

### Infrastructure

| Item | Contents |
|------|----------|
| `system_docs/frontend_planning/` | 6 architectural docs (architecture, config ref, generation workflow, style families, validation) |
| `hooks/scripts/` | `playwright-a11y-snapshot.sh`, `playwright-console-errors.sh`, `playwright-userstory-smoke.sh`, `playwright-visual-snapshots.sh` |
| `.docs/planning/concepts/` | Frontend concept output scaffold |
| `.docs/design/concepts/` | Visual/creative concept output scaffold (data-vis, animation, graphic-design) |

### Proposed Tree

```
Frontend/
├── .claude/
│   ├── agents/
│   │   ├── planning-frontend-design-orchestrator/AGENT.md
│   │   ├── frontend-design-subagent/AGENT.md
│   │   ├── planning-visual-creative-orchestrator/AGENT.md
│   │   ├── visual-creative-subagent/AGENT.md
│   │   ├── playwright-testing-agent/AGENT.md
│   │   └── user-dev-docs-agent/AGENT.md
│   ├── skills/
│   │   ├── planning-frontend-design-orchestrator/  (SKILL.md + references/)
│   │   ├── frontend-design-subagent/               (SKILL.md + references/ + scripts/)
│   │   ├── planning-visual-creative-orchestrator/  (SKILL.md + references/)
│   │   ├── visual-creative-subagent/               (SKILL.md + references/ + scripts/)
│   │   ├── testing-with-playwright/SKILL.md
│   │   ├── testing-user-stories-validation/SKILL.md
│   │   └── producing-visual-docs/                  (SKILL.md + resources/templates/)
│   ├── hooks/scripts/
│   │   ├── playwright-a11y-snapshot.sh
│   │   ├── playwright-console-errors.sh
│   │   ├── playwright-userstory-smoke.sh
│   │   └── playwright-visual-snapshots.sh
│   └── system_docs/frontend_planning/              (6 docs)
├── .codex/
│   ├── agents/                                     (mirror of .claude, codex format)
│   ├── skills/                                     (mirror of .claude, codex format)
│   ├── hooks/scripts/                              (same 4 hooks)
│   └── system_docs/frontend_planning/              (same 6 docs)
└── .docs/
    ├── planning/concepts/.gitkeep
    └── design/concepts/
        ├── data-vis/.gitkeep
        ├── animation/.gitkeep
        └── graphic-design/.gitkeep
```

---

## Orchestration/

**What belongs here**: Session lifecycle management, phase orchestration, ADR system, checkpoint/rollback, and session continuity tooling.

### Agents (4)

| Agent | Why Orchestration |
|-------|------------------|
| `longrunning-agent` | Core 3 — enforces phase planning, validation gates, phase archival |
| `orchestrator-agent` | Core 3 — delegates phases to subagents, maintains the orchestration loop |
| `do-over-agent` | Checkpoint/rollback — provides recovery when orchestrated work fails |
| `chat-history-agent` | Session continuity — logs messages for long-running session auditability |

### Skills (5)

| Skill | Why Orchestration |
|-------|------------------|
| `longrunning-session` | Phase planning, validation, archival workflow |
| `orchestrator-session` | Subagent spawning, phase review, poke-back loop |
| `ingesting-agent-history` | Preserves context when chat clears/compacts during long sessions |
| `chat-history-convention` | Chat message logging into `.chat-history/` |
| `decomposing-project-tasks` | Breaks large requests into phase plans for orchestrator |

### Infrastructure

| Item | Contents |
|------|----------|
| `adr/` | Full ADR directory (current/, history/, agent_ingest/, orchestration/) |
| `orchestration/` | Phase queue (next_phase.template.json) + history/ |
| `templates/adr/` | Session scaffolding templates (phase_1.md, phase reviews, orchestration files) |
| `templates/agent-ingest/` | Agent ingest entry template |
| `hooks/scripts/` | `orchestrator-poke.ps1`, `session-start-setup.sh` |
| `commands/` | `spawn-subagent.md` |
| `.chat-history/` | Chat logging output scaffold |

### Proposed Tree

```
Orchestration/
├── .claude/
│   ├── agents/
│   │   ├── longrunning-agent/AGENT.md
│   │   ├── orchestrator-agent/AGENT.md
│   │   ├── do-over-agent/AGENT.md
│   │   └── chat-history-agent/AGENT.md
│   ├── skills/
│   │   ├── longrunning-session/           (SKILL.md + references/ + templates/)
│   │   ├── orchestrator-session/          (SKILL.md + references/ + templates/)
│   │   ├── ingesting-agent-history/       (SKILL.md + resources/)
│   │   ├── chat-history-convention/       (SKILL.md + scripts/)
│   │   └── decomposing-project-tasks/     (SKILL.md + scripts/)
│   ├── adr/                               (README, current/, history/, agent_ingest/, orchestration/)
│   ├── orchestration/                     (README, queue/, history/)
│   ├── templates/
│   │   ├── adr/                           (full template set)
│   │   └── agent-ingest/
│   ├── hooks/scripts/
│   │   ├── orchestrator-poke.ps1
│   │   └── session-start-setup.sh
│   └── commands/
│       └── spawn-subagent.md
├── .codex/
│   ├── agents/                            (mirror, codex format)
│   ├── skills/                            (mirror, codex format)
│   ├── adr/                               (mirror)
│   ├── orchestration/                     (mirror)
│   ├── templates/                         (mirror)
│   ├── hooks/scripts/                     (same 2 hooks)
│   └── commands/
│       └── spawn-subagent.md
└── .chat-history/.gitkeep
```

---

## Planning/

**What belongs here**: Research, documentation creation, and user story validation — the "thinking and documenting" layer.

### Agents (3)

| Agent | Why Planning |
|-------|-------------|
| `research-docs-agent` | Core 3 — applies ADR discipline to research and documentation work |
| `user-story-testing-agent` | Validates implementations against user story acceptance criteria |
| `research-automation-agent` | Automated web research dispatched by research-docs-agent |

### Skills (4)

| Skill | Why Planning |
|-------|-------------|
| `research-docs-session` | Source capture, citation validation, phase review for research |
| `researching-with-playwright` | Browser-based web research automation (scripts: basic-scraper, extract-docs) |
| `creating-project-documentation` | Generates READMEs, API docs, setup guides |
| `testing-user-stories-validation` | Validates against `.docs/planning/user-stories.md` |

### Infrastructure

| Item | Contents |
|------|----------|
| `hooks/scripts/` | `check-links.sh` (validates doc links), `web-research-metadata.sh` (captures research metadata) |
| `.docs/planning/` | All 11 planning docs (PRD, specs, user stories, milestones, etc.) |

### Proposed Tree

```
Planning/
├── .claude/
│   ├── agents/
│   │   ├── research-docs-agent/AGENT.md
│   │   ├── user-story-testing-agent/AGENT.md
│   │   └── research-automation-agent/AGENT.md
│   ├── skills/
│   │   ├── research-docs-session/         (SKILL.md + references/ + templates/)
│   │   ├── researching-with-playwright/   (SKILL.md + resources/ + scripts/)
│   │   ├── creating-project-documentation/ (SKILL.md + scripts/)
│   │   └── testing-user-stories-validation/SKILL.md
│   └── hooks/scripts/
│       ├── check-links.sh
│       └── web-research-metadata.sh
├── .codex/
│   ├── agents/                            (mirror, codex format)
│   ├── skills/                            (mirror, codex format)
│   └── hooks/scripts/                     (same 2 hooks)
└── .docs/planning/
    ├── README.md
    ├── prd.md
    ├── overview.md
    ├── technical-specification.md
    ├── project-structure-spec.md
    ├── user-stories.md
    ├── milestones.md
    ├── auth-and-subscriptions.md
    ├── deployment-and-hosting.md
    ├── risks-and-decisions.md
    ├── sync-strategy.md
    ├── templates/project.json.template
    └── concepts/.gitkeep
```

---

## Backend/

**What belongs here**: Git workflows, DevOps tooling, security hooks, and system sync — the "infrastructure and delivery" layer.

### Agents (2)

| Agent | Why Backend |
|-------|------------|
| `git-workflow-agent` | Git best practices, commit conventions, branching strategies |
| `savepoint-agent` | Savepoint branch creation for milestone preservation |

### Skills (3)

| Skill | Why Backend |
|-------|------------|
| `managing-git-workflows` | Commit conventions, branching strategies, PR workflows |
| `savepoint-branching` | Branch naming, creation, return to working branch |
| `maintaining-trinary-sync` | Keeps `.claude/` and `.codex/` mirrors in sync (critical infrastructure) |

### Infrastructure

| Item | Contents |
|------|----------|
| `hooks/scripts/` | `block-sensitive-files.sh`, `scan-secrets.sh`, `pre-bash-validator.sh`, `git-context-report.sh`, `large-file-guard.sh`, `post-format-code.sh` |
| `commands/` | `commit-and-push.md`, `deploy-preview.md`, `run-full-tests.md`, `sync-dependencies.md` |
| `rules/` | Command allowlist rules |

### Proposed Tree

```
Backend/
├── .claude/
│   ├── agents/
│   │   ├── git-workflow-agent/AGENT.md
│   │   └── savepoint-agent/AGENT.md
│   ├── skills/
│   │   ├── managing-git-workflows/SKILL.md
│   │   ├── savepoint-branching/SKILL.md
│   │   └── maintaining-trinary-sync/      (SKILL.md + resources/ + scripts/)
│   ├── hooks/scripts/
│   │   ├── block-sensitive-files.sh
│   │   ├── scan-secrets.sh
│   │   ├── pre-bash-validator.sh
│   │   ├── git-context-report.sh
│   │   ├── large-file-guard.sh
│   │   └── post-format-code.sh
│   ├── commands/
│   │   ├── commit-and-push.md
│   │   ├── deploy-preview.md
│   │   ├── run-full-tests.md
│   │   └── sync-dependencies.md
│   └── rules/README.md
├── .codex/
│   ├── agents/                            (mirror, codex format)
│   ├── skills/                            (mirror, codex format)
│   ├── hooks/scripts/                     (same 6 hooks)
│   ├── commands/                          (same 4 commands)
│   └── rules/README.md
└── .appdocs/.gitkeep
```

---

## Database/

**What belongs here**: Data-layer agents and skills. Currently **none** exist in our template set — all database-specific agents (convex, postgresql, schema design) were excluded during the initial copy because they're project-specific implementations.

### Proposed Tree

```
Database/
└── .gitkeep                               # Placeholder — no agents/skills in this category yet
```

**Note**: When database-specific agents are added to the template repo in the future (e.g., convex-database-agent, postgresql-agent, designing-convex-schemas skill), they would go here.

---

## Meta Skills — Where Do They Go?

Three "meta" skills don't fit neatly into one category because they're used across all systems:

| Meta Skill | Proposed Location | Rationale |
|------------|------------------|-----------|
| `creating-claude-agents` | **Orchestration/** | Agent creation is part of the orchestration workflow (spawning new agents) |
| `creating-claude-skills` | **Orchestration/** | Skill creation follows the same meta pattern |
| `using-claude-hooks` | **Backend/** | Hooks are infrastructure/DevOps tooling |

This adds 2 more skills to Orchestration (total: 7) and 1 more to Backend (total: 4).

### Updated Counts

```
Frontend/          6 agents, 7 skills
Orchestration/     4 agents, 7 skills    (+2 meta skills)
Planning/          3 agents, 4 skills
Backend/           2 agents, 4 skills    (+1 meta skill)
Database/          0 agents, 0 skills    (placeholder)
                   ─────────────────
Total:            15 agents, 22 skills   (1 skill appears in 2 categories: testing-user-stories-validation)
```

---

## Cross-Category Overlap

One skill appears in two categories:

| Skill | Categories | Reason |
|-------|-----------|--------|
| `testing-user-stories-validation` | Frontend + Planning | Validates frontend concepts against planning docs (user stories) — bridges both domains |

This is intentional — it serves both categories. It will be copied into both folder trees.

---

## What's NOT Being Copied Into Categories

These items exist only in `All/` and are **not duplicated** into category folders:

| Item | Reason |
|------|--------|
| `CLAUDE.md` (root) | Project-level config, applies to everything |
| `settings.json` (root .claude/) | Global hooks config, not category-specific |
| `CODEX.md`, `AGENTS.md`, `config.toml`, `requirements.toml` | Codex root config |
| `system_docs/` | Already in Frontend/ (only relevant to frontend) |

---

## Execution Plan

1. For each of the 5 folders, copy the relevant agents/skills/infrastructure from `All/` into `.claude/` and `.codex/` subdirectories
2. Maintain the same file structure conventions (`.claude/` uses folder/AGENT.md, `.codex/` keeps its original format)
3. `Database/` gets just a `.gitkeep` placeholder
4. Commit all changes on `main`
5. No new savepoint branch needed (this is just categorization, not a generation milestone)
