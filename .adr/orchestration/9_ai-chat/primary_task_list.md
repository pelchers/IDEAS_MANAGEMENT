# Primary Task List — 9_ai-chat

Session: AI Chat
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (ai-chat view)

---

## Phase 1 — AI Chat Frontend from Pass-1

- [ ] Read pass-1 ai-chat section from index.html, style.css, and app.js
- [ ] Build AI chat page matching pass-1 exactly:
  - Two-panel layout: session list (left) + chat thread (right)
  - Message thread with alternating user/AI styling
  - User messages: right-aligned, signal-black background, white text
  - AI messages: left-aligned, white background, signal-black text with thick border
  - Avatar circles ("JD" for user, "AI" for bot) matching pass-1 styling
  - Text input with neo-brutalist styling (thick border, monospace placeholder)
  - Send button with hard shadow, hover/active transforms
  - Enter key to send
  - Auto-scroll to latest message
- [ ] Session list with create/delete/rename sessions
- [ ] Tool action display for AI file operations

## Phase 2 — AI Chat Backend + Integration

- [ ] Verify existing AI API routes (sessions CRUD, chat endpoint)
- [ ] Wire chat to Vercel AI SDK streaming (useChat hook or custom streaming)
- [ ] Wire session list to /api/ai/sessions
- [ ] Handle "AI not configured" state (missing API key) with neo-brutalist error card
- [ ] Simulated AI response delay matching pass-1 (800ms) for placeholder when API unavailable

## Phase 3 — AI Chat Testing

- [ ] Playwright screenshots (desktop + mobile)
- [ ] User story validation: create session, send message, receive AI response, switch sessions
- [ ] Compare against pass-1 ai-chat validation PNGs
