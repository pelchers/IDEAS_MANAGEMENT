# Feature Expansion System

## Overview
The Feature Expansion (FEA) system provides a repeatable, documented workflow for enhancing the Campus platform with new data sources, UI improvements, and interactivity features.

## Components

| Component | Path | Purpose |
|---|---|---|
| **Skill** | `.claude/skills/feature-expansion/SKILL.md` | Methodology reference — 5-phase cycle, data source checklist, build order |
| **Agent** | `.claude/agents/feature-expansion-agent/AGENT.md` | Execution persona — when to activate, workflow tree, constraints |
| **Slash Command** | `.claude/commands/fea.md` | User-invocable `/fea` command that triggers the workflow |
| **Hook** | `.claude/hooks/scripts/fea-detect.sh` | Auto-detects "use fea" / "fea process" keywords in user messages |
| **Settings** | `.claude/hooks/settings.json` | `UserPromptSubmit` hook registration |

## How to Use

### Method 1: Slash Command
```
/fea add a persistent navbar with logo and school selector
```
Or type your request first, then invoke:
```
User: "I want weather data on the campus tab"
User: /fea
```

### Method 2: Keyword Trigger
Include "use fea", "fea process", "apply fea", or "fea workflow" anywhere in your message:
```
"add weather to campus tab — use fea process"
```
The hook auto-injects the workflow instructions.

### Method 3: Direct Agent Reference
```
"Use the feature-expansion agent to research and add financial aid data"
```

## The 6-Phase Cycle

```
Phase 1: AUDIT      → DB gaps, UI thin spots, API availability
Phase 2: IDEATE     → Categorized proposals in chat, user approval
Phase 3: DOCUMENT   → ADR orchestration notes + task list
Phase 4: EXECUTE    → Schema → CLI → API → Frontend → Admin
Phase 5: VALIDATE   → Playwright E2E + screenshots
Phase 6: REPORT     → Chat summary with metrics
```

## Task Naming
Each session uses an alphabetical series: G1-G8, H1-H6, ..., N1-N9, etc.

## Data Sources Reference
| Source | API | Key Fields |
|---|---|---|
| College Scorecard | `api.data.gov/ed/collegescorecard` | Enrollment, tuition, earnings, demographics |
| ESPN | `site.api.espn.com` | Teams, rosters, rankings, scores, colors |
| OpenAlex | `api.openalex.org` | Publications, citations, h-index |
| Wikipedia | `en.wikipedia.org/api/rest_v1` | Descriptions, images |
| BLS | `api.bls.gov` | Career salary, employment, growth |
| OSM Overpass | `overpass-api.de` | Buildings, campus features |
