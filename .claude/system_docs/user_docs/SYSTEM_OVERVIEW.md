# User Docs — System Overview

## What This System Does

Produces user-facing and developer-facing documentation with Playwright screenshot
capture, coverage maps, and lightweight HTML viewers. Maintains the `.appdocs/`
directory with guides readable by non-technical users and operational step-by-step
docs for developers.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Agent | `.claude/agents/user-dev-docs-agent/AGENT.md` | Drives full doc generation |
| Skill | `.claude/skills/producing-visual-docs/SKILL.md` | Visual capture + writing guidance |
| User output | `.appdocs/user/` | End-user guides and screenshots |
| Developer output | `.appdocs/developer/` | Operational setup and run guides |

## Required Output Files

| Path | Purpose |
|------|---------|
| `.appdocs/user/user-guide.md` | Main non-technical user guide |
| `.appdocs/user/coverage-map.md` | What is vs. isn't documented |
| `.appdocs/user/screenshots/*.png` | Playwright visuals at 1440x900 |
| `.appdocs/user/index.html` | HTML viewer for user docs |
| `.appdocs/developer/run-guide.md` | Setup + commands + env vars |
| `.appdocs/developer/index.html` | HTML viewer for developer docs |

## When to Use

| Scenario | Use |
|----------|-----|
| App reaches a stable milestone and needs user docs | Full generation run |
| New feature shipped that isn't documented | "Update user-guide.md with X feature" |
| Developer onboarding setup changed | "Update run-guide.md with new Railway steps" |
| Coverage audit needed | Agent writes/updates coverage-map.md |

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **playwright_testing** | Visual capture at 1440x900; shares Playwright infrastructure |
| **adr_setup** | Uses session `3_SITE_VISUAL_DOCS_FOR_USERS` for phase tracking |
| **user_story_testing** | Story validation screenshots can be included in user docs |
| **session_orchestration** | Doc generation follows phase lifecycle (plan → execute → validate → archive) |

## Content Standards

- **User guide**: Non-technical, step-by-step, no code snippets
- **Developer guide**: Exact CLI commands, environment variable names, deployment steps — summaries are not acceptable
- **Coverage map**: Every app feature explicitly listed with status (documented / not documented / in-progress)

## Design Decisions

- **1440x900 viewport** for documentation (human-readable width, not CI viewport)
- **Numeric filename prefixes** (`01-`, `02-`) ensure screenshots sort in flow order
- **HTML viewers** allow docs to be browsed without a markdown renderer
- **Coverage map as accountability tool**: forces explicit tracking of undocumented surfaces
- **ADR phase tracking**: doc generation is a first-class session, not an afterthought

## Quick Invocation

```
/agent user-dev-docs-agent "Create user and developer docs for the current app state"
/agent user-dev-docs-agent "Update the developer run-guide.md with the new Railway deploy steps"
```
