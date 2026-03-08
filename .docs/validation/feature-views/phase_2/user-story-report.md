# Phase 2: Ideas Capture — User Story Validation

Session: feature-views
Phase: 2
Date: 2026-03-08

## User Stories

| # | Story | Status | Notes |
|---|-------|--------|-------|
| 1 | User sees ideas grid with cards showing title, description, category badge, priority dot, and date | PASS | Grid uses `ideas-grid` CSS with auto-fill columns; each card has title, truncated description (120 chars), category badge, priority indicator (absolute top-right), and formatted date in footer |
| 2 | User can quick-add an idea by typing a title and pressing Enter | PASS | Quick-add input bar at top of page; Enter key or ADD button creates idea with default category (feature), priority (medium), status (new) |
| 3 | User can open full form to add idea with title, description, category, priority | PASS | "+ CAPTURE IDEA" button toggles expandable form with title, description textarea, category dropdown (feature/bug/improvement/research), priority dropdown (low/medium/high) |
| 4 | User can click a card to edit it | PASS | Clicking any idea card opens edit modal pre-populated with current values; modal has title, description, category, priority fields |
| 5 | User can save edits to an idea | PASS | SAVE button in edit modal updates the idea in state and persists via debounced PUT to API |
| 6 | User can delete an idea with confirmation | PASS | DELETE button on each card shows inline confirmation ("Delete this idea? YES / NO"); confirming removes the idea |
| 7 | User can filter ideas by category using filter chips | PASS | Filter chips for ALL, FEATURE, BUG FIX, IMPROVEMENT, RESEARCH; clicking toggles filter; active chip highlighted with brutalist styling |
| 8 | User can search ideas by title or description | PASS | Search input at top filters ideas in real-time by matching query against title and description (case-insensitive) |
| 9 | Priority colors are correct: High=Watermelon, Medium=Lemon, Low=Malachite | PASS | CSS classes `idea-card-priority--high/medium/low` use `--nb-watermelon`, `--nb-lemon`, `--nb-malachite` respectively; badge classes also match |
| 10 | Categories are feature, bug, improvement, research | PASS | Predefined constant array; dropdown selects enforce these values; no freeform input |
| 11 | Ideas persist via artifact API with correct envelope | PASS | GET extracts from `json.artifact.content`; PUT sends `{ content: { ideas, categories } }` matching the `[...path]` route contract |
| 12 | Empty state shows appropriate message | PASS | Two states: "No ideas yet" when list is empty; "No ideas match your filters" when filters exclude all results |
| 13 | Neo-brutalism styling matches pass-1 concept | PASS | Uses `ideas-grid`, `idea-card`, `idea-card-priority`, `idea-card-title`, `idea-card-body`, `idea-card-tags`, `idea-card-footer`, `filter-chip`, `ideas-filters` classes from globals.css (ported from pass-1 concept CSS) |
| 14 | Debounced save prevents excessive API calls | PASS | 500ms debounce timer; clears previous timer on rapid changes |
| 15 | Saving indicator shown during API calls | PASS | "Saving..." text appears in header next to capture button during persist |

## Summary

15/15 user stories pass.
