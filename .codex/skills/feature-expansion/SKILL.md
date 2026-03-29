# Feature Expansion

Use this skill when the user wants to identify gaps and enhance the app with new data, UI improvements, interactivity, or all three. This codifies the repeatable expansion cycle used across sessions G through M.

## Trigger Phrases
- "identify points to enrich"
- "expand the app"
- "what else can we add"
- "feature expansion"
- "next round of enhancements"
- "enrich with data/ui/interaction"

## The Expansion Cycle

### Phase 1: Audit & Ideate (Chat)
1. **Data Audit** — Query the database for coverage gaps (NULL rates, empty tables, low-count fields)
2. **UI Audit** — Review each page/tab for thin content, missing interactivity, or placeholder sections
3. **API Research** — Test external APIs for available data not yet ingested
4. **Ideation** — Present categorized enhancement ideas in chat:
   - Data enrichment (new sources, missing fields)
   - UI improvements (visual upgrades, layout changes)
   - Interactivity (filters, search, calculators, expandable cards)
   - Automation (new CLI scripts, adapters)
5. **User Approval** — Wait for user to approve/modify/reject before proceeding

### Phase 2: Document (ADR)
1. Update `.adr/orchestration/9_DYNAMIC_NAV_AND_DATA_INGESTION/notes.md` with planned work
2. For new subsystems, create new orchestration subfolders
3. Document data sources, expected record counts, and CLI script names

### Phase 3: Execute (Procedural Build)
Follow this build order for each enhancement:
1. **Schema** — Add DB columns/tables if needed (`ALTER TABLE` or Drizzle migration)
2. **Ingestion** — Build CLI fetcher script, register in `package.json` under `data:*`
3. **API** — Update backend routes to expose new data
4. **Frontend** — Wire data into existing pages/tabs (prefer expanding existing sections over new pages)
5. **Admin** — Register adapters for admin panel auto-discovery

### Phase 4: Validate & Test
1. Run Playwright E2E tests for all affected features
2. Capture screenshots to `user_stories/` validation folders
3. Verify data displays correctly (not all N/A)
4. Test interactivity (filters, sort, expand/collapse, search)

### Phase 5: Report (Chat)
Present a structured report in chat:
- Task-by-task summary with before/after metrics
- New data counts and coverage percentages
- CLI scripts added
- E2E test results
- Commits made

## Task Naming Convention
Use alphabetical series per session: G1-G8, H1-H6, I1-I5, J1-J9, K1-K8, L1-L6, M1-M8, etc.

## Key Rules
- **Always commit after each logical unit** (ingestion done, frontend wired, tests passing)
- **Always add CLI scripts to `package.json`** under the `data:*` prefix
- **Always update orchestration docs** before and after execution
- **Never add new pages when expanding existing tabs/sections suffices**
- **Always run E2E tests** before reporting completion
- **Always log to chat history** via `chat-history-convention` skill

## Data Source Checklist (Common Patterns)
| Source | API | Fields |
|---|---|---|
| College Scorecard | `api.data.gov/ed/collegescorecard` | Enrollment, tuition, earnings, demographics, programs |
| ESPN | `site.api.espn.com/apis/site/v2/sports/` | Teams, rosters, rankings, scores, headshots, colors |
| OpenAlex | `api.openalex.org/institutions` | Publications, citations, h-index, research topics |
| Wikipedia | `en.wikipedia.org/api/rest_v1/page/summary/` | Descriptions, images, banner photos |
| OpenStreetMap (Overpass) | `overpass-api.de/api/interpreter` | Buildings, lat/lng, campus features |

## Example Invocation
```
User: "let's do another round of feature expansion"
Agent: [runs Phase 1 audit, presents ideation in chat, waits for approval]
User: "approved, proceed"
Agent: [executes Phases 2-5, reports in chat]
```
