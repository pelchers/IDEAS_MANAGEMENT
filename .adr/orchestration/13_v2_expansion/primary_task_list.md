# Primary Task List — 13_v2_expansion

Session: V2 Expansion
Started: 2026-03-17
Depends on: W2 profile fields (completed — displayName, bio, avatarUrl, tags on User model)

---

## Phase 1 — Profiles & Explore

### 1a. Public User Profiles
- [ ] Add `ProjectVisibility` enum (PRIVATE, PUBLIC) to Project model
- [ ] Add `visibility` field to Project (default PRIVATE)
- [ ] Create public profile route `/users/[id]/page.tsx`
- [ ] Fetch user by ID with public projects list
- [ ] Display: avatar, display name, bio, tags, public projects
- [ ] Privacy controls: API to toggle which fields are public
- [ ] Add user search API endpoint (`GET /api/users?q=...&tags=...`)

### 1b. Explore Page
- [ ] Create `/explore/page.tsx` route
- [ ] Add explore nav link to app-shell (between AI Chat and Settings)
- [ ] Build project search API (`GET /api/projects/explore?q=...&tags=...&status=...&sort=...`)
- [ ] Implement project card grid with search bar and tag filters
- [ ] Add featured/trending section (most members, recent activity)
- [ ] Add user discovery section (search by name/tags)
- [ ] Responsive layout: grid adapts from 1 to 3 columns

## Phase 2 — Collaboration

### 2a. Project Member Management
- [ ] Extend project settings UI with member management panel
- [ ] Create invite API (`POST /api/projects/:id/invite`) — by email or user ID
- [ ] Create invitation acceptance flow
- [ ] Role management: owner can change member roles (EDITOR, VIEWER)
- [ ] Remove member API (`DELETE /api/projects/:id/members/:userId`)
- [ ] Show member avatars/names in project workspace header

### 2b. Real-Time Presence
- [ ] Add presence system (SSE or WebSocket endpoint)
- [ ] Track which users are active in which project
- [ ] Display presence indicators (colored dots + avatar list) in project header
- [ ] Auto-expire stale presence (5-minute heartbeat timeout)

### 2c. Activity Feed & Comments
- [ ] Create `ProjectActivity` model (actorId, action, targetType, targetId, metadata, timestamp)
- [ ] Log activity on: artifact create/update/delete, member join/leave, settings change
- [ ] Create activity feed API (`GET /api/projects/:id/activity`)
- [ ] Build activity feed UI component (timeline style, brutalist)
- [ ] Create `Comment` model (userId, targetType, targetId, content, timestamp)
- [ ] Add comment UI to kanban cards, whiteboard stickies, ideas
- [ ] @mention support in comments (parse `@displayName`, link to profile)

## Phase 3 — Social Graph (Friends & Groups)

### 3a. Friend System
- [ ] Create `Friendship` model (requesterId, addresseeId, status: PENDING/ACCEPTED/DECLINED/BLOCKED, timestamps)
- [ ] Friend request API: send (`POST /api/friends/request`), accept/decline (`PUT /api/friends/:id`)
- [ ] Friends list API (`GET /api/friends`) with online status from presence system
- [ ] Friends list UI in sidebar or dedicated `/friends` route
- [ ] Block/unblock user functionality
- [ ] Mutual friends display on public profiles

### 3b. Groups
- [ ] Create `Group` model (name, slug, description, avatarUrl, createdById, timestamps)
- [ ] Create `GroupMember` model (groupId, userId, role: OWNER/ADMIN/MEMBER, joinedAt)
- [ ] Group CRUD API (`/api/groups`)
- [ ] Group member management (invite, join request, approve, remove)
- [ ] Group page route (`/groups/[id]`) with member list and shared projects
- [ ] Create group UI — name, description, avatar
- [ ] Link projects to groups (optional `groupId` on Project)
- [ ] Group activity feed

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
