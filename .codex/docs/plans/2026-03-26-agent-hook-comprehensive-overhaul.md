# Agent-Hook Comprehensive Review + Proposed Changes (v2)

## Part 1: Recap — What We Have

### Chain System
- **`chain-agent`** — subagent spawned per phase (does the work)
- **`orchestrator-chain-agent`** — persistent orchestrator with validation (spawned with `--orchestrated`)
- `--default` mode uses Stop hook to chain; `--orchestrated` mode uses Agent tool with feedback loops
- Both modes are built and documented

### Current Hooks: 13 registered
SessionStart (2), UserPromptSubmit (1), PreToolUse (3), PostToolUse (4), Stop (3)

---

## Part 2: Agent Renames + Merges + New Agents

### 2A. Rename: `chat-report-agent` → `session-report-agent`

**Why:** "Session report" reflects the full scope — git changes, files, agents invoked, ADR subfolder completions, not just chat messages.

**Changes:**
- Rename folder: `agents/chat-report-agent/` → `agents/session-report-agent/`
- Rename skill: `generating-chat-reports` → `generating-session-reports` (clean rename, no alias — avoids confusion)
- Rename system docs: `chat_reports/` → `session_reports/`
- New command: `/session-report`
- New hook: `session-report-prompt.sh` (Stop, opt-in)

**Invocation:**
```
/session-report                    # generate report for this session
/session-report 9_DYNAMIC_NAV     # report for specific ADR subfolder
"generate a session report"        # natural language
```

**Integration with chain/orchestrator:**
- When chain completes an ADR subfolder → session-report-agent auto-invoked to document what was done
- When orchestrator completes all phases → final comprehensive report

---

### 2B. Merge: `playwright-testing-agent` + `user-story-testing-agent` → `validation-agent`

**Why:** Both use Playwright, both capture screenshots, both write reports. Merging eliminates confusion about which to invoke.

**Old agents:** Move to `agents/deprecated/`

**Validation agent modes:**
```
/validate                          # full — E2E + user stories + visual + a11y
/validate --e2e-only              # Playwright test suites only
/validate --stories-only          # user story validation only
/validate --visual-only           # screenshot capture only
/validate --a11y                  # accessibility audit
/validate 9_DYNAMIC_NAV           # validate ADR subfolder work
/validate standalone "navbar fix" # standalone validation with named folder
```

**Model:** `sonnet` — test runs are structured and repeatable, don't need opus-level reasoning. Saves tokens.

**Output structure:**
```
.docs/validation/
├── <ADR_SUBFOLDER_NAME>/          ← ADR-linked
│   └── phase_N/
│       ├── overview.md
│       ├── screenshots/
│       ├── user-story-report.md
│       └── test-results.md
├── standalone/                    ← non-ADR work
│   ├── 1-navbar-addition/
│   │   ├── overview.md
│   │   ├── screenshots/
│   │   └── test-results.md
│   └── 2-careers-page-fix/
│       └── ...
```

**Standalone numbering:** Auto-incremented based on existing folders. Each gets `N-description/`.

**Skills combined:**
- `testing-with-playwright` (keep)
- `playwright-cli` (keep)
- `testing-user-stories-validation` (keep)
- All loaded by the single `validation-agent`

---

### 2C. NEW: `component-creator-agent` (Agent-Skill-Hook-Command-SystemDocs Creator)

**Why:** Every time we create a new agent or skill, we manually have to remember:
1. Create the agent AGENT.md
2. Create the skill SKILL.md
3. Create a hook (if needed)
4. Create a slash command (if user-invocable)
5. Add `$ARGUMENTS` to the command
6. Create system docs (README + USAGE_GUIDE + ARCHITECTURE + SYSTEM_OVERVIEW)
7. Register hooks in settings.json
8. Mirror to .codex/
9. Sync to 5 repos

This agent automates the entire pipeline. You describe what you want, it creates everything.

**Invocation:**
```
/create-component "validation agent that runs Playwright tests and user story checks"
"create a new agent for data ingestion with a CLI script"
```

**What it does:**
1. Parses user description → determines what's needed (agent? skill? hook? command?)
2. Creates AGENT.md following `creating-claude-agents` skill conventions
3. Creates SKILL.md following `creating-claude-skills` skill conventions
4. Creates hook script if the system needs auto-triggering
5. Creates slash command with `$ARGUMENTS` if user-invocable
6. Registers hooks in settings.json
7. Creates system docs (all 4 files for multi-component, 2 for single)
8. Mirrors everything to .codex/
9. Syncs to all repos from SYNC-REPOS.md
10. Reports what was created in chat

