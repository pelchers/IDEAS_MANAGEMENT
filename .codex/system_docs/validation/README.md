# Validation System

## Overview
Unified validation agent combining E2E testing, user story validation, visual regression, and accessibility auditing. Replaces the separate playwright-testing and user-story-testing agents.

## Components
| Component | Path |
|---|---|
| **Agent** | `.claude/agents/validation-agent/AGENT.md` |
| **Skill** | `.claude/skills/testing-with-playwright/SKILL.md` |
| **Skill** | `.claude/skills/testing-user-stories-validation/SKILL.md` |
| **Skill** | `.claude/skills/playwright-cli/SKILL.md` |
| **Command** | `.claude/commands/validate.md` |

## Modes
- Full (default), `--e2e-only`, `--stories-only`, `--visual-only`, `--a11y`

## Output
- ADR-linked: `.docs/validation/<SUBFOLDER>/phase_N/`
- Standalone: `.docs/validation/standalone/N-description/`
