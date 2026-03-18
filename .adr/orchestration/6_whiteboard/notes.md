# Notes — 6_whiteboard

## Decisions
- D1: Own session — high complexity (canvas, drawing, drag mechanics, serialization)
- D2: Use HTML5 Canvas API directly (no fabric.js or konva) to match pass-1 approach
- D3: Rough.js for decorative elements only, not core drawing

## Design Fidelity
- Mode: FAITHFUL
- Canvas grid must be 30px spacing
- Toolbar must match pass-1 tool set exactly
- Sticky note colors must match pass-1 palette

## Phase 4c Notes (2026-03-17)
- D4: Sticky text overflow uses CSS overflow:hidden + text-overflow:ellipsis on the outer content div. When height < 60px, description and tags are hidden entirely to avoid partial rendering. Title always shows but truncates with "..." when too narrow.
- D5: Document media cards now show the file type emoji + file name by default (previously showed generic "CLICK TO PREVIEW" text). The card still opens the viewer modal on click.
- D6: Markdown (.md) file support added — classified as "document" type. In the viewer modal, markdown content is rendered as formatted HTML using a simple inline parser (headings, bold, italic, code, links, lists, paragraphs). No external dependency needed.
