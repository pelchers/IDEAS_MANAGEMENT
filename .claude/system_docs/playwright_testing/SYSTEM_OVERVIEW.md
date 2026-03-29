# Playwright Testing — System Overview

## What This System Does

Provides E2E test authoring, visual regression testing, and interactive browser automation.
Covers two distinct modes: automated test suites for CI/CD pipelines, and interactive CLI
sessions for one-off research, manual flows, and scraping.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Agent | `.claude/agents/playwright-testing-agent/AGENT.md` | Orchestrates test writing and CLI sessions |
| Skill (suite) | `.claude/skills/testing-with-playwright/SKILL.md` | Guidance for `npx playwright test` suites |
| Skill (CLI) | `.claude/skills/playwright-cli/SKILL.md` | Interactive CLI browser commands |

## When to Use

| Scenario | Use |
|----------|-----|
| Writing E2E tests for a new feature | `testing-with-playwright` skill |
| Running automated CI/CD test suite | `npx playwright test` |
| Capturing visual regression baselines | `testing-with-playwright` + `toHaveScreenshot()` |
| Manual browser session / research | `playwright-cli` skill |
| One-off URL scraping or metadata | `playwright-cli` |
| Capturing user story screenshots | `playwright-testing-agent` |

## Two Operating Modes

```
Suite Mode (testing-with-playwright)      CLI Mode (playwright-cli)
─────────────────────────────────────     ─────────────────────────
npx playwright test                       playwright-cli open <url>
Writes .spec.ts files                     playwright-cli snapshot
HTML reports + diffs                      playwright-cli screenshot
CI/CD ready                               Session-based, interactive
```

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **user_story_testing** | Uses Playwright to capture `validation/*.png` per story |
| **research** | `playwright-cli` underpins visual snapshot + console error scripts |
| **user_docs** | Playwright captures 1440x900 screenshots for `.appdocs/` |
| **hooks_system** | Hooks can trigger test runs on code changes |
| **session_orchestration** | Every phase requires Playwright PNG validation (1536x960 + 390x844) |

## Output Artifacts

```
test-results/                      — HTML test report (npx playwright show-report)
user_stories/*/validation/*.png    — User story evidence
.appdocs/user/screenshots/*.png    — Visual docs captures
.docs/validation/<SESSION>/*.png   — Phase validation screenshots
```

## Design Decisions

- **Two-mode split** keeps automated suite concerns separate from interactive/research use
- **Selector hierarchy** (role > label > text > testid > CSS) enforces accessibility-first testing
- **Visual regression via toHaveScreenshot()** — baselines stored in repo, diffs generated on failure
- **Never force passing tests** — failures must be investigated and fixed, not suppressed

## Quick Invocation

```
/agent playwright-testing-agent "Write E2E tests for the login flow"
/skill testing-with-playwright
/skill playwright-cli
```
