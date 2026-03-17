# PRD — 13_v2_expansion

## Summary
V2 of IDEA-MANAGEMENT expands the application from a single-user project management tool to a collaborative, social platform. Core additions: public user profiles, an explore/discover page, real-time collaboration on projects, social graph (friends/groups), and a notification system.

## Goals
- Users can discover and explore public projects and other users
- Users can collaborate on shared projects in real time
- Users can build a social graph (friends, groups)
- Notification system keeps users informed of activity
- All new features integrate with existing auth, billing, and sync infrastructure

## Feature Areas

### 1. User Profiles (Public)
- Public profile page viewable by other users (`/users/:id`)
- Display name, bio, avatar, tags (interests/skills)
- List of user's public projects
- Activity summary (project count, contribution stats)
- Privacy controls: choose what's visible publicly

### 2. Explore Page
- Route: `/explore`
- Browse public projects with search and filtering
- Filter by tags, status, popularity, recency
- Featured/trending projects section
- User discovery: search for users by name or tags
- Category browsing for projects

### 3. Collaboration
- Real-time collaborative editing on project artifacts (kanban, whiteboard, schema, ideas)
- Presence indicators (who's online in a project)
- Project-level member management (invite, remove, change roles)
- Activity feed per project (who did what, when)
- Commenting on project artifacts

### 4. Social Graph — Friends & Groups
- Send/accept/decline friend requests
- Friends list with online status
- Create groups with name, description, avatar
- Group membership management (invite, join, leave, admin roles)
- Group-owned projects (shared workspace for teams)
- Group activity feed

### 5. Notifications
- In-app notification center (bell icon in top bar)
- Notification types: friend request, group invite, project invite, comment mention, collaboration update
- Read/unread state with bulk actions
- Email notification digest (opt-in, configurable frequency)
- Real-time push via WebSocket/SSE for in-app notifications

## Non-Goals (V2)
- Video/audio calling
- Direct messaging / chat between users
- Marketplace or paid project templates
- Mobile native app (web-responsive only)

## Success Metrics
- Users can discover at least 3 public projects within 30 seconds of visiting explore
- Collaboration latency < 500ms for sync operations
- Notification delivery < 2 seconds for in-app notifications
- Friend/group operations complete within standard API response times
