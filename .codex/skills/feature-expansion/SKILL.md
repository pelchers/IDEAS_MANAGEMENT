# Feature Expansion

Systematic cycle for identifying gaps and enhancing the app with data, UI, and interactivity improvements.

## Cycle: Audit → Ideate → Document → Execute → Validate → Report

### Phase 1: Audit & Ideate (Chat)
- Data audit: query DB for coverage gaps (NULL rates, empty tables)
- UI audit: review each page/tab for thin content, placeholders
- API research: test external APIs for untapped data
- Present categorized ideas in chat, wait for approval

### Phase 2: Document
- Update `.adr/orchestration/` notes with planned work
- Create task list with alphabetical series naming (N1, N2, etc.)

### Phase 3: Execute (Procedural)
1. Schema changes (ALTER TABLE)
2. CLI fetcher scripts (data:* in package.json)
3. Backend API updates
4. Frontend wiring (expand existing tabs)
5. Admin panel adapter registration

### Phase 4: Validate
- Playwright E2E tests
- Screenshots to user_stories/validation/
- Verify real data displays

### Phase 5: Report
- Task summary with metrics
- Data counts, CLI scripts added, test results, commits

## Rules
- Always commit after each logical unit
- Always add CLI scripts to package.json
- Always update orchestration docs
- Expand existing sections over adding new pages
- Always run E2E tests before reporting
