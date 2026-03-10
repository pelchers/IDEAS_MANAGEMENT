# Technical Requirements — 1_project-init

## Stack
- pnpm 10.x + Turbo monorepo
- Next.js 16.x (App Router)
- React 19.x + TypeScript 5.x
- Tailwind CSS 4.x
- Prisma 6.x + PostgreSQL 16
- Additional: chart.js, sortablejs, roughjs (for pass-1 faithful conversion)

## File Structure
```
apps/web/
├── src/app/
│   ├── api/          ← KEEP all API routes
│   ├── layout.tsx    ← KEEP root layout
│   ├── page.tsx      ← KEEP landing page
│   ├── globals.css   ← REMOVE (rebuild in session 2)
│   ├── signin/       ← REMOVE (rebuild in session 3)
│   ├── signup/       ← REMOVE (rebuild in session 3)
│   └── (authenticated)/  ← REMOVE all contents (rebuild in sessions 2-9)
├── src/components/   ← REMOVE shell/ (rebuild in session 2), keep ai/ components
├── prisma/           ← KEEP
└── package.json      ← UPDATE with new deps
```

## Validation
- Dev server starts
- API health check passes
- No TypeScript errors from remaining code
