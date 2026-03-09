# Phase 6: AI Chat

Session: feature-views
Phase: 6
Date: 2026-03-08

## Objective
Build the AI chat view matching pass-1 concept. Wire to AI session and message endpoints.

## Tasks
1. Build AI chat page at `apps/web/src/app/(authenticated)/ai/page.tsx`
2. Chat interface: message list with user/assistant message bubbles
3. Session management: create new session, list existing sessions, switch between sessions
4. Message input: text input at bottom with send button
5. Message display: user messages right-aligned, assistant messages left-aligned
6. Streaming display: show assistant response as it arrives (or simulate with loading dots if no AI key)
7. Tool action buttons: add_idea, update_kanban, generate_tree, create_project_structure (visual only if AI not configured)
8. Wire to GET/POST /api/ai/sessions for session CRUD
9. Wire to GET /api/ai/sessions/[id] for session with messages
10. Wire to POST /api/ai/chat for sending messages
11. Handle missing AI API key gracefully (show "AI not configured" message)
12. Empty state: "Start a new conversation" prompt
13. Neo-brutalism styling for chat bubbles, input, session list

## Data Flow:
- List sessions: GET /api/ai/sessions
- Create session: POST /api/ai/sessions { title }
- Get messages: GET /api/ai/sessions/{id}
- Send message: POST /api/ai/chat { sessionId, messages: [{role, content}] }
- Delete session: DELETE /api/ai/sessions/{id}

## Output
- AI chat page component
- `.adr/history/feature-views/phase_6_review.md`
- `.docs/validation/feature-views/phase_6/user-story-report.md`
- Updated primary task list
