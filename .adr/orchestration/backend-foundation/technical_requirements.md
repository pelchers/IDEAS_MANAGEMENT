# Technical Requirements

Session: backend-foundation

## Stack
- Next.js 16 (App Router) API routes
- Prisma ORM + PostgreSQL 16 (localhost:5432)
- Argon2id password hashing
- Session tokens + refresh token rotation
- Stripe billing (test mode)

## Database
- Local: `postgresql://postgres:2322@localhost:5432/idea_management`
- Schema: `apps/web/prisma/schema.prisma` (343 lines, 18 tables)
- Migrations: `npx prisma migrate dev`

## Testing Approach
- curl/fetch against live running dev server
- Every endpoint tested with valid + invalid inputs
- Auth flow tested end-to-end (signup -> signin -> authenticated request -> signout)
- Results documented in user story report