**Hook:** PostToolUse on Write — if an AGENT.md or SKILL.md is written WITHOUT the component-creator, it fires the `systemdocs-reminder.sh` (already exists) PLUS a new reminder:
```
"Component created without full pipeline. Missing: [hook, command, system docs].
Run /create-component --complete <name> to fill gaps."
```

**Skill:** `component-creation-pipeline/SKILL.md` — defines the full pipeline, references all creation skills

**Command:** `/create-component`
```
/create-component "description of what the agent should do"
/create-component --complete chain-agent    # fill gaps for existing component
/create-component --audit                   # audit all components for gaps
```

The `--audit` mode is basically what `/system-docs-audit` does but expanded to check hooks, commands, and codex mirrors too.

---

### 2D. NEW: `claude-codex-guide-agent` (Operations Guide Agent)

**Why:** When you ask "how does the chain system work?" or "explain the hooks" or "how do I improve the ADR setup?", there's no dedicated agent that knows to write structured answers to a docs folder. Currently answers go into chat and get lost.

**What it does:**
- Detects questions about `.claude/` or `.codex/` operations
- Writes structured answers to `.claude/docs/` (new folder)
- Organizes by topic into subfolders

**New folder structure:**
```
.claude/docs/
├── guides/                    ← how-to guides (user-facing)
│   ├── creating-agents.md
│   ├── using-chain-system.md
│   └── running-validations.md
├── plans/                     ← improvement plans (from ideation sessions)
│   ├── 2026-03-24-systemdocs-audit.md
│   └── 2026-03-25-agent-hook-review.md
├── system/                    ← how things work technically
│   ├── shared/                ← applies to both claude + codex
│   │   ├── hook-lifecycle.md
│   │   └── agent-skill-relationship.md
│   ├── claude/                ← claude-specific
│   │   └── settings-json-format.md
│   └── codex/                 ← codex-specific
│       └── config-toml-format.md
├── workflows/                 ← automated + manual workflows
│   ├── fea-expansion-cycle.md
│   ├── chain-agent-workflow.md
│   ├── adr-phase-lifecycle.md
│   └── longrunning-orchestration.md
└── ai-general/                ← AI knowledge not specific to claude/codex
    ├── prompt-engineering.md
    └── agent-design-patterns.md
```

**Hook:** UserPromptSubmit — detects questions about operations:
```bash
# Trigger phrases
"how does the * agent work"
"explain the * system"
"how do I use *"
"what hooks do we have"
"how does .claude work"
"how does .codex work"
```

When detected, outputs:
```
OPERATIONS GUIDE: This question is about .claude/.codex operations.
Write the answer to .claude/docs/<appropriate-subfolder>/<topic>.md
so it persists for future reference.
```

**Sync requirement:** `.claude/docs/` mirrors to `.codex/docs/` and syncs to repos. The hook for this is handled by the claude-codex-sync system (see 2E below).

---

### 2E. Enhancement: `claude-codex-sync-agent` — Add Hook + Command

**Current state:** Agent + skill exist but no hook triggers sync automatically. You have to manually ask for sync.

**Add:**
- **Hook:** PostToolUse on Write — if a file is written to `.claude/` or `.codex/`, auto-check if the mirror is out of date
- **Command:** `/sync` or `/ccsync` — explicit sync trigger

```bash
# PostToolUse hook: auto-sync-check.sh
# If file written to .claude/agents|skills|commands|hooks|system_docs|docs:
#   Check if .codex/ mirror exists and matches
#   If different or missing: "SYNC NEEDED: .codex/<path> is out of date"
```

**Why non-blocking reminder instead of auto-sync:** Auto-syncing every file write would be noisy and could cause issues if the file is being iteratively edited. Better to remind at the end of a session or when explicitly requested.

The `/sync` command:
```
/sync                     # sync everything .claude/ ↔ .codex/
/sync agents              # sync just agents
/sync 5-repos             # sync to all SYNC-REPOS.md repos
/sync --check             # report what's out of sync without fixing
```

---

### 2F. Savepoint Agent Enhancement — Auto on ADR Subfolder Completion

