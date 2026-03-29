# User Story Testing — System Overview

## What This System Does

Validates every user story end-to-end with Playwright, captures screenshot evidence
at critical steps, and documents pass/fail outcomes. Ensures every story in
`user_stories/user_stories.md` has a matching folder with evidence screenshots
and an explicit validation result.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Agent | `.claude/agents/user-story-testing-agent/AGENT.md` | Orchestrates full + single-story validation |
| Skill | `.claude/skills/testing-user-stories-validation/SKILL.md` | Validation rules + screenshot policy |
| Story list | `user_stories/user_stories.md` | Master list — single source of truth |
| Story folders | `user_stories/<story-slug>/` | Per-story steps, criteria, evidence |
| Template | `.claude/templates/user-story-validation/story.md` | Story file scaffold |

## Folder Structure Per Story

```
user_stories/
  user_stories.md
  us-020-school-discovery/
    story.md               — steps + acceptance criteria + validation result
    validation/
      30-search-results.png
      31-filter-applied.png
```

## When to Use

| Scenario | Use |
|----------|-----|
| ADR session 5 (initial story validation) | Full pass: all stories |
| ADR session 7 (re-validation after hardening) | Full pass: all stories |
| Single story broken after a fix | Single story validation |
| New story added | Create folder + validate |
| Pre-release acceptance check | Full pass |

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **playwright_testing** | Core test runner; shares `npx playwright` infrastructure |
| **adr_setup** | Corresponds to sessions `5_USER_STORY_TESTING` and `7_USER_STORY_TESTING_RERUN` |
| **research** | Visual snapshot hook scripts can supplement story evidence |
| **session_orchestration** | User story report is mandatory before any phase can complete |

## Validation Policy (Non-Negotiable)

- Never mark a story passing without Playwright confirmation
- Failures must be investigated and fixed — not bypassed
- All acceptance criteria must be explicitly checked (not just screenshots)
- Screenshots must be saved to `user_stories/<slug>/validation/` — not elsewhere

## Output Artifacts

```
user_stories/<slug>/story.md           — validation result written here
user_stories/<slug>/validation/*.png   — screenshot evidence
```

## Design Decisions

- **Story list as single source of truth**: `user_stories.md` drives folder sync; agent reconciles missing folders
- **Numeric screenshot prefixes (30+)**: avoids collision with system-level screenshots; aligns to story step sequence
- **No forced passes**: skill explicitly prohibits marking stories passing without evidence
- **Template-based scaffolding**: new stories always get the correct structure from `.claude/templates/`

## Quick Invocation

```
/agent user-story-testing-agent "Run full validation pass for all user stories"
/agent user-story-testing-agent "Validate only us-005-login-flow"
```
