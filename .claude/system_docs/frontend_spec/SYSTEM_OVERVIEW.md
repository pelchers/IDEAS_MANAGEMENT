# Frontend Spec — System Overview

## What This System Does

Guarantees that every frontend build has an explicit design reference. A PreToolUse
hook auto-creates `frontend_spec.md` before any `.tsx` or `.css` file is written. A
skill handles manual and interactive spec creation. The orchestrator validates that
output matches the spec after each phase.

Without this system, agents build UI inconsistently — wrong colors, mismatched layouts,
no coherence across pages.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Hook | `.claude/hooks/scripts/require-frontend-spec.sh` | PreToolUse — auto-creates spec before `.tsx`/`.css` writes |
| Skill | `.claude/skills/require-frontend-spec/SKILL.md` | Manual invocation, NL parsing, interactive creation |
| Template | `.claude/skills/adr-setup/templates/frontend_spec_template.md` | Spec file scaffold |
| Hook Config | `.claude/hooks/settings.json` | Registered under `PreToolUse Edit|Write` |

## Three Protection Layers

```
Layer 1 — PRE-WORK (hook)
  Auto-creates spec from filesystem if missing before any .tsx/.css write

Layer 2 — DURING WORK (agent-chain-orchestrator skill)
  Mandatory 6-step reading order: spec → reference → CLAUDE.md → PRD → tech spec → prototype

Layer 3 — POST-WORK (orchestrator validation)
  Validates output matches spec after each phase; up to 3 feedback loops before escalating
```

## Four Spec Source Types

| Type | Auto-Detectable | When |
|------|----------------|------|
| Internal Prototype | Yes — hook scans filesystem | HTML prototypes exist in `.docs/planning/frontend/` |
| External Reference | No — requires URL | Figma, live site, screenshot |
| Chat-Prompted | No — requires description | User describes design in natural language |
| Similarity Match | No — requires pass reference | Adapt existing design pass with divergences |

## Spec File Resolution Order

```
1. .adr/orchestration/<SESSION>/frontend_spec.md   — session-specific (highest priority)
2. .adr/orchestration/frontend_spec.md             — root default
3. Neither exists → hook auto-creates at root level
4. Nothing detected → marked "ACTION REQUIRED"
```

## When to Use

| Scenario | Use |
|----------|-----|
| Project has tokens + prototypes | Do nothing — hook handles it automatically |
| Design reference is a URL | Include URL in message; skill creates Type 2 spec |
| You know what you want and can describe it | Describe in message; skill creates Type 3 |
| Adapting an existing design pass | Reference pass + divergences; skill creates Type 4 |
| Spec says "ACTION REQUIRED" | Run `/require-frontend-spec` and describe the design |
| Check if spec is valid | Run `/require-frontend-spec` for status report |

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **agent_chaining** | Hook fires before chain-agent writes; orchestrator validates post-phase |
| **session_orchestration** | Subagents read spec per 6-step mandatory reading order |
| **production_frontend** | Orchestrator uses spec during subagent dispatch |
| **adr_setup** | Step 0 of frontend sessions verifies/creates spec |
| **hooks_system** | Hook is registered in `settings.json` under `PreToolUse` |

## NL Parsing (One-Shot Rule)

- If user provides enough info → spec created immediately, zero questions
- Questions only asked when request is genuinely ambiguous AND no design system exists
- All questions asked in ONE batch — never intermittent follow-ups

## Design Decisions

- **Hook as first line of defense**: spec always exists before code is written
- **Self-describing header**: every spec starts with an HTML comment any agent can read
- **Session-level override**: session-specific specs take priority over root default
- **Batch question rule**: prevents conversation interruptions during builds

## Related Docs

| File | Content |
|------|---------|
| `ARCHITECTURE.md` | Hook detection logic, auto-generation algorithm, 6-step reading order, NL parsing rules |
| `USAGE_GUIDE.md` | Creating specs by type, question behavior, spec file structure, troubleshooting |
