# Usage Guide: User Story Testing

## Quick Start

```
/agent user-story-testing-agent "Run full user story validation pass"
```

Syncs folders, runs Playwright for each story, captures screenshots, logs results.

## Detailed Usage

### Full Validation Pass

Agent steps:
1. Reads all story IDs from `user_stories/user_stories.md`
2. Creates missing `<slug>/story.md` + `validation/` folders
3. Runs Playwright for each story, captures screenshots
4. Records pass/fail; fixes failures and reruns until stable

### Single Story

```
/agent user-story-testing-agent "Validate us-020-school-discovery"
```

### Story File Format (`story.md`)

```markdown
# Story: <Title>

## Steps
1. Navigate to ...
2. Click ...

## Acceptance Criteria
- [ ] <criterion>
```

### Screenshot Naming

Use numeric prefixes matching story steps:
```
validation/30-search-results.png
validation/31-filter-applied.png
```

## Troubleshooting

**Missing story folder** — Agent creates it automatically using the template at `.claude/templates/user-story-validation/story.md`.

**Story marked passing despite failure** — The skill explicitly prohibits forcing passes. Re-run with: "Do not mark any story passing unless Playwright confirms it."

**Screenshots in wrong location** — All screenshots must be saved to `user_stories/<slug>/validation/`.
