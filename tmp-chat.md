# Copy Proposal: IDEA-MANAGEMENT -> Template Repo

**Target**: `C:\Template\Claude+Codex Agent+Skill Sync\All\`
**Source**: `C:\Ideas\IDEA-MANAGEMENT\`

---

## Proposed File Tree

```
All/
├── CLAUDE.md                                          # Root project instructions
│
├── .claude/
│   ├── settings.json                                  # Hooks config (rm-rf blocker, sensitive file blocker)
│   ├── commands/                                      # (mirrored from .codex, adapted for Claude Code CLI)
│   │   ├── README.md
│   │   ├── commit-and-push.md
│   │   ├── deploy-preview.md
│   │   ├── run-full-tests.md
│   │   ├── spawn-subagent.md
│   │   └── sync-dependencies.md
│   ├── hooks/                                         # (mirrored from .codex, adapted for Claude Code CLI)
│   │   ├── README.md
│   │   ├── settings.json
│   │   └── scripts/
│   │       ├── README.md
│   │       ├── block-sensitive-files.sh
│   │       ├── check-links.sh
│   │       ├── git-context-report.sh
│   │       ├── large-file-guard.sh
│   │       ├── orchestrator-poke.ps1
│   │       ├── playwright-a11y-snapshot.sh
│   │       ├── playwright-console-errors.sh
│   │       ├── playwright-userstory-smoke.sh
│   │       ├── playwright-visual-snapshots.sh
│   │       ├── post-format-code.sh
│   │       ├── pre-bash-validator.sh
│   │       ├── scan-secrets.sh
│   │       ├── session-start-setup.sh
│   │       └── web-research-metadata.sh
│   ├── orchestration/                                 # (mirrored from .codex)
│   │   ├── README.md
│   │   ├── history/
│   │   └── queue/
│   │       └── next_phase.template.json
│   ├── rules/                                         # (mirrored from .codex)
│   │   └── README.md
│   ├── templates/                                     # (mirrored from .codex)
│   │   ├── adr/
│   │   │   ├── README
│   │   │   ├── current/
│   │   │   │   └── SESSION_NAME/
│   │   │   │       └── phase_1.md
│   │   │   ├── history/
│   │   │   └── orchestration/
│   │   └── agent-ingest/
│   ├── system_docs/
│   │   └── frontend_planning/
│   │       ├── README.md
│   │       ├── architecture.md
│   │       ├── configuration-reference.md
│   │       ├── generation-workflow.md
│   │       ├── style-families.md
│   │       └── validation-system.md
│   ├── agents/
│   │   │
│   │   │  # ── CORE 1: Frontend Planning System ──
│   │   ├── planning-frontend-design-orchestrator/
│   │   │   └── AGENT.md                               # [CORE 1] Frontend orchestrator
│   │   ├── frontend-design-subagent/
│   │   │   └── AGENT.md                               # [CORE 1] Frontend subagent
│   │   │
│   │   │  # ── CORE 2: Visual/Creative Design System ──
│   │   ├── planning-visual-creative-orchestrator/
│   │   │   └── AGENT.md                               # [CORE 2] Visual/creative orchestrator
│   │   ├── visual-creative-subagent/
│   │   │   └── AGENT.md                               # [CORE 2] Visual/creative subagent
│   │   │
│   │   │  # ── CORE 3: Long-Running + ADR Orchestration ──
│   │   ├── longrunning-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex for Claude Code
│   │   ├── orchestrator-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex for Claude Code
│   │   ├── research-docs-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex for Claude Code
│   │   │
│   │   │  # ── CORE 4: Complementary Agents ──
│   │   ├── user-dev-docs-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex standalone .md
│   │   ├── user-story-testing-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex standalone .md
│   │   ├── savepoint-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex standalone .md
│   │   ├── chat-history-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex for Claude Code
│   │   ├── do-over-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex for Claude Code
│   │   │
│   │   │  # ── CORE 4: Complementary Subagents ──
│   │   ├── git-workflow-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex subagent
│   │   ├── playwright-testing-agent/
│   │   │   └── AGENT.md                               # Adapted from .codex subagent
│   │   └── research-automation-agent/
│   │       └── AGENT.md                               # Adapted from .codex subagent
│   │
│   └── skills/
│       │
│       │  # ── CORE 1: Frontend Planning System ──
│       ├── planning-frontend-design-orchestrator/
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── agent-behavior.md
│       │       ├── layout-uniqueness-catalog.json
│       │       └── style-config.json
│       ├── frontend-design-subagent/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   ├── agent-behavior.md
│       │   │   ├── available-libraries.json
│       │   │   ├── asset-sources.json
│       │   │   ├── external-inspiration-catalog.json
│       │   │   ├── inspiration-notes.md
│       │   │   └── product-context.md
│       │   └── scripts/
│       │       ├── validate-concepts-playwright.mjs    # Playwright screenshot capture
│       │       └── validate-design-uniqueness.mjs      # Pairwise uniqueness check
│       │
│       │  # ── CORE 2: Visual/Creative Design System ──
│       ├── planning-visual-creative-orchestrator/
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── agent-behavior.md
│       │       └── style-config.json
│       ├── visual-creative-subagent/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   ├── agent-behavior.md
│       │   │   └── library-catalog.json
│       │   └── scripts/
│       │       └── validate-visuals-playwright.mjs     # Visual showcase screenshot capture
│       │
│       │  # ── CORE 3: Long-Running + ADR Orchestration ──
│       ├── longrunning-session/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── orchestrator-session/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── research-docs-session/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── ingesting-agent-history/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       │
│       │  # ── CORE 4: Complementary Skills ──
│       ├── testing-with-playwright/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── testing-user-stories-validation/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── researching-with-playwright/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       ├── basic-scraper.js
│       │       └── extract-documentation.js
│       ├── managing-git-workflows/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── savepoint-branching/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── chat-history-convention/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       └── append-user-message.ps1
│       ├── producing-visual-docs/
│       │   └── SKILL.md                               # Adapted from .codex for Claude Code
│       ├── creating-project-documentation/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       ├── create-api-docs.js
│       │       ├── generate-readme.js
│       │       └── scaffold-docs.js
│       ├── maintaining-trinary-sync/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       ├── check-sync.js
│       │       ├── sync-all.js
│       │       └── sync-skill.js
│       ├── decomposing-project-tasks/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       └── analyze-requirements.js
│       │
│       │  # ── Meta Skills (Agent/Skill creation) ──
│       ├── creating-claude-agents/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       └── validate-agent.js
│       ├── creating-claude-skills/
│       │   ├── SKILL.md                               # Adapted from .codex for Claude Code
│       │   └── scripts/
│       │       └── validate-skill.js
│       └── using-claude-hooks/
│           └── SKILL.md                               # Adapted from .codex for Claude Code
│
├── .codex/
│   ├── CODEX.md                                       # Main Codex instructions
│   ├── AGENTS.md                                      # Agent setup guide
│   ├── README.md                                      # Codex overview
│   ├── config.toml                                    # Codex settings
│   ├── requirements.toml                              # Codex constraints
│   ├── adr/
│   │   ├── README.md
│   │   ├── agent_ingest/
│   │   │   └── .gitkeep
│   │   ├── current/
│   │   │   └── .gitkeep
│   │   ├── history/
│   │   └── orchestration/
│   ├── commands/
│   │   ├── README.md
│   │   ├── commit-and-push.md
│   │   ├── deploy-preview.md
│   │   ├── run-full-tests.md
│   │   ├── spawn-subagent.md
│   │   └── sync-dependencies.md
│   ├── hooks/
│   │   ├── README.md
│   │   ├── settings.json
│   │   └── scripts/
│   │       ├── README.md
│   │       ├── block-sensitive-files.sh
│   │       ├── check-links.sh
│   │       ├── git-context-report.sh
│   │       ├── large-file-guard.sh
│   │       ├── orchestrator-poke.ps1
│   │       ├── playwright-a11y-snapshot.sh
│   │       ├── playwright-console-errors.sh
│   │       ├── playwright-userstory-smoke.sh
│   │       ├── playwright-visual-snapshots.sh
│   │       ├── post-format-code.sh
│   │       ├── pre-bash-validator.sh
│   │       ├── scan-secrets.sh
│   │       ├── session-start-setup.sh
│   │       └── web-research-metadata.sh
│   ├── orchestration/
│   │   ├── README.md
│   │   ├── history/
│   │   └── queue/
│   │       └── next_phase.template.json
│   ├── rules/
│   │   └── README.md
│   ├── templates/
│   │   ├── adr/
│   │   │   ├── README
│   │   │   ├── current/
│   │   │   │   └── SESSION_NAME/
│   │   │   │       └── phase_1.md
│   │   │   ├── history/
│   │   │   └── orchestration/
│   │   └── agent-ingest/
│   ├── system_docs/
│   │   └── frontend_planning/
│   │       ├── README.md
│   │       ├── architecture.md
│   │       ├── configuration-reference.md
│   │       ├── generation-workflow.md
│   │       ├── style-families.md
│   │       └── validation-system.md
│   ├── agents/
│   │   │
│   │   │  # ── CORE 1: Frontend Planning System ──
│   │   ├── planning-frontend-design-orchestrator/
│   │   │   └── AGENT.md
│   │   ├── planning-frontend-design-orchestrator.md   # Codex wrapper pointer
│   │   ├── frontend-design-subagent/
│   │   │   └── AGENT.md
│   │   │
│   │   │  # ── CORE 2: Visual/Creative Design System ──
│   │   ├── planning-visual-creative-orchestrator/
│   │   │   └── AGENT.md
│   │   ├── planning-visual-creative-orchestrator.md   # Codex wrapper pointer
│   │   ├── visual-creative-subagent/
│   │   │   └── AGENT.md
│   │   ├── visual-creative-subagent.md                # Codex wrapper pointer
│   │   │
│   │   │  # ── CORE 3: Long-Running + ADR Orchestration ──
│   │   ├── longrunning-agent/
│   │   │   └── AGENT.md
│   │   ├── orchestrator-agent/
│   │   │   └── AGENT.md
│   │   ├── research-docs-agent/
│   │   │   └── AGENT.md
│   │   │
│   │   │  # ── CORE 4: Complementary Agents ──
│   │   ├── user-dev-docs-agent.md                     # User + developer visual docs
│   │   ├── user-story-testing-agent.md                # User story validation
│   │   ├── savepoint-agent.md                         # Savepoint branch creation
│   │   ├── chat-history-agent/
│   │   │   └── AGENT.md                               # Chat history logging
│   │   ├── do-over-agent/
│   │   │   └── AGENT.md                               # Checkpoint/rollback
│   │   │
│   │   │  # ── CORE 4: Complementary Subagents ──
│   │   └── subagents/
│   │       ├── git-workflow-agent/
│   │       │   └── AGENT.md                           # Git best practices
│   │       ├── playwright-testing-agent/
│   │       │   └── AGENT.md                           # Playwright E2E testing
│   │       └── research-automation-agent/
│   │           └── AGENT.md                           # Automated research
│   │
│   └── skills/
│       │
│       │  # ── CORE 1: Frontend Planning System ──
│       ├── planning-frontend-design-orchestrator/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   ├── agent-behavior.md
│       │   │   ├── layout-uniqueness-catalog.json
│       │   │   └── style-config.json
│       │   └── scripts/
│       │       ├── build-pass-jobs.ps1
│       │       └── run-local-orchestration.ps1
│       ├── frontend-design-subagent/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   ├── agent-behavior.md
│       │   │   ├── available-libraries.json
│       │   │   ├── asset-sources.json
│       │   │   ├── external-inspiration-catalog.json
│       │   │   ├── inspiration-notes.md
│       │   │   └── product-context.md
│       │   └── scripts/
│       │       ├── generate-concept.ps1
│       │       ├── validate-concepts-playwright.mjs
│       │       └── validate-design-uniqueness.mjs
│       │
│       │  # ── CORE 2: Visual/Creative Design System ──
│       ├── planning-visual-creative-orchestrator/
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── agent-behavior.md
│       │       └── style-config.json
│       ├── visual-creative-subagent/
│       │   ├── SKILL.md
│       │   ├── references/
│       │   │   ├── agent-behavior.md
│       │   │   └── library-catalog.json
│       │   └── scripts/
│       │       └── validate-visuals-playwright.mjs
│       │
│       │  # ── CORE 3: Long-Running + ADR Orchestration ──
│       ├── longrunning-session/
│       │   └── SKILL.md
│       ├── orchestrator-session/
│       │   └── SKILL.md
│       ├── research-docs-session/
│       │   └── SKILL.md
│       ├── ingesting-agent-history/
│       │   └── SKILL.md
│       │
│       │  # ── CORE 4: Complementary Skills ──
│       ├── testing-with-playwright/
│       │   └── SKILL.md
│       ├── testing-user-stories-validation/
│       │   └── SKILL.md
│       ├── researching-with-playwright/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       ├── basic-scraper.js
│       │       └── extract-documentation.js
│       ├── managing-git-workflows/
│       │   └── SKILL.md
│       ├── savepoint-branching/
│       │   └── SKILL.md
│       ├── chat-history-convention/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── append-user-message.ps1
│       ├── producing-visual-docs/
│       │   └── SKILL.md
│       ├── creating-project-documentation/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       ├── create-api-docs.js
│       │       ├── generate-readme.js
│       │       └── scaffold-docs.js
│       ├── maintaining-trinary-sync/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       ├── check-sync.js
│       │       ├── sync-all.js
│       │       └── sync-skill.js
│       ├── decomposing-project-tasks/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── analyze-requirements.js
│       │
│       │  # ── Meta Skills (Agent/Skill creation) ──
│       ├── creating-claude-agents/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── validate-agent.js
│       ├── creating-claude-skills/
│       │   ├── SKILL.md
│       │   └── scripts/
│       │       └── validate-skill.js
│       └── using-claude-hooks/
│           └── SKILL.md
│
├── .docs/
│   ├── planning/
│   │   ├── README.md
│   │   ├── prd.md
│   │   ├── overview.md
│   │   ├── technical-specification.md
│   │   ├── project-structure-spec.md
│   │   ├── user-stories.md
│   │   ├── milestones.md
│   │   ├── auth-and-subscriptions.md
│   │   ├── deployment-and-hosting.md
│   │   ├── risks-and-decisions.md
│   │   ├── sync-strategy.md
│   │   ├── templates/
│   │   └── concepts/                                  # Frontend concept output root
│   │       └── (empty - populated by generation)
│   └── design/
│       └── concepts/                                  # Visual/creative concept output root
│           ├── data-vis/
│           ├── animation/
│           └── graphic-design/
│
├── .appdocs/                                          # (empty scaffold for visual docs output)
└── .chat-history/                                     # (empty scaffold for chat logging)
```

**Total: ~200 files across 4 agent systems + complementary tooling**
**Both `.claude/` and `.codex/` are now 1:1 peers with full infrastructure parity**

---

## System 1: Frontend Planning System

### What it does
Orchestrates multi-style frontend concept generation. The orchestrator reads a style config with 5 style families (brutalist, mid-century-modern, retro-50s, liquid, slate), then dispatches parallel Claude Code Task agents that each generate a complete 10-view navigable HTML/CSS/JS app from scratch. After generation, Playwright captures desktop + mobile screenshots for every view, and a uniqueness validator ensures no two passes are structurally similar.

### Files

| Location | File | Role |
|----------|------|------|
| `.claude/agents/planning-frontend-design-orchestrator/AGENT.md` | Orchestrator agent definition | Dispatches (style, pass) jobs |
| `.claude/agents/frontend-design-subagent/AGENT.md` | Subagent agent definition | Generates one concept pass |
| `.claude/skills/planning-frontend-design-orchestrator/SKILL.md` | Orchestrator skill workflow | Detailed generation + validation steps |
| `.claude/skills/planning-frontend-design-orchestrator/references/style-config.json` | Style configuration | All 5 style families with per-pass variants |
| `.claude/skills/planning-frontend-design-orchestrator/references/layout-uniqueness-catalog.json` | Layout profiles | 20 structural layout variations |
| `.claude/skills/planning-frontend-design-orchestrator/references/agent-behavior.md` | Behavior spec | Synced copy of AGENT.md for skill access |
| `.claude/skills/frontend-design-subagent/SKILL.md` | Subagent skill workflow | Inputs, hard requirements, quality standards |
| `.claude/skills/frontend-design-subagent/references/product-context.md` | Product data models | What content says (terminology, view content) |
| `.claude/skills/frontend-design-subagent/references/available-libraries.json` | CDN library catalog | GSAP, AOS, Three.js, etc. |
| `.claude/skills/frontend-design-subagent/references/asset-sources.json` | Approved media sources | unDraw, Heroicons, Unsplash, etc. |
| `.claude/skills/frontend-design-subagent/references/external-inspiration-catalog.json` | Per-pass inspiration | Specific website references per style/pass |
| `.claude/skills/frontend-design-subagent/references/inspiration-notes.md` | Design principles | Background image policy, animation policy |
| `.claude/skills/frontend-design-subagent/references/agent-behavior.md` | Behavior spec | Synced copy for skill access |
| `.claude/skills/frontend-design-subagent/scripts/validate-concepts-playwright.mjs` | Playwright validator | Captures 10 desktop + 10 mobile screenshots per pass |
| `.claude/skills/frontend-design-subagent/scripts/validate-design-uniqueness.mjs` | Uniqueness validator | Pairwise HTML/CSS Jaccard similarity check |

### Output reads/writes
- **Writes to**: `.docs/planning/concepts/<style>/pass-<n>/`
- **Reads from**: `.claude/skills/*/references/` (configs, catalogs)

### Codex mirror
All of the above exist in `.codex/` with identical content plus:
- `.codex/skills/planning-frontend-design-orchestrator/scripts/build-pass-jobs.ps1` (legacy PowerShell)
- `.codex/skills/planning-frontend-design-orchestrator/scripts/run-local-orchestration.ps1` (legacy PowerShell)
- `.codex/skills/frontend-design-subagent/scripts/generate-concept.ps1` (legacy template stamper)

---

## System 2: Visual/Creative Design System

### What it does
Orchestrates concept generation across three creative domains: **data visualization** (D3.js, Chart.js, ECharts), **animation** (GSAP, p5.js, Anime.js), and **graphic design** (Three.js, p5.js, Paper.js). Each pass produces a single self-contained HTML showcase page with the chosen library. Playwright validates with desktop + mobile screenshots.

### Files

| Location | File | Role |
|----------|------|------|
| `.claude/agents/planning-visual-creative-orchestrator/AGENT.md` | Orchestrator agent definition | Dispatches (domain, style, pass) jobs |
| `.claude/agents/visual-creative-subagent/AGENT.md` | Subagent agent definition | Generates one visual showcase |
| `.claude/skills/planning-visual-creative-orchestrator/SKILL.md` | Orchestrator skill workflow | Domain routing, mock data, validation |
| `.claude/skills/planning-visual-creative-orchestrator/references/style-config.json` | Domain/style config | 3 domains, 7 styles, mock datasets |
| `.claude/skills/planning-visual-creative-orchestrator/references/agent-behavior.md` | Behavior spec | Synced copy for skill access |
| `.claude/skills/visual-creative-subagent/SKILL.md` | Subagent skill workflow | Domain-specific guidelines |
| `.claude/skills/visual-creative-subagent/references/library-catalog.json` | CDN library catalog | 20+ libraries with versions, CDN URLs |
| `.claude/skills/visual-creative-subagent/references/agent-behavior.md` | Behavior spec | Synced copy for skill access |
| `.claude/skills/visual-creative-subagent/scripts/validate-visuals-playwright.mjs` | Playwright validator | Captures showcase desktop + mobile screenshots |

### Output reads/writes
- **Writes to**: `.docs/design/concepts/<domain>/<style>/pass-<n>/`
- **Reads from**: `.claude/skills/*/references/` (configs, library catalog)

### Codex mirror
All of the above exist in `.codex/` with identical content.

---

## System 3: Long-Running + ADR Orchestration

### What it does
Manages multi-phase development sessions with Architecture Decision Records (ADRs). The **longrunning-agent** enforces phase planning -- every session must have a phase plan before work begins, validations before moving on, and a phase review archived to history. The **orchestrator-agent** delegates each phase to a separate subagent, creating a loop where completed work is reviewed and the next phase is spawned. The **research-docs-agent** applies the same ADR discipline to research and documentation work.

### Files

| Location | File | Role |
|----------|------|------|
| `.codex/agents/longrunning-agent/AGENT.md` | Long-running agent | Session management, phase planning, validation gates |
| `.codex/agents/orchestrator-agent/AGENT.md` | Orchestrator agent | Spawns subagents per phase, maintains loop |
| `.codex/agents/research-docs-agent/AGENT.md` | Research docs agent | ADR orchestration for research sessions |
| `.codex/skills/longrunning-session/SKILL.md` | Long-running skill | Phase planning, validation, archival workflow |
| `.codex/skills/orchestrator-session/SKILL.md` | Orchestrator skill | Subagent spawning, phase review, poke-back loop |
| `.codex/skills/research-docs-session/SKILL.md` | Research docs skill | Source capture, citation validation, phase review |
| `.codex/skills/ingesting-agent-history/SKILL.md` | Agent history ingest | Preserves session context on clear/compact |

### Supporting infrastructure
- `.codex/adr/` -- ADR directory structure (current/, history/, agent_ingest/, orchestration/)
- `.codex/orchestration/` -- Phase queue and history (queue/next_phase.template.json)
- `.codex/templates/adr/` -- Templates for new ADR sessions (phase_1.md template)
- `.codex/hooks/scripts/orchestrator-poke.ps1` -- Triggers next phase in orchestration loop

### Output reads/writes
- **Writes to**: `.codex/adr/current/<session>/`, `.codex/adr/history/`, `.codex/adr/agent_ingest/`
- **Reads from**: `.codex/orchestration/queue/`, `.codex/adr/current/`

---

## System 4: Complementary Agents + Skills

### Why these are included

Each agent/skill below is required because it directly supports or is invoked by one of the 3 core systems above.

---

### 4a. Playwright Testing + Visual Validation

**Why required**: Both core systems (frontend + visual/creative) depend on Playwright for screenshot capture. The testing-with-playwright skill provides the E2E testing framework. The user-story-testing agent validates that generated concepts meet user story acceptance criteria. The researching-with-playwright skill enables Playwright-based web research (used by research-docs-agent).

| Location | File | Supports |
|----------|------|----------|
| `.codex/agents/subagents/playwright-testing-agent/AGENT.md` | Playwright E2E specialist | Core 1 + Core 2 validation |
| `.codex/agents/user-story-testing-agent.md` | User story validation agent | Core 1 (validates concept meets user stories) |
| `.codex/skills/testing-with-playwright/SKILL.md` | Playwright E2E skill | Foundation for all Playwright scripts |
| `.codex/skills/testing-user-stories-validation/SKILL.md` | User story testing workflow | Validates concepts against `.docs/planning/user-stories.md` |
| `.codex/skills/researching-with-playwright/SKILL.md` + `scripts/` | Web research automation | Core 3 (research-docs-agent uses browser automation) |

---

### 4b. Git Workflow + Savepoints

**Why required**: The orchestrator system creates savepoint branches after generation runs. The git-workflow-agent enforces commit conventions. The savepoint-agent/skill handles branch creation. The do-over-agent provides checkpoint/rollback when generation fails.

| Location | File | Supports |
|----------|------|----------|
| `.codex/agents/subagents/git-workflow-agent/AGENT.md` | Git best practices agent | All systems (commit after generation) |
| `.codex/agents/savepoint-agent.md` | Savepoint branch creator | All systems (milestone branches) |
| `.codex/agents/do-over-agent/AGENT.md` | Checkpoint/rollback agent | All systems (recovery from failed generations) |
| `.codex/skills/managing-git-workflows/SKILL.md` | Git workflow skill | Commit conventions, branching strategies |
| `.codex/skills/savepoint-branching/SKILL.md` | Savepoint skill | Branch naming, creation, return to working branch |

---

### 4c. User + Developer Documentation

**Why required**: The user-dev-docs-agent produces visual documentation from generated concepts using Playwright capture. The producing-visual-docs skill creates the doc artifacts that go into `.appdocs/`. The creating-project-documentation skill generates README files and API docs for the generated concepts.

| Location | File | Supports |
|----------|------|----------|
| `.codex/agents/user-dev-docs-agent.md` | Visual docs agent | Core 1 + Core 2 (documents generated concepts) |
| `.codex/skills/producing-visual-docs/SKILL.md` | Visual docs skill | Playwright capture for documentation |
| `.codex/skills/creating-project-documentation/SKILL.md` + `scripts/` | Project docs skill | README, API docs, setup guides |

---

### 4d. Session Continuity + Chat History

**Why required**: Long-running generation sessions (Core 3) need session continuity. The chat-history-agent logs messages for auditability. The ingesting-agent-history skill preserves context when chat clears/compacts (happens during long orchestration runs).

| Location | File | Supports |
|----------|------|----------|
| `.codex/agents/chat-history-agent/AGENT.md` | Chat history logger | Core 3 (session auditability) |
| `.codex/skills/chat-history-convention/SKILL.md` + `scripts/` | Chat logging skill | Appends user messages to `.chat-history/` |
| `.codex/skills/ingesting-agent-history/SKILL.md` | History ingest skill | Core 3 (preserves context on clear/compact) |

---

### 4e. Task Decomposition + Research Automation

**Why required**: The orchestrator system needs to decompose large generation requests into phase plans. The research-automation-agent powers web research tasks dispatched by the research-docs-agent.

| Location | File | Supports |
|----------|------|----------|
| `.codex/agents/subagents/research-automation-agent/AGENT.md` | Research automation | Core 3 (research-docs-agent dispatches this) |
| `.codex/skills/decomposing-project-tasks/SKILL.md` + `scripts/` | Task decomposition | Core 3 (breaks features into phase plans) |

---

### 4f. Meta Skills (Agent/Skill Creation + Sync)

**Why required**: These meta-skills define how to create new agents and skills within the system. The maintaining-trinary-sync skill keeps `.claude/` and `.codex/` mirrors in sync (critical for the dual-system architecture). The using-claude-hooks skill documents the hooks system used by `.claude/settings.json` and `.codex/hooks/`.

| Location | File | Supports |
|----------|------|----------|
| `.codex/skills/creating-claude-agents/SKILL.md` + `scripts/` | Agent creation guide | All systems (creating new agents) |
| `.codex/skills/creating-claude-skills/SKILL.md` + `scripts/` | Skill creation guide | All systems (creating new skills) |
| `.codex/skills/maintaining-trinary-sync/SKILL.md` + `scripts/` | .claude/.codex sync | All systems (dual-system architecture) |
| `.codex/skills/using-claude-hooks/SKILL.md` | Hooks documentation | All systems (lifecycle hooks) |

---

## Non-Agent/Skill Infrastructure

These directories provide the scaffolding that the 4 core systems rely on.

### `.claude/` infrastructure directories (now 1:1 with `.codex/`)

> **Parity note**: In the source repo, `.claude/` had empty scaffolds for commands, hooks, orchestration, rules, and templates, and only 4 agents + 4 skills (the two concept generation systems). In this template, `.claude/` is upgraded to full parity with `.codex/` — same hook scripts, same commands, same orchestration infrastructure, same templates, and all 15 agents + 19 skills. Files are adapted where needed (e.g., `.codex/` path references become `.claude/`, Codex YAML frontmatter adjusted for Claude Code conventions), but the content and capabilities are mirrored.

| Directory | Purpose | Used by |
|-----------|---------|---------|
| `settings.json` | Hook definitions (rm-rf blocker, sensitive file blocker) | All agents run through these hooks |
| `commands/` | 5 reusable commands + README (mirrored from .codex) | Core 3 (spawn-subagent, commit-and-push, etc.) |
| `hooks/scripts/` | 15 hook scripts + settings.json (mirrored from .codex) | All systems (validation, security, session) |
| `orchestration/` | Phase queue + history + README (mirrored from .codex) | Core 3 (orchestrator loop) |
| `rules/` | Command allowlist rules (mirrored from .codex) | All systems |
| `templates/adr/` | ADR session templates (mirrored from .codex) | Core 3 (new session scaffolding) |
| `templates/agent-ingest/` | Agent ingest templates (mirrored from .codex) | Core 3 (history preservation) |
| `system_docs/frontend_planning/` | 6 architectural docs | Core 1 (system documentation) |

### `.codex/` infrastructure directories
| Directory | Purpose | Used by |
|-----------|---------|---------|
| `CODEX.md`, `AGENTS.md`, `README.md` | Codex configuration docs | All codex agents |
| `config.toml`, `requirements.toml` | Codex settings/constraints | Codex runtime |
| `adr/` | ADR directory (current, history, agent_ingest) | Core 3 (longrunning + orchestration) |
| `commands/` | 5 reusable commands + README | Core 3 (spawn-subagent, commit-and-push, etc.) |
| `hooks/scripts/` | 15 hook scripts + settings.json | All systems (validation, security, session) |
| `orchestration/` | Phase queue + history + README | Core 3 (orchestrator loop) |
| `rules/` | Command allowlist rules | All systems |
| `templates/adr/` | ADR session templates | Core 3 (new session scaffolding) |
| `templates/agent-ingest/` | Agent ingest templates | Core 3 (history preservation) |
| `system_docs/frontend_planning/` | 6 architectural docs | Core 1 (system documentation) |

### `.docs/` output directories
| Directory | Purpose | Used by |
|-----------|---------|---------|
| `planning/` | PRD, specs, user stories, milestones | Core 1 + Core 3 (planning documents) |
| `planning/concepts/` | Frontend concept output root | Core 1 writes here |
| `design/concepts/` | Visual/creative concept output root | Core 2 writes here |
| `design/concepts/data-vis/` | Data visualization concepts | Core 2 |
| `design/concepts/animation/` | Animation concepts | Core 2 |
| `design/concepts/graphic-design/` | Graphic design concepts | Core 2 |

### Other scaffold directories
| Directory | Purpose | Used by |
|-----------|---------|---------|
| `.appdocs/` | Visual documentation output | System 4c (user-dev-docs-agent) |
| `.chat-history/` | Chat message logging | System 4d (chat-history-agent) |

---

## Adaptation Notes: .claude/ vs .codex/ Parity

When copying agents/skills that only exist in `.codex/` into `.claude/`, these adaptations will be made:

| Aspect | `.codex/` (Codex CLI) | `.claude/` (Claude Code CLI) |
|--------|----------------------|------------------------------|
| **Agent format** | Standalone `.md` files with YAML frontmatter OR folder with `AGENT.md` | Always folder with `AGENT.md` (Claude Code convention) |
| **Path references** | `.codex/skills/...`, `.codex/adr/...` | `.claude/skills/...`, `.claude/adr/...` (adapted) |
| **Subagent location** | `.codex/agents/subagents/<name>/` | `.claude/agents/<name>/` (flat — no subagents subfolder in Claude Code) |
| **Wrapper .md files** | `.codex/agents/<name>.md` (pointer to AGENT.md) | Not needed — Claude Code reads AGENT.md directly |
| **YAML frontmatter** | `model: claude-sonnet-4-5`, `permissionMode: auto`, `tools: [...]` | Same fields but tuned for Claude Code's permission model |
| **Hook scripts** | Referenced from `.codex/hooks/settings.json` | Referenced from `.claude/settings.json` (already has hook structure) |
| **Orchestration** | `.codex/orchestration/queue/` | `.claude/orchestration/queue/` (mirrored) |
| **ADR system** | `.codex/adr/current/`, `.codex/adr/history/` | `.claude/adr/current/`, `.claude/adr/history/` (new, mirrored) |
| **Templates** | `.codex/templates/adr/` | `.claude/templates/adr/` (mirrored) |
| **Commands** | `.codex/commands/*.md` | `.claude/commands/*.md` (mirrored, paths adapted) |

**Key principle**: Content and logic are identical; only path prefixes and CLI-specific conventions differ. This means either CLI (Claude Code or Codex) can operate on its respective folder with the same capabilities.

---

## What is NOT being copied (and why)

These agents/skills exist in the source repo but are **excluded** because they are project-specific technology implementations not related to the 4 core systems:

| Category | Agents/Skills Excluded | Reason |
|----------|----------------------|--------|
| **Framework-specific** | nextjs-app-router, building-nextjs-routes | Next.js-specific, not concept generation |
| **UI library** | shadcn-ui, radix-ui-primitives, tailwind-css | Component library specifics |
| **Backend** | convex-database, designing-convex-schemas, writing-convex-queries | Convex-specific |
| **Auth/Payments** | clerk-auth, stripe-payment | Integration-specific |
| **State/Forms** | state-management, react-hook-form, zod-validation | React-specific patterns |
| **External tools** | blender, godot, photoshop, premiere, after-effects, figma, vscode, huggingface, docker, excalidraw | Creative tool automation (not concept generation) |
| **Performance/SEO** | performance-optimization, seo-metadata, analytics | App optimization specifics |
| **Accessibility** | accessibility-agent, ensuring-accessibility | WCAG compliance details |
| **Error handling** | error-handling, debugging-production-issues, handling-application-errors | App runtime specifics |
| **Academic** | study-summaries, visual-notes, complex-concepts, academic-content, study-sessions, academic-reports | Academic workflow (unrelated) |
| **App planning** | designing-app-architecture, exploring-app-ideas, gathering-requirements, gathering-documentation, frontend-planning-html, web-design-guidelines | Generic planning (not orchestration) |
| **Data integration** | postgresql, designing-rest-apis, implementing-real-time-features | Database/API specifics |
| **TypeScript** | typescript-agent, managing-typescript-types | Language specifics |
| **MCP** | configuring-mcp-servers | MCP server config |

These can be added later to categorized folders (Backend/, Frontend/, Database/, etc.) in the template repo as needed, but they don't belong in the "All" collection of proven, working core systems.
