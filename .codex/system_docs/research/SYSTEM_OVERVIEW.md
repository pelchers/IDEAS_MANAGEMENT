# Research — System Overview

## What This System Does

Automates web research, visual feedback capture, data extraction, link auditing,
and structured documentation sessions. Two skills cover distinct concerns: browser
automation for ad-hoc data extraction, and ADR-tracked sessions for archival research.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Agent | `.claude/agents/research-automation-agent/AGENT.md` | Routes to hook scripts and research skills |
| Skill (browser) | `.claude/skills/researching-with-playwright/SKILL.md` | Web scraping and data extraction |
| Skill (session) | `.claude/skills/research-docs-session/SKILL.md` | ADR-backed structured sessions |
| Hook scripts | `.claude/hooks/scripts/playwright-*.sh` | Executable automation scripts |

## Hook Scripts Reference

| Script | Purpose | Input |
|--------|---------|-------|
| `playwright-visual-snapshots.sh` | Multi-viewport screenshots (desktop + mobile) | `urls.txt` |
| `playwright-userstory-smoke.sh` | Story smoke screenshots | `stories.csv` |
| `playwright-console-errors.sh` | Capture JS console errors | `urls.txt` |
| `playwright-a11y-snapshot.sh` | Accessibility tree snapshots | `urls.txt` |
| `web-research-metadata.sh` | Page title, meta, OG tags | `urls.txt` |
| `check-links.sh` | HTTP status for each URL | `urls.txt` |

## When to Use

| Scenario | Use |
|----------|-----|
| Snapshot all app pages at multiple viewports | `playwright-visual-snapshots.sh` |
| Capture user story evidence screenshots | `playwright-userstory-smoke.sh` |
| Audit for JS errors before a release | `playwright-console-errors.sh` |
| Check for broken links | `check-links.sh` |
| Structured, archival research with citations | `research-docs-session` skill |
| Custom data extraction from a web page | `researching-with-playwright` skill |

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **playwright_testing** | Shares Playwright infrastructure; both use `npx playwright` |
| **adr_setup** | `research-docs-session` creates phase plans and archives in `.adr/` |
| **user_story_testing** | Smoke screenshots from `stories.csv` feed story evidence |
| **session_orchestration** | Research sessions follow the same phase lifecycle |

## Input File Conventions

```
urls.txt        — one URL per line, placed at repo root
stories.csv     — story_id,url,description columns
```

## Output Artifacts

```
.docs/research/             — extracted data files
.adr/current/<SESSION>/     — research phase plans
.adr/history/<SESSION>/     — archived phase plans + reviews
screenshots/                — captured PNGs from hook scripts
```

## Design Decisions

- **Hook scripts as first-class tools**: runnable directly via bash without agent overhead
- **Two-skill split**: `researching-with-playwright` is ad-hoc; `research-docs-session` is archival
- **ADR integration for structured sessions**: research is part of the project record, not ephemeral
- **`urls.txt` as universal input**: all visual/audit scripts share the same input convention

## Quick Invocation

```
/agent research-automation-agent "Take visual snapshots of all pages in urls.txt"
/agent research-automation-agent "Check for console errors on http://localhost:3000"
/skill research-docs-session
bash .claude/hooks/scripts/playwright-visual-snapshots.sh
```
