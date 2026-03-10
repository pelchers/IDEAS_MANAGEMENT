# Technical Requirements — 9_ai-chat

## Libraries
- ai (Vercel AI SDK) — already installed
- @ai-sdk/openai — already installed
- @ai-sdk/react — already installed

## Key Files
- `apps/web/src/app/(authenticated)/ai/page.tsx`
- `apps/web/src/app/api/ai/chat/route.ts` (existing)
- `apps/web/src/app/api/ai/sessions/route.ts` (existing)

## API Contracts
- GET /api/ai/sessions — list sessions
- POST /api/ai/sessions — create session
- POST /api/ai/chat — streaming chat (Vercel AI SDK format)
