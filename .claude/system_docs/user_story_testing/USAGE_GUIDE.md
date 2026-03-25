# Usage Guide: User Story Testing

## Quick Start

```
/agent user-story-testing-agent "Run full user story validation pass"
```

The agent syncs folders, runs Playwright for each story, captures screenshots, and logs results.

## Detailed Usage

### Full Validation Pass

```
/agent user-story-testing-agent "Validate all stories in user_stories/user_stories.md"
```

Agent steps:
1. Reads all story IDs from `user_stories/user_stories.md`
2. Creates any missing `<story_slug>/` folders + `story.md` + `validation/`
3. Runs Playwright flow for each story
4. Captures screenshots at critical steps
5. Records pass/fail in `validation/`
6. Fixes failures and reruns until stable

### Single Story Validation

```
/agent user-story-testing-agent "Validate us-020-school-discovery"
```

### Story File Format

`user_stories/<slug>/story.md`:
```markdown
# Story: <Title>

## Steps
1. Navigate to ...
2. Click ...
3. Verify ...

## Acceptance Criteria
- [ ] <criterion>
- [ ] <criterion>
```

### Screenshot Naming

Use numeric prefixes matching story steps:
- `30-search-results.png`
- `31-filter-applied.png`
- `32-school-card-detail.png`

## Troubleshooting

**Story folder missing**
The agent creates missing folders automatically. If `story.md` is missing, the agent uses the template from `.claude/templates/user-story-validation/story.md`.

**Playwright test fails and agent marks it passing**
The skill rule is explicit: never force passes. If you see a pass on a broken story, the agent did not follow the skill. Re-run with explicit instructions: "Do not mark any story as passing unless Playwright confirms it."

**Screenshots not saved to validation/**
Check that the Playwright test writes to the correct relative path. All screenshots go in `user_stories/<slug>/validation/`.
