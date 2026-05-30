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
- [ ] Create `Notification` model (userId, type, title, body, sourceId, sourceType, read, timestamps)
- [ ] Notification creation service (called from friend requests, invites, comments, etc.)
- [ ] Notification API: list (`GET /api/notifications`), mark read (`PUT /api/notifications/:id/read`), mark all read
- [ ] Real-time notification delivery via SSE/WebSocket (reuse presence connection)

### 4b. Notification UI
- [ ] Bell icon in top bar with unread count badge
- [ ] Notification dropdown/panel with list of notifications
- [ ] Click-through navigation (notification → relevant page)
- [ ] Bulk actions: mark all read, dismiss all
- [ ] Empty state when no notifications

### 4c. Email Notifications
- [ ] Email digest preference in user settings (OFF, DAILY, WEEKLY)
- [ ] Email template for notification digest
- [ ] Cron job / scheduled task to send digests
- [ ] Unsubscribe link in emails

## Phase 5 — Hardening & Re-Release

- [ ] Full E2E test suite for all new features
- [ ] Security audit: access control on all new endpoints (can't view private projects, can't modify others' profiles)
- [ ] Performance testing: explore page with 100+ projects, notification queries with 1000+ rows
- [ ] Rate limiting on social endpoints (friend requests, invites)
- [ ] Migration guide for existing users (all existing projects default to PRIVATE)
- [ ] Update onboarding flow to prompt for profile setup
- [ ] Visual QA pass on all new views
- [ ] User acceptance testing
