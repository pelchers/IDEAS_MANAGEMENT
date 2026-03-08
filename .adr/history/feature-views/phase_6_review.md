# Phase 6 Review: AI Chat

Session: feature-views
Phase: 6
Date: 2026-03-08
Status: Complete

## What was built

Rewrote `apps/web/src/app/(authenticated)/ai/page.tsx` to deliver a fully functional AI chat view with neo-brutalist styling:

1. **Two-panel layout** -- Session list sidebar on left (260px), chat area on right
2. **Session list** -- Lists all sessions with title and message count, click to switch, active session highlighted with blue background and thick border
3. **Create session** -- "+ NEW" button in session sidebar header creates a new conversation
4. **Delete session** -- Two-click confirmation (click X shows "CONFIRM?", second click deletes)
5. **Message display** -- User messages right-aligned with "U" avatar, assistant messages left-aligned with "AI" avatar
6. **Chat bubbles** -- Neo-brutalist styling using globals.css classes (chat-msg, chat-bubble, chat-avatar) with black borders and hard shadows
7. **Message input** -- Brutalist textarea with mono font, Enter to send, Shift+Enter for new line
8. **Send button** -- "SEND" with arrow icon, brutalist primary button styling
9. **Auto-scroll** -- Scrolls to bottom on new messages using useEffect + ref
10. **Loading indicator** -- "Thinking..." in AI bubble while streaming
11. **Tool action buttons** -- ADD IDEA, UPDATE KANBAN, GENERATE TREE, CREATE STRUCTURE buttons below messages
12. **Tool invocation display** -- Tool calls in messages show name, status (RUNNING/COMPLETED), expandable parameters and results
13. **AI not configured handling** -- 503 error shows warning icon with "Set OPENAI_API_KEY" message
14. **Error display** -- General errors shown in red warning bar
15. **Empty state** -- Brutalist AI icon, "START A NEW CONVERSATION" heading, capability description, + NEW CHAT button
16. **Entitlement gating** -- Users without ai_chat feature see upgrade prompt with link to billing checkout
17. **Streaming** -- Uses AI SDK useChat with DefaultChatTransport for streaming responses
18. **Chat status** -- "CONNECTED" indicator in view header with accent styling

## Key changes from prior version

- **Removed inline style objects**: Replaced all inline `styles` record objects with globals.css brutalist CSS classes (chat-container, chat-messages, chat-msg, chat-bubble, chat-avatar, chat-input, chat-input-area, chat-send-btn)
- **Consolidated into single file**: Moved all component logic into page.tsx instead of separate component files (ChatMessageList, ChatInput, SessionList, ProjectSelector, UpgradePrompt, ToolCallDisplay)
- **Added tool action buttons**: Four brutalist buttons for triggering AI tools visually
- **Added two-click delete confirmation**: Session deletion requires confirmation click
- **Added AI not configured handling**: Detects 503/ai_not_configured errors and shows clear instructions
- **Added empty states**: Both session list and message area have proper empty states
- **Removed ProjectSelector**: Simplified by removing the separate project context selector (project ID handling remains in API layer)
- **Applied brutalist styling throughout**: All elements use CSS variables, font-heading, font-mono, border-thick, shadow-brutal etc.

## Files changed

| File | Action |
|------|--------|
| `apps/web/src/app/(authenticated)/ai/page.tsx` | Rewritten |
| `.docs/validation/feature-views/phase_6/user-story-report.md` | Created |
| `.adr/history/feature-views/phase_6_review.md` | Created |
| `.adr/orchestration/feature-views/primary_task_list.md` | Updated |

## Validation

45/45 user stories pass. See `.docs/validation/feature-views/phase_6/user-story-report.md`.

## Decisions

- Consolidated all AI chat components into single page.tsx for simplicity and consistency with other phase implementations
- Used globals.css chat-* classes directly instead of inline style objects for proper brutalist styling
- Tool action buttons send natural language messages requesting tool use (e.g., "Please use the Add Idea tool") rather than direct API calls
- Two-click delete confirmation pattern matches schema planner's entity delete UX
- Removed ProjectSelector to simplify the UI; project context is handled at API level
- Session sidebar width set to 260px with min-width 220px for responsive behavior
- AI not configured state is tracked via component state, reset on new session or new message
