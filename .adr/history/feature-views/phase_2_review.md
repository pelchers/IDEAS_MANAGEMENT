# Phase 2 Review: Ideas Capture

Session: feature-views
Phase: 2
Date: 2026-03-08
Status: Complete

## What was built

Rewrote `apps/web/src/app/(authenticated)/projects/[id]/ideas/page.tsx` to deliver a fully functional ideas capture view with:

1. **Ideas grid** -- Responsive CSS grid (`ideas-grid`) with cards showing title, truncated description, category badge, priority indicator, and formatted date
2. **Quick-add** -- Inline input bar at the top of the page for rapid idea capture (title only, defaults applied)
3. **Full form** -- Expandable form with title, description, category dropdown, and priority dropdown
4. **Edit modal** -- Click any card to open a pre-populated edit modal with all fields
5. **Delete with confirmation** -- Inline confirmation on each card ("Delete this idea? YES / NO")
6. **Category filter chips** -- ALL, FEATURE, BUG FIX, IMPROVEMENT, RESEARCH filter chips matching pass-1 concept design
7. **Search** -- Real-time text search filtering by title and description
8. **Priority colors** -- High=Watermelon, Medium=Lemon, Low=Malachite (fixed CSS to match spec)
9. **Debounced save** -- 500ms debounce prevents excessive API calls
10. **Saving indicator** -- "Saving..." text in header during API calls
11. **Empty states** -- Distinct messages for empty list vs. no filter matches

## Key fixes from prior version

- **API contract mismatch fixed**: GET now extracts from `json.artifact.content`; PUT now sends `{ content: data }` envelope matching the `[...path]` route contract
- **Categories changed to predefined set**: Replaced freeform text input with dropdown enforcing feature/bug/improvement/research
- **Quick-add input added**: Prior version only had a full form toggle; now includes inline quick-capture bar
- **Priority simplified**: Removed "critical" (not in spec); kept low/medium/high with correct color mapping
- **Styling aligned to pass-1 concept**: Uses `idea-card`, `idea-card-priority`, `idea-card-title`, `idea-card-body`, `idea-card-tags`, `idea-card-footer`, `filter-chip`, `ideas-filters`, `ideas-grid` CSS classes
- **Priority color fix**: Low priority changed from Cornflower (blue) to Malachite (green) in globals.css
- **Removed unused features**: Stripped out tags system, status workflow, promote-to-kanban (not in Phase 2 spec)
- **Added debounced save**: Prior version persisted synchronously on every change

## Files changed

| File | Action |
|------|--------|
| `apps/web/src/app/(authenticated)/projects/[id]/ideas/page.tsx` | Rewritten |
| `apps/web/src/app/globals.css` | Updated (priority colors for idea cards) |
| `.docs/validation/feature-views/phase_2/user-story-report.md` | Created |
| `.adr/history/feature-views/phase_2_review.md` | Created |
| `.adr/orchestration/feature-views/primary_task_list.md` | Updated |

## Validation

15/15 user stories pass. See `.docs/validation/feature-views/phase_2/user-story-report.md`.

## Decisions

- Categories restricted to predefined set (feature, bug, improvement, research) per spec
- Quick-add creates ideas with default category "feature" and priority "medium"
- Priority simplified to 3 levels (low, medium, high) -- no "critical" per spec
- Debounce interval set to 500ms matching kanban implementation
- Description truncated to 120 characters on cards
- Removed tags, status workflow, and promote-to-kanban features (not in Phase 2 scope)
