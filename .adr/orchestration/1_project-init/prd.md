# PRD — 1_project-init

## Summary
Initialize the project for a faithful rebuild: verify monorepo structure, ensure all dependencies are installed (including pass-1 libraries: Chart.js, SortableJS, Rough.js), clean up the deprecated frontend, and confirm the backend API layer still works.

## Goals
- Clean monorepo with all required deps
- PostgreSQL database with current schema
- All API routes functional post-cleanup
- Frontend cleared for fresh pass-1 faithful conversion

## Non-Goals
- No new frontend code (that's session 2+)
- No backend changes (existing APIs are correct)

## Success Criteria
- `pnpm install` succeeds
- `npx prisma migrate deploy` succeeds
- `npx next dev` starts without errors
- All `/api/health` endpoint responds 200
- No deprecated frontend pages remain
