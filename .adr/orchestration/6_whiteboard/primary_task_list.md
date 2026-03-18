# Primary Task List — 6_whiteboard

Session: Whiteboard
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (whiteboard view)

---

## Phase 1 — Whiteboard Frontend from Pass-1

- [x] Read pass-1 whiteboard section from index.html, style.css, and app.js
- [x] Build whiteboard page matching pass-1 exactly:
  - HTML5 canvas with grid background (30px spacing)
  - Drawing toolbar: Select, Draw, Rect, Text, Sticky tools
  - Freehand drawing mode with crosshair cursor, 3px line width
  - Sticky notes in 4 colors (lemon, watermelon, malachite, amethyst)
  - Sticky note dragging with z-index manipulation and rotation during drag
- [x] Canvas resize handling (responsive to window size)
- [x] Tool selection state management
- [ ] Implement rectangle tool — cursor changes but no shape drawn
- [ ] Implement text tool — cursor changes but no text placement
- [ ] Implement select tool for moving shapes (freehand paths, rectangles, etc.)
- [ ] Implement connecting lines/dots tool
- [ ] Add new sticky note button (currently only pre-existing stickies work)

## Phase 1 — Screenshots

- [x] Playwright screenshots (desktop + mobile)
- [x] Screenshots saved to `.docs/validation/6_whiteboard/screenshots/`

## Phase 2 — Whiteboard Backend + Integration ✅

- [x] Wire whiteboard to artifact API (GET/PUT /api/projects/[id]/artifacts/whiteboard/board)
- [x] Serialize canvas state (drawings, sticky notes, positions) to JSON
- [x] Implement auto-save on changes (paths and stickies)
- [x] Handle loading/error states
- [x] Fix path format normalization (old flat arrays vs new {points,color,width})
- [x] Remove mock stickies, start empty
- [x] Sticky CRUD: add by clicking canvas, double-click to edit, hover delete
- [x] Sticky color picker in toolbar

## Phase 3 — Whiteboard Tools + Sticky Settings (2026-03-16) ✅

- [x] Eraser tool: proper eraser icon (⌫), targeted stroke removal (click a drawn line to remove just that stroke, not the whole canvas). Lines tracked independently with hit detection
- [x] Straight line tool: slash icon + click-drag to draw straight lines with dashed preview
- [x] Dot/pin tool: filled circle icon, places dots/pins on the board at click position
- [x] Sticky note settings popup: clicking gear on a sticky opens a popup with editable fields (title, description, tags, background color, border color). Popup container bg/border matches the clicked sticky's colors
- [x] Sticky text color: auto-adaptive white/black based on background (no manual setting)
- [x] Remove unused rect/text tool stubs

## Phase 4 — Media Attachments + Resizable Content (2026-03-16) ✅

- [x] Media tool: attachment icon (paperclip) in toolbar, opens native file picker
- [x] Image support: images display directly on canvas at drop position, stored as data URL in artifact
- [x] Video support: videos display directly on canvas with native player controls
- [x] Document support: PDF/DOCX/etc show as mini card with file title + icon on canvas; click opens a media viewer modal with file preview
- [x] All canvas content resizable from corners (Photoshop-style):
  - Sticky notes: corner drag handles to resize width/height
  - Images: corner drag handles maintaining aspect ratio
  - Videos: corner drag handles maintaining aspect ratio
  - Document cards: corner drag handles to resize
- [x] Width/height persisted per element in artifact API
- [x] Media viewer modal: full-size preview for images, video player for video, PDF render for documents
- [x] Size limit warning for large files (data URL storage)

## Phase 4b — Media & Select Tool Fixes (2026-03-17) ✅

- [x] Fix media aspect ratio: imported images use natural width/height ratio, longest side max 400px
- [x] Change media resize to independent width/height: removed aspect-ratio lock for images/videos
- [x] Fix hover action buttons clipped by overflow on media items
- [x] Select tool: click a drawn freehand stroke, straight line, or dot to select it (dashed bounding box indicator)
- [x] Select tool: drag selected drawn elements to reposition (offsetX/offsetY tracking)
- [x] Select tool: resize selected drawn elements via drag handle (uniform scale relative to bbox center)
- [x] Persist moved/resized drawn element positions in artifact save (offsetX/offsetY fields)

## Phase 4c — Content Overflow, Document Cards & Markdown Preview (2026-03-17)

- [x] Sticky notes: graceful text overflow on small resize — hide content that doesn't fit, show "..." for title when width < ~80px, hide description/tags entirely when height < ~60px
- [x] Document media items: show page emoji + file name on the card (instead of generic "click to preview"), matching the document card layout for all document types
- [x] Add `.md` to MEDIA_EXTENSIONS and file input accept list so markdown files can be attached
- [x] Add `getDocIcon` mapping for `.md` files (memo icon)
- [x] Markdown viewer in media preview modal: render `.md` file content as formatted HTML (basic inline renderer)

## Phase 5 — Whiteboard Testing

- [ ] User story validation: draw on canvas, add sticky note, drag sticky note, switch tools, add media, resize elements
- [ ] Compare against pass-1 whiteboard validation PNGs
