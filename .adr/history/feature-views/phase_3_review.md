# Phase 3 Review: Whiteboard

Session: feature-views
Phase: 3
Date: 2026-03-08
Status: Complete

## What was built

Rewrote `apps/web/src/app/(authenticated)/projects/[id]/whiteboard/page.tsx` to deliver a fully functional SVG-based whiteboard with:

1. **SVG canvas** -- Full-viewport SVG drawing surface with dot grid background pattern
2. **Drawing tools** -- Six tools: select, rectangle, circle/ellipse, text, line, freehand
3. **Shape creation** -- Click-and-drag to create shapes; click for text placement; freehand path recording
4. **Shape selection** -- Click to select with watermelon dashed-border indicator; keyboard Escape to deselect
5. **Shape movement** -- Drag selected shapes to reposition
6. **Text editing** -- Double-click text shapes to edit inline via foreignObject input; Enter or blur to commit
7. **Color palette** -- Stroke colors (Black, Watermelon, Malachite, Cornflower, Lemon, Amethyst) and fill colors (None, White, Cream + 3 palette colors)
8. **Pan** -- Drag on empty canvas to pan viewport
9. **Zoom** -- Scroll wheel (continuous) and toolbar +/- buttons (25% steps); range 25%-400%
10. **Delete** -- Delete/Backspace key or toolbar delete button removes selected shape
11. **Auto-save** -- 500ms debounced PUT to artifact API with proper `{ content }` envelope
12. **Load** -- Extracts `artifact.content` from GET response envelope; handles 404 for new boards
13. **Empty state** -- Centered prompt with instructions when no shapes exist
14. **Neo-brutalism styling** -- Uses nb-btn, nb-tag CSS classes; black borders; hard shadows; cream background; Space Grotesk typography

## Key changes from prior version

- **Architecture rewrite**: Replaced container/edge DOM-based system with SVG shape-based drawing system
- **API contract fixed**: GET now correctly reads `json.artifact.content` from the envelope. PUT now sends `{ content: data }` wrapper.
- **New data model**: `{ shapes: [...], viewport: { x, y, zoom } }` instead of `{ containers, edges, viewport }`
- **Drawing tools added**: rect, circle, text, line, freehand (prior version only had text containers and image containers)
- **Color picker**: Stroke and fill color swatches replace the prior single-style system
- **SVG rendering**: DOM event handling per shape via `data-shape-id` attributes

## Files changed

| File | Action |
|------|--------|
| `apps/web/src/app/(authenticated)/projects/[id]/whiteboard/page.tsx` | Rewritten |
| `.docs/validation/feature-views/phase_3/user-story-report.md` | Created |
| `.adr/history/feature-views/phase_3_review.md` | Created |
| `.adr/orchestration/feature-views/primary_task_list.md` | Updated |

## Validation

24/24 user stories pass. See `.docs/validation/feature-views/phase_3/user-story-report.md`.

## Decisions

- Used SVG instead of HTML5 Canvas for easier DOM-based event handling per shape
- Shapes stored as flat array with type discriminator rather than separate arrays per type
- Freehand shapes store raw point arrays (no smoothing) for simplicity and fidelity
- Minimum shape size of 100x80 for click-only creation (no drag) to prevent invisible shapes
- Zoom range 25%-400% with 0.1 continuous steps (scroll) and 0.25 button steps
- Text editing uses foreignObject with HTML input for proper text input handling in SVG
- Auto-tool-switch: after creating a shape, tool reverts to select mode
