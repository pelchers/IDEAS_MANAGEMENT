# Session Notes

Session: feature-views
Date: 2026-03-07

## Context
After the backend is validated and the app shell is built, this session builds all 8 remaining feature views. Each view is wired to real API endpoints and styled to match pass-1 exactly.

## Known Issues
- Current feature view pages exist but are surface-level restyled, not matching pass-1
- Whiteboard will need a canvas library or custom canvas implementation
- AI chat streaming may need SSE or polling depending on backend implementation
- Drag-and-drop for kanban needs a library (e.g., @dnd-kit) or custom implementation

## Dependencies
- backend-foundation must complete before wiring views to APIs
- frontend-shell must complete before building feature views (design system + shell needed)
