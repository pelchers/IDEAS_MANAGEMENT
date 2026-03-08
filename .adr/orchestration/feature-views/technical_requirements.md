# Technical Requirements

Session: feature-views

## Stack
- Next.js 16 (App Router) with TypeScript
- Neo-brutalism design system from globals.css (built in frontend-shell session)
- React client components with useState/useEffect for interactivity
- Fetch API for backend communication (credentials: "include")

## File Structure
All views live under `apps/web/src/app/projects/[id]/`:
- `kanban/page.tsx`
- `ideas/page.tsx`
- `whiteboard/page.tsx`
- `schema/page.tsx`
- `directory-tree/page.tsx`
- `conflicts/page.tsx`

Standalone views:
- `apps/web/src/app/ai/page.tsx`
- `apps/web/src/app/settings/page.tsx` (if exists, or create)

## API Endpoints Used
- `GET/PUT /api/projects/[id]/artifacts?type=<type>` — artifact CRUD
- `GET/POST /api/ai/sessions` — AI chat sessions
- `GET/POST /api/ai/sessions/[id]/messages` — AI messages
- `POST /api/ai/sessions/[id]/tool-action` — AI tool actions
- `GET/POST /api/sync/conflicts` — conflict resolution
- `GET/PUT /api/users/me` — user profile/settings

## Validation
- Playwright screenshots for each view (desktop + mobile)
- User story tests against live dev server
- Each view must handle empty state, loading state, and populated state
