# Pre-Planning System

## Overview
Creates numbered plan files before execution begins. Every significant piece of work starts with a plan that persists the what/why/how.

## Components
| Component | Path |
|---|---|
| **Agent** | `.claude/agents/pre-planning-agent/AGENT.md` |
| **Skill** | `.claude/skills/pre-planning/SKILL.md` |
| **Hook** | `.claude/hooks/scripts/planning-detect.sh` |
| **Command** | `.claude/commands/plan.md` |

## Output
`.docs/planning/plans/#-plan-name.md`

## How to Use
```
/plan "description of what to plan"
"let's plan the subscription system"
```

## Integration
- Plans feed into ADR orchestration sessions
- Plan status updated as work progresses (Draft → Approved → In Progress → Completed)
