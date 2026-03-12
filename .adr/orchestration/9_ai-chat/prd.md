# PRD — 9_ai-chat

## Summary
Build the AI chat interface as a faithful pass-1 conversion with two-panel layout, message threading, and real AI integration via OpenRouter.

## AI Provider Strategy
- **Primary:** OpenRouter OAuth PKCE flow — users connect their own OpenRouter account
- **Secondary:** BYOK (Bring Your Own Key) — users paste an OpenRouter or direct provider API key
- **No mock responses by default** — always real AI integration when configured
- **Error fallback only:** simulated responses shown only when the AI service is temporarily unavailable

## Why OpenRouter
- Single integration covers 200+ models (OpenAI GPT-4o, Claude, Llama, Mistral, etc.)
- Users pay for their own AI usage via their OpenRouter account — no AI cost burden on the app
- OAuth PKCE flow provides secure, user-friendly account linking (no manual key copying)
- Model marketplace lets users choose price/performance tradeoffs

## Goals
- Chat layout matching pass-1 (session list + message thread)
- Message styling matching pass-1 (user right-aligned dark, AI left-aligned light)
- Streaming responses via Vercel AI SDK with OpenRouter provider
- Session management (create, switch, delete) persisted to Convex
- AI Configuration UI in Settings (OAuth connect + BYOK fallback)
- "No AI configured" state with clear call-to-action

## Key Reference
- Pass-1 AI chat: alternating message bubbles, avatar circles, text input with send button
