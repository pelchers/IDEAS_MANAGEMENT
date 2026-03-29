# Plan #2 — AI Session Management (Full Page + Popup)

**Date:** 2026-03-29
**Commit:** 6f58f5c
**Status:** Approved
**Author:** Claude + User

---

## Context

**What exists:**
- Full page: new/switch/delete/rename/search/export sessions
- Popup: NEW button (reset), EXPAND button (go to full page)

**What's missing:**
- Full page: clear session messages (keep session, wipe messages), bulk delete all sessions
- Popup: session list to view/switch past conversations, delete from popup
- Neither surface has a "delete all sessions" or "clear history" option

## Plan

### Part 1: Full Page Enhancements
- [ ] "Clear Messages" in slash commands (/clear already exists but add a button too)
- [ ] "Delete All Sessions" button in session sidebar header (with confirmation)
- [ ] Clear current session via API: DELETE messages but keep session record
- [ ] Add API endpoint: DELETE /api/ai/sessions/[id]/messages (clear messages only)

### Part 2: Popup Session List
- [ ] Add collapsible session list in popup (above quick actions area)
- [ ] Load recent sessions (last 5) from GET /api/ai/sessions
- [ ] Click to switch sessions in popup (loads messages)
- [ ] Delete session from popup (X button, small)
- [ ] "View All" link → navigates to /ai full page
- [ ] Session list only shows when there are past sessions

### Part 3: Testing
- [ ] Test clear messages on full page
- [ ] Test delete all sessions
- [ ] Test popup session list loads and switches
- [ ] Playwright screenshot of popup with session list
