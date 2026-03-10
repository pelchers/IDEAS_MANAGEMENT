# Product Requirements (Session Reference)

Session: feature-views

Full PRD: `.docs/planning/prd.md`
Design Concept: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/`
Technical Spec: `.docs/planning/technical-specification.md`

## Scope

Build all feature views for the app: kanban, ideas, whiteboard, schema planner, directory tree, AI chat, settings, and conflicts. Each view must match the pass-1 neo-brutalism concept exactly and wire to the backend API endpoints validated in the backend-foundation session.

## Views (10 total, 8 in this session)
1. Kanban Board — drag-drop columns and cards
2. Ideas Capture — idea cards with categories and priority
3. Whiteboard — canvas-based drawing tool
4. Schema Planner — entity-relationship diagram builder
5. Directory Tree — file/folder tree structure
6. AI Chat — conversational AI with tool actions
7. Settings — user profile, preferences, billing
8. Conflicts — sync conflict resolution with diff display

(Dashboard and Auth pages are built in frontend-shell session)

## Dependencies
- backend-foundation: All API endpoints must be working
- frontend-shell: App shell, navigation, and design system must be in place
