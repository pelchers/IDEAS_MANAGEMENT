# Feature Expansion — Usage Guide

## Quick Start

### Option 1: Slash Command
```
/fea add a persistent navbar to all pages
```
The `/fea` command loads the full 6-phase workflow and treats your text as the enhancement request. Begin at Phase 1 (Audit) focused on your specific request.

### Option 2: Keyword in Message
Include any of these phrases anywhere in your message:
- "use fea"
- "fea process"
- "apply fea"
- "fea workflow"

Example:
```
"I want to add weather data to the campus tab — use fea process"
```
The UserPromptSubmit hook auto-injects workflow instructions before the agent processes your message.

### Option 3: Broad Expansion (no specific request)
```
/fea
```
With no arguments, the agent runs a broad gap analysis:
1. Queries the database for NULL rates, empty tables, low-count fields
2. Reviews each page/tab for thin content or placeholders
3. Tests external APIs for available but un-ingested data
4. Presents categorized proposals in chat
5. Waits for your approval before executing

## The 6-Phase Cycle (Detailed)

### Phase 1: Audit
- Run SQL queries against the database to find coverage gaps
- Browse each page/tab in the app and note thin sections
- Test external API endpoints (Scorecard, ESPN, BLS, etc.) for available data
- Categorize findings: Data gaps, UI gaps, Interactivity gaps, Automation gaps

### Phase 2: Ideate
- Present findings in chat, organized by category
- Priority-order by impact (user value) and feasibility (data availability)
- **WAIT for user approval** — never execute without explicit go-ahead
- User may approve all, approve some, reject some, or request modifications

### Phase 3: Document
- Update `.adr/orchestration/` notes with planned work
- Create a numbered task list (e.g., N1, N2, N3...)
- Document data sources, expected record counts, CLI script names
- Note any dependencies between tasks

### Phase 4: Execute
Build in this order for each enhancement:
1. **Schema** — `ALTER TABLE` or Drizzle migration for new columns/tables
2. **Ingestion** — CLI fetcher script, add to `package.json` under `data:*`
3. **API** — Update backend routes to expose new data
4. **Frontend** — Wire into existing pages/tabs (prefer expanding over new pages)
5. **Admin** — Register adapters for admin panel auto-discovery

### Phase 5: Validate
- Run Playwright E2E tests for all affected features
- Capture screenshots to `user_stories/` validation folders
- Verify real data displays (not all N/A)
- Test interactivity (filters, sort, expand/collapse, search)

### Phase 6: Report
Present in chat:
- Task-by-task summary with before/after metrics
- New data counts and coverage percentages
- CLI scripts added (with names)
- E2E test results (pass/fail/flaky counts)
- Git commit SHAs

## When to Use Each Approach

| Scenario | Approach |
|---|---|
| Quick single enhancement | `/fea add weather data` |
| Multiple enhancements in one session | `/fea` (broad audit) → approve list → execute all |
| Enhancement as part of a chain | Chain system calls FEA internally when `feaMode: true` |
| Debugging/fixing existing feature | Don't use FEA — just fix directly |
| Refactoring without new data | Don't use FEA — use standard development |

## Task Naming Convention
Each expansion session gets a letter series:
- Session 1: G1, G2, G3...
- Session 2: H1, H2, H3...
- Session 3: I1, I2...
- And so on through the alphabet

This makes it easy to reference work across sessions: "The navbar was added in K3."

## Common Data Sources

| Source | Free? | API | What You Get |
|---|---|---|---|
| College Scorecard | Yes (key required) | `api.data.gov/ed/collegescorecard` | Enrollment, tuition, earnings, demographics, programs by CIP |
| ESPN | Yes (no key) | `site.api.espn.com/apis/site/v2/sports/` | Teams, rosters, rankings, scores, headshots, school colors |
| OpenAlex | Yes (no key) | `api.openalex.org/institutions` | Publications, citations, h-index, research topics |
| Wikipedia | Yes (no key) | `en.wikipedia.org/api/rest_v1/page/summary/` | Descriptions, images, banner photos |
| BLS | Yes (key optional) | `api.bls.gov/publicAPI/v2/timeseries/data/` | Career salary, employment counts, growth projections |
| OSM Overpass | Yes (no key) | `overpass-api.de/api/interpreter` | Buildings, lat/lng, campus features |
| O*NET | Yes (registration) | `services.onetcenter.org/ws/` | Career descriptions, tasks, skills, education requirements |

## Troubleshooting

**"The agent didn't follow FEA process"**
- Check that you used `/fea` or included a keyword trigger
- The hook only fires on UserPromptSubmit — not on follow-up messages in the same turn

**"The agent skipped the ideation phase"**
- If you provide a very specific request with `/fea`, the agent may go straight to execution
- To force ideation: `/fea` with no arguments, or add "ideate first" to your message

**"CLI scripts weren't added to package.json"**
- This is a constraint violation — the skill requires all scripts under `data:*` prefix
- Check `package.json` and add manually if missed
