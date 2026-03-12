# Primary Task List — 9_ai-chat

Session: AI Chat
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (ai-chat view)

---

## Phase 1 — AI Chat Frontend from Pass-1 (FRONTEND ONLY — Completed)

> **Note:** This phase is frontend-only. Chat uses mock/hardcoded messages and simulated AI responses. No real AI provider is wired.

- [x] Read pass-1 ai-chat section from index.html, style.css, and app.js
- [x] Build AI chat page matching pass-1 exactly:
  - Message thread with alternating user/AI styling
  - User messages: right-aligned, watermelon background, white text
  - AI messages: left-aligned, white background, signal-black border with hard shadow
  - Avatar squares ("JD" for user, "AI" for bot) matching pass-1 styling
  - Text input with neo-brutalist styling (thick border, monospace placeholder)
  - Send button with hard shadow, hover/active transforms
  - Enter key to send (Shift+Enter for newline)
  - Auto-scroll to latest message
  - Connected status badge in malachite
  - Typing indicator during simulated AI response
- [x] Mock messages from pass-1 pre-populated
- [x] Simulated AI response after 800ms delay

## Phase 2 — OpenRouter AI Integration

Primary approach: **OpenRouter OAuth PKCE flow** — users connect their own OpenRouter account. All AI usage billed to the user's OpenRouter account. Supports 200+ models (OpenAI, Claude, open-source) through one API.

- [ ] Install Vercel AI SDK with OpenRouter provider (`@openrouter/ai-sdk-provider` or direct REST)
- [ ] Build OpenRouter OAuth PKCE flow:
  - Redirect user to OpenRouter authorization endpoint
  - Handle OAuth callback, exchange code for access token
  - Store user-scoped OpenRouter token securely (encrypted in DB, per-user)
  - Token refresh handling
- [ ] Add AI Configuration section in Settings view:
  - "Connect OpenRouter Account" button (primary) — initiates OAuth PKCE flow
  - "Use API Key" option (secondary/BYOK fallback) — paste OpenRouter or direct provider key
  - Display connected account status, selected model
  - Model selector (pull available models from OpenRouter API)
  - Disconnect/revoke option
- [ ] Wire chat to OpenRouter API using user's scoped token/key:
  - Streaming responses via Vercel AI SDK `useChat` hook
  - Model selection per conversation
  - Token/cost display from OpenRouter usage metadata
- [ ] Handle "no AI configured" state:
  - Show neo-brutalist prompt card directing user to Settings → AI Configuration
  - No mock/simulated responses as default behavior
- [ ] Simulated responses ONLY as error fallback when OpenRouter API is temporarily unavailable
- [ ] Wire session list to Convex (create, switch, delete chat sessions)
- [ ] Persist messages to Convex per session

## Phase 3 — AI Chat Testing

- [x] Playwright screenshots (desktop + mobile)
- [ ] Test OAuth PKCE flow end-to-end (connect, disconnect, reconnect)
- [ ] Test BYOK fallback flow (paste key, validate, chat)
- [ ] User story validation: create session, send message, receive real AI response, switch sessions
- [ ] Test "no AI configured" state renders prompt card correctly
- [ ] Test error fallback behavior when OpenRouter unavailable
- [ ] Compare against pass-1 ai-chat validation PNGs