**Current:** Savepoint agent creates branches manually when asked.

**Enhancement:** When the chain system or longrunning orchestrator completes an ADR subfolder, auto-create a savepoint branch.

**Implementation:** Add to `chain-continue.sh` Stop hook:
```bash
# When SUBFOLDER_COMPLETE signal detected:
# 1. Continue chain to next subfolder (existing)
# 2. ALSO create a savepoint branch: savepoint/session-N-complete-YYYYMMDD
```

This gives you a git branch marking each major milestone without manual intervention.

---

## Part 3: Hooks — Complete List

### Existing (keep as-is): 13
| # | Event | Script | Purpose |
|---|---|---|---|
| 1 | SessionStart | session-start-setup.sh | Project context |
| 2 | SessionStart | chain-session-init.sh | Chain context |
| 3 | UserPromptSubmit | fea-detect.sh | FEA keywords |
| 4 | PreToolUse | pre-bash-validator.sh | Block dangerous bash |
| 5 | PreToolUse | block-sensitive-files.sh | Block .env edits |
| 6 | PreToolUse | require-frontend-spec.sh | Auto-create frontend spec |
| 7 | PostToolUse | post-format-code.sh | Auto-format |
| 8 | PostToolUse | scan-secrets.sh | Secret scanning |
| 9 | PostToolUse | large-file-guard.sh | File size guard |
| 10 | PostToolUse | systemdocs-reminder.sh | Docs reminder |
| 11 | Stop | git-context-report.sh | Git state capture |
| 12 | Stop | orchestrator-poke.ps1 | Spawn next subagent |
| 13 | Stop | chain-continue.sh | Chain continuation |

### New hooks to add: 8
| # | Event | Script | Purpose | Priority |
|---|---|---|---|---|
| 14 | UserPromptSubmit | chat-history-reminder.sh | Enforce mandatory chat logging | HIGH |
| 15 | SessionStart | adr-structure-check.sh | Validate ADR structure | MEDIUM |
| 16 | PostToolUse (Edit) | todo-sync-reminder.sh | Task list ↔ TODO sync | MEDIUM |
| 17 | UserPromptSubmit | savepoint-detect.sh | Detect "savepoint" keyword | NEW |
| 18 | UserPromptSubmit | repo-setup-detect.sh | Detect "bootstrap"/"set up repo" | NEW |
| 19 | Stop | session-report-prompt.sh | Remind to generate report (opt-in) | NEW |
| 20 | PostToolUse (Write) | auto-sync-check.sh | Check .claude/.codex mirror sync | NEW |
| 21 | UserPromptSubmit | operations-guide-detect.sh | Detect questions about .claude/.codex ops | NEW |

**Total after changes: 21 hooks**

---

## Part 4: Commands — Complete List

### Existing (update with $ARGUMENTS): 5
| Command | Add $ARGUMENTS | Example |
|---|---|---|
| `/commit-and-push` | YES | `/commit-and-push "fix navbar"` |
| `/deploy-preview` | YES | `/deploy-preview staging` |
| `/run-full-tests` | YES | `/run-full-tests --project=desktop` |
| `/spawn-subagent` | YES | `/spawn-subagent chain-agent "phase 3"` |
| `/sync-dependencies` | YES | `/sync-dependencies --check-only` |

### New commands: 5
| Command | Purpose |
|---|---|
| `/session-report` | Generate session/ADR completion report |
| `/validate` | Run validation agent (E2E + stories + visual) |
| `/savepoint` | Create savepoint branch |
| `/create-component` | Full pipeline: agent + skill + hook + command + docs |
| `/sync` | Sync .claude/ ↔ .codex/ + repos |

### Existing (keep as-is): 6
`/chain`, `/chain-status`, `/chain-stop`, `/fea`, `/system-docs-audit`, `/README`

**Total after changes: 16 commands**

---

## Part 5: Session Report — Opt-In Config

### How it works
The Stop hook `session-report-prompt.sh` only fires if this file exists:
```
.claude/config/auto-session-report
```

**Contents of the config file:**
```json
{
  "enabled": true,
  "mode": "remind",
  "output": ".docs/reports/sessions/"
}
```

**`mode` options:**
- `"remind"` — outputs "Consider generating a session report" (default, recommended)
- `"auto"` — auto-generates a report on every session end (costs tokens)

