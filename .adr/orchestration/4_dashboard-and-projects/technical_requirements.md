# Technical Requirements — 4_dashboard-and-projects

## Libraries
- chart.js — for weekly activity bar chart (same as pass-1)
- react-chartjs-2 — React wrapper for Chart.js

## Key Files
- `apps/web/src/app/(authenticated)/dashboard/page.tsx`
- `apps/web/src/app/(authenticated)/projects/page.tsx` (if needed)
- `apps/web/src/app/(authenticated)/projects/[id]/page.tsx`

## API Endpoints Used
- GET /api/projects — list projects
- POST /api/projects — create project
- GET /api/projects/[id] — project detail
