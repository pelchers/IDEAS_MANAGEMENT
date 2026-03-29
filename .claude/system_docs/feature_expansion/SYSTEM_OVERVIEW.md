# System Overview: Feature Expansion

## What It Is

The Feature Expansion (FEA) system is a structured 6-phase workflow for adding new data sources, UI improvements, and interactivity features to the Campus platform. It enforces an audit-first, approval-gated, validate-before-reporting discipline that prevents half-finished features from landing in the codebase.

## Component Map

```
.claude/
├── agents/feature-expansion-agent/AGENT.md    # Execution persona
├── skills/feature-expansion/SKILL.md           # 6-phase methodology + data sources
├── commands/fea.md                              # /fea slash command
└── hooks/
    ├── scripts/fea-detect.sh                   # Keyword detection script
    └── settings.json                           # UserPromptSubmit hook registration

.adr/orchestration/                              # Phase 3 writes here
user_stories/<feature>/validation/              # Phase 5 writes screenshots here
```

## When to Use vs Alternatives

| Scenario | Use FEA | Alternative |
|----------|---------|-------------|
| Adding a new external data source | Yes | Direct coding |
| UI improvement with new data | Yes | Standard dev (if no new data) |
| Bug fix in existing feature | No — fix directly | Standard debugging |
| Refactor without new data | No | Standard development |
| Small one-line change | No | Direct edit |
| Large multi-source expansion | Yes | N/A |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **adr_setup** | Phase 3 updates `.adr/orchestration/` notes and task lists |
| **chat_reports** | Phase 6 report follows the chat_reports 8-section format |
| **savepoint** | Natural trigger after Phase 4 completes a major expansion |
| **todo_tracker** | FEA tasks appear in TODO.md after Phase 3 documents them |
| **session_orchestration** | Orchestrators can call FEA internally when `feaMode: true` |

## Three Invocation Methods

1. **Slash command**: `/fea <description>` or `/fea` (broad audit)
2. **Keyword trigger**: Include "use fea", "fea process", "apply fea" in any message
3. **Direct reference**: "Use the feature-expansion agent to..."

## Known Data Sources

| Source | API Base | Key Fields |
|--------|----------|-----------|
| College Scorecard | `api.data.gov/ed/collegescorecard` | Enrollment, tuition, earnings |
| ESPN | `site.api.espn.com` | Teams, rosters, rankings, scores |
| OpenAlex | `api.openalex.org` | Publications, citations, h-index |
| Wikipedia | `en.wikipedia.org/api/rest_v1` | Descriptions, images |
| BLS | `api.bls.gov` | Career salary, employment, growth |
| OSM Overpass | `overpass-api.de` | Buildings, campus features |

## Design Decisions

**Why require user approval before Phase 3?**
Phase 4 is irreversible (schema changes, new files). The ideation gate ensures time is not spent building features the user didn't want.

**Why fixed build order in Phase 4?**
Schema first prevents frontend code from accessing non-existent columns. Ingestion before API prevents routes from returning empty data. This order eliminates a class of "works locally, fails in prod" bugs.

**Why alphabetical task naming (G1, H1...)?**
Sequential numbering across sessions creates collisions. Letter prefixes make session of origin obvious and references durable.

## Constraints

- All CLI scripts must use `data:*` prefix in `package.json`
- Frontend changes expand existing pages; new pages require explicit approval
- Phase 5 screenshots go to `user_stories/<feature>/validation/`
- Phase 6 report must include real record counts, not estimates