**Why opt-in:** Most sessions are short Q&A or quick fixes that don't need reports. Only long development sessions benefit. The user creates the config file when they want it, deletes it when they don't.

**Recommendation:** Use `"remind"` mode. It's free (just text output) and the user can then type `/session-report` if they want one. Auto mode generates a report every time Claude exits, which adds cost and noise for trivial sessions.

---

## Part 6: `.claude/docs/` Folder Structure

New documentation folder for persistent answers, plans, and guides:

```
.claude/docs/
├── guides/                    ← how-to guides for users
│   └── (created as questions come in)
├── plans/                     ← improvement plans from ideation sessions
│   └── (created during planning conversations)
├── system/                    ← technical operations documentation
│   ├── shared/                ← applies to both claude + codex
│   ├── claude/                ← claude-specific
│   └── codex/                 ← codex-specific
├── workflows/                 ← automated + manual workflow docs
│   └── (chain, FEA, ADR, longrunning, etc.)
└── ai-general/                ← AI knowledge not specific to tooling
    └── (prompt engineering, agent patterns, etc.)
```

This folder syncs to `.codex/docs/` (identical content) and to repos via SYNC-REPOS.md.

---

## Part 7: Answers to Your Questions

### Q1: Validation agent model
**Answer:** `sonnet`. Test runs are structured, repeatable, and don't require deep reasoning. Sonnet handles Playwright execution, screenshot comparison, and report generation efficiently. Opus would be wasted on "run these tests and tell me what passed."

### Q2: Session report on Stop — auto or remind?
**Answer:** `remind` mode (opt-in). Auto-generating adds cost to every session end, and most sessions are quick chats that don't need reports. The remind mode is free — it just outputs text. User types `/session-report` when they actually want one. The config file makes it easy to toggle.

### Q3: Old agents — deprecate or delete?
**Answer:** Move to `agents/deprecated/`. Keeps reference material without cluttering active agents. The deprecated folder already exists with this convention.

### Q4: Skill rename — clean rename or alias?
**Answer:** Clean rename. `generating-chat-reports` → `generating-session-reports`. No alias. One name, one skill. References in system docs and agents get updated to the new name. The old name stops existing.

---

## Part 8: Complete Change List (Final)

### Agent Changes (5)
| # | Type | Details |
|---|---|---|
| 1 | Rename | `chat-report-agent` → `session-report-agent` |
| 2 | Merge | `playwright-testing-agent` + `user-story-testing-agent` → `validation-agent` |
| 3 | Deprecate | Move old playwright + user-story agents to deprecated/ |
| 4 | New | `component-creator-agent` — full pipeline for creating agent+skill+hook+command+docs |
| 5 | New | `claude-codex-guide-agent` — operations guide, writes to .claude/docs/ |

### Skill Changes (3)
| # | Type | Details |
|---|---|---|
| 6 | Rename | `generating-chat-reports` → `generating-session-reports` |
| 7 | New | `component-creation-pipeline` — full pipeline skill |
| 8 | New | `operations-guide` — detect and document .claude/.codex operations questions |

### Hook Changes (8 new)
| # | Details |
|---|---|
| 9-16 | See Part 3 above — hooks 14 through 21 |

### Command Changes (10)
| # | Type | Details |
|---|---|---|
| 17 | New | `/session-report` |
| 18 | New | `/validate` |
| 19 | New | `/savepoint` |
| 20 | New | `/create-component` |
| 21 | New | `/sync` |
| 22-26 | Update | Add $ARGUMENTS to 5 existing commands |

### New Folder
| # | Details |
|---|---|
| 27 | `.claude/docs/` with guides/, plans/, system/, workflows/, ai-general/ |

### System Docs Changes
| # | Details |
|---|---|
| 28 | Rename `chat_reports/` → `session_reports/` |
| 29 | New `validation/` system docs |
| 30 | New `component_creator/` system docs |
| 31 | New `operations_guide/` system docs |
| 32 | Update `hooks_system/` with full mapping |
| 33 | Update `claude_codex_sync/` with hook + command |

### Infrastructure
| # | Details |
|---|---|
| 34 | Savepoint auto-creation on ADR subfolder completion |
| 35 | Auto-sync-check hook for .claude/.codex parity |
| 36 | Session report opt-in config system |
| 37 | Mirror all to .codex/ |
| 38 | Sync all to 5 repos |

**Total: 38 discrete changes**
