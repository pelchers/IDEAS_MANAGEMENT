# Phase 3: Whiteboard

Session: feature-views
Phase: 3
Date: 2026-03-08

## Prior Phase Summary
Phase 1 completed: Kanban board built with drag-and-drop, CRUD, artifact API. 13/13 pass.

## Objective
Build the whiteboard view matching pass-1 concept. Wire to artifact CRUD endpoints.

## Tasks
1. Build whiteboard page at `apps/web/src/app/(authenticated)/projects/[id]/whiteboard/page.tsx`
2. Canvas-based whiteboard with toolbar
3. Drawing tools: rectangle, circle/ellipse, text box, line/connector, freehand
4. Tool properties: color picker (using design palette), border width
5. Canvas interactions: click to place shapes, drag to resize, click to select, drag to move
6. Pan: drag on empty canvas area to pan view
7. Zoom: scroll wheel or +/- buttons
8. Delete: select shape and press Delete or click delete button
9. Toolbar: tool selection buttons, color swatches, undo/redo (if feasible)
10. Wire to GET/PUT /api/projects/[id]/artifacts?type=whiteboard
11. Save whiteboard state (shapes array) to API
12. Load existing whiteboard on mount
13. Empty state with prompt to start drawing
14. Neo-brutalism styling for toolbar and frame

## Data Model (artifact JSON):
```json
{
  "shapes": [
    {
      "id": "shape-1",
      "type": "rect",
      "x": 100, "y": 100,
      "width": 200, "height": 150,
      "fill": "#FFE459",
      "stroke": "#282828",
      "strokeWidth": 3,
      "text": "Optional text"
    }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

## Output
- Whiteboard page component
- `.adr/history/feature-views/phase_3_review.md`
- `.docs/validation/feature-views/phase_3/user-story-report.md`
- Updated primary task list

> **ACCURACY NOTE (2026-03-12):** Tasks 3-5 were marked complete but are partially non-functional. Only freehand drawing and sticky note dragging work and save correctly. Rectangle, text box, line/connector, select, and tool property controls (color picker, border width) are non-functional. Corrected in Phase B Tier 1 remediation.
