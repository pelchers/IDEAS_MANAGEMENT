# Phase 2: Ideas Capture

Session: feature-views
Phase: 2
Date: 2026-03-08

## Prior Phase Summary
Phase 1 completed: Kanban board built with drag-and-drop, column/card CRUD, artifact API integration. 13/13 user stories pass. Commit: a7bf98d.

## Objective
Build the ideas capture view matching pass-1 concept. Wire to artifact CRUD endpoints.

## Tasks
1. Build ideas page at `apps/web/src/app/(authenticated)/projects/[id]/ideas/page.tsx`
2. Ideas grid/list with cards for each idea
3. Each idea card: title, description, category badge, priority indicator, created date
4. Quick-add form: inline input at top to rapidly capture ideas
5. Full create/edit modal or inline form: title, description, category, priority
6. Delete idea with confirmation
7. Category filtering: dropdown or tag filter
8. Search: filter ideas by text
9. Priority indicators: High (Watermelon), Medium (Lemon), Low (Malachite)
10. Wire to GET/PUT /api/projects/[id]/artifacts?type=ideas
11. Auto-save after changes
12. Empty state for no ideas
13. Neo-brutalism styling matching pass-1

## Data Model (artifact JSON):
```json
{
  "ideas": [
    {
      "id": "idea-1",
      "title": "Idea title",
      "description": "Details...",
      "category": "feature",
      "priority": "high",
      "status": "new",
      "createdAt": "2026-03-08T00:00:00Z"
    }
  ],
  "categories": ["feature", "bug", "improvement", "research"]
}
```

## Output
- Ideas page component
- `.adr/history/feature-views/phase_2_review.md`
- `.docs/validation/feature-views/phase_2/user-story-report.md`
- Updated primary task list
