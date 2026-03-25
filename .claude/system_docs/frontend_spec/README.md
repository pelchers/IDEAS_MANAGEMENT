# Frontend Spec System

## Overview
The Frontend Spec system ensures every frontend build has an explicit design reference. It operates across three layers — a PreToolUse hook (automatic), a skill (manual/interactive), and integration with the agent chain and longrunning orchestrator systems.

## Problem It Solves
Without a design spec, agents build UI inconsistently — wrong colors, mismatched layouts, deviation from prototypes, no coherence across pages. This system guarantees a `frontend_spec.md` always exists and is always read before frontend code is written.

## Components

| Component | Path | Purpose |
|---|---|---|
| **Hook** | `.claude/hooks/scripts/require-frontend-spec.sh` | PreToolUse — auto-creates spec before .tsx/.css writes |
| **Skill** | `.claude/skills/require-frontend-spec/SKILL.md` | Manual invocation, NL parsing, interactive spec creation |
| **Template** | `.claude/skills/adr-setup/templates/frontend_spec_template.md` | Spec file template with self-describing header |
| **Hook Config** | `.claude/hooks/settings.json` | Registered under PreToolUse Edit\|Write |

## Three Layers of Protection

```
Layer 1: PRE-WORK (require-frontend-spec hook)
  → Auto-creates spec if missing before any .tsx/.css write
  → Detects design system from filesystem (tokens, prototypes)
  → Marks incomplete if nothing found ("ACTION REQUIRED")

Layer 2: DURING WORK (agent-chain-orchestrator skill)
  → Mandatory 6-step reading order before frontend code
  → Agent reads spec → reference → CLAUDE.md → PRD → tech spec → prototype

Layer 3: POST-WORK (orchestrator-chain-agent, orchestrated mode)
  → Validates output matches spec after each phase
  → Sends feedback to subagent if spec violated
  → Up to 3 feedback loops before escalating
```

## Spec Source Types

| Type | When to Use | Auto-Detectable? |
|---|---|---|
| **Internal Prototype** | HTML/CSS prototypes exist in repo | Yes — hook scans filesystem |
| **External Reference** | Figma, live site, screenshot | No — requires user to provide URL |
| **Chat-Prompted** | User describes design in natural language | No — requires user input |
| **Similarity Match** | Adapt existing design pass with divergences | No — requires user to specify pass + changes |

## File Location & Resolution

```
Resolution order:
1. .adr/orchestration/<SESSION>/frontend_spec.md  (session-specific)
2. .adr/orchestration/frontend_spec.md             (root default)
3. Neither exists → hook auto-creates at root level
```

## Integration Points

| System | How It Integrates |
|---|---|
| **Agent Chain** | Hook fires before chain-agent writes; orchestrator validates post-phase |
| **FEA Process** | Hook fires during Phase 4 (Execute) frontend wiring |
| **Longrunning Session** | Subagents read spec per skill instructions |
| **Manual Development** | Hook fires on any direct file edit |
| **ADR Setup** | Step 0 verifies/creates spec for frontend sessions |

## Related Docs
- `USAGE_GUIDE.md` — how to create specs, 4 types with examples, NL parsing
- `ARCHITECTURE.md` — hook logic, auto-generation algorithm, reading order
- `.claude/system_docs/agent_chaining/` — chain-specific integration
