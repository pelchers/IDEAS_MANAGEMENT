# Primary Task List — 13_v2_expansion

Session: V2 Expansion
Started: 2026-03-17
Depends on: W2 profile fields (completed — displayName, bio, avatarUrl, tags on User model)

---

## Phase 1 — Profiles & Explore

### 1a. Public User Profiles
- [x] Add `ProjectVisibility` enum (PRIVATE, PUBLIC) to Project model
- [x] Add `visibility` field to Project (default PRIVATE)
- [x] Create public profile route `/users/[id]/page.tsx`
- [x] Fetch user by ID with public projects list
- [x] Display: avatar, display name, bio, tags, public projects
- [x] Privacy controls: API to toggle which fields are public
- [x] Add user search API endpoint (`GET /api/users?q=...&tags=...`)

### 1b. Explore Page
- [x] Create `/explore/page.tsx` route
- [x] Add explore nav link to app-shell (between AI Chat and Settings)
- [x] Build project search API (`GET /api/projects/explore?q=...&tags=...&status=...&sort=...`)
- [x] Implement project card grid with search bar and tag filters
- [x] Add featured/trending section (most members, recent activity)
- [x] Add user discovery section (search by name/tags)
- [x] Responsive layout: grid adapts from 1 to 3 columns

## Phase 2 — Collaboration

### 2a. Project Member Management
- [x] Extend project settings UI with member management panel
- [x] Create invite API (`POST /api/projects/:id/invite`) — by email or user ID
- [x] Create invitation acceptance flow
- [x] Role management: owner can change member roles (EDITOR, VIEWER)
- [x] Remove member API (`DELETE /api/projects/:id/members/:userId`)
- [x] Show member avatars/names in project workspace header

### 2b. Real-Time Presence
- [x] Add presence system (SSE or WebSocket endpoint)
- [x] Track which users are active in which project
- [x] Display presence indicators (colored dots + avatar list) in project header
- [x] Auto-expire stale presence (5-minute heartbeat timeout)

### 2c. Activity Feed & Comments
- [x] Create `ProjectActivity` model (actorId, action, targetType, targetId, metadata, timestamp)
- [x] Log activity on: artifact create/update/delete, member join/leave, settings change
- [x] Create activity feed API (`GET /api/projects/:id/activity`)
- [x] Build activity feed UI component (timeline style, brutalist)
- [x] Create `Comment` model (userId, targetType, targetId, content, timestamp)
- [x] Add comment UI to kanban cards, whiteboard stickies, ideas
- [x] @mention support in comments (parse `@displayName`, link to profile)

## Phase 3 — Social Graph (Friends & Groups)

### 3a. Friend System
- [x] Create `Friendship` model (requesterId, addresseeId, status: PENDING/ACCEPTED/DECLINED/BLOCKED, timestamps)
- [x] Friend request API: send (`POST /api/friends/request`), accept/decline (`PUT /api/friends/:id`)
- [x] Friends list API (`GET /api/friends`) — friends/incoming/outgoing/blocked groupings
  - [ ] Online status from presence system — DEFERRED: presence is per-project (no global user-online tracker yet); revisit in Phase 4 alongside notifications/global SSE
- [x] Friends list UI in dedicated `/friends` route
- [x] Block/unblock user functionality
- [x] Mutual friends display on public profiles

### 3b. Groups
- [x] Create `Group` model (name, slug, description, avatarUrl, createdById, timestamps)
- [x] Create `GroupMember` model (groupId, userId, role: OWNER/ADMIN/MEMBER, status active/pending)
- [x] Group CRUD API (`/api/groups`)
- [x] Group member management (invite, join request, approve, remove, role change)
- [x] Group page route (`/groups/[id]`) with member list and shared projects
- [x] Create group UI — name, description (avatar field in schema, upload UI deferred)
- [x] Link projects to groups (optional `groupId` on Project)
- [ ] Group activity feed — DEFERRED: requires a GroupActivity model or cross-project aggregation; revisit in Phase 4

## Phase 4 — Notifications

### 4a. Notification Infrastructure
- [x] Create `Notification` model (userId, type, title, body, sourceId, sourceType, linkPath, read, timestamps)
- [x] Notification creation service (wired into friend requests/accept, project invites, comment @mentions, group join/invite/approve)
- [x] Notification API: list (`GET /api/notifications`), mark read (`PUT /api/notifications/:id/read`), mark all read (`POST /api/notifications/read-all`), dismiss all (`DELETE`)
- [x] Real-time notification delivery via SSE (`GET /api/notifications/stream`) with in-memory pub/sub bus

### 4b. Notification UI
- [x] Bell icon in top bar with unread count badge
- [x] Notification dropdown/panel with list of notifications
- [x] Click-through navigation (notification → linkPath)
- [x] Bulk actions: mark all read, dismiss all
- [x] Empty state when no notifications

### 4c. Email Notifications
- [x] Email digest preference in user settings (OFF, DAILY, WEEKLY)
- [x] Email template for notification digest (HTML + text)
- [x] Cron-ready digest send endpoint (`POST /api/notifications/digest`, CRON_SECRET-protected)
  - [ ] Actual email send STUBBED (logged) — no email provider configured. Wire Resend/SES/Postmark when keys exist (same gap as existing email-verification stub)
- [x] Unsubscribe link/endpoint (`GET /api/notifications/unsubscribe?token=`)

## Phase 5 — Hardening & Re-Release

- [x] Full E2E test suite for all new features — phase1-4 specs pass together (4/4); fixed networkidle→domcontentloaded for the always-on notification SSE
- [x] Security audit: access control on all new endpoints — 3 issues found + fixed (1 critical, 1 high, 1 medium); report at `.docs/audits/v2-security-audit-2026-05-30.md`
- [x] Performance: index coverage review — added `[visibility, createdAt]` composite for explore; report at `.docs/audits/v2-performance-review-2026-05-30.md`
- [x] Rate limiting on social endpoints — 20/min/user on friend requests, invites, group create/join, comments
- [x] Migration guide for existing users — `.docs/V2-MIGRATION-GUIDE.md`
- [x] Update onboarding flow to prompt for profile setup — `ProfileSetupBanner` on dashboard
- [x] Visual QA pass on all new views — screenshots across phase1-5 validation folders
- [ ] User acceptance testing — DEFERRED: requires real users / product owner sign-off (out of automated scope)

---

## V2 Expansion — STATUS

Phases 1–5 implementation complete. Remaining deferred items (documented above):
- Friends online-status + group activity feed (need global presence/aggregation) — Phase 3
- Actual digest **email send** (no provider/API keys; everything else built) — Phase 4
- User acceptance testing (needs real users) — Phase 5
