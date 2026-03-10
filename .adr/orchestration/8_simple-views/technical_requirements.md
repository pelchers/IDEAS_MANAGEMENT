# Technical Requirements — 8_simple-views

## Key Files
- `apps/web/src/app/(authenticated)/projects/[id]/ideas/page.tsx`
- `apps/web/src/app/(authenticated)/projects/[id]/directory-tree/page.tsx`
- `apps/web/src/app/(authenticated)/settings/page.tsx`

## API Contracts
- Ideas: GET/PUT /api/projects/[id]/artifacts/ideas/ideas
- Directory Tree: GET/PUT /api/projects/[id]/artifacts/directory-tree/tree.plan
- Settings: GET /api/auth/me, POST /api/billing/portal
