# Technical Requirements — 13_v2_expansion

## Database Schema Expansions

### Enums

```prisma
enum ProjectVisibility {
  PRIVATE
  PUBLIC
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  DECLINED
  BLOCKED
}

enum GroupMemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_ACCEPTED
  GROUP_INVITE
  PROJECT_INVITE
  COMMENT_MENTION
  COLLABORATION_UPDATE
  PROJECT_ACTIVITY
}

enum EmailDigestFrequency {
  OFF
  DAILY
  WEEKLY
}
```

### New/Modified Models

```prisma
// ── Modify existing ──

model Project {
  // ADD:
  visibility  ProjectVisibility @default(PRIVATE)
  groupId     String?
  group       Group?            @relation(fields: [groupId], references: [id])
  activities  ProjectActivity[]
  comments    Comment[]
}

model User {
  // ADD:
  emailDigestFrequency EmailDigestFrequency @default(OFF)
  friendsInitiated     Friendship[]    @relation("friendship_requester")
  friendsReceived      Friendship[]    @relation("friendship_addressee")
  groupMemberships     GroupMember[]
  notifications        Notification[]
  activities           ProjectActivity[]
  comments             Comment[]
}

// ── New models ──

model Friendship {
  id          String           @id @default(cuid())
  requesterId String
  addresseeId String
  status      FriendshipStatus @default(PENDING)

  requester User @relation("friendship_requester", fields: [requesterId], references: [id], onDelete: Cascade)
  addressee User @relation("friendship_addressee", fields: [addresseeId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([requesterId, addresseeId])
  @@index([addresseeId])
}

model Group {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  description String  @default("")
  avatarUrl   String?
  createdById String

  members  GroupMember[]
  projects Project[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model GroupMember {
  id      String          @id @default(cuid())
  groupId String
  userId  String
  role    GroupMemberRole  @default(MEMBER)

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  joinedAt DateTime @default(now())

  @@unique([groupId, userId])
  @@index([userId])
}

model Notification {
  id         String           @id @default(cuid())
  userId     String
  type       NotificationType
  title      String
  body       String           @default("")
  sourceId   String?
  sourceType String?
  read       Boolean          @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}

model ProjectActivity {
  id         String  @id @default(cuid())
  projectId  String
  actorId    String
  action     String   // e.g. "created_card", "updated_sticky", "joined_project"
  targetType String?  // e.g. "KanbanCard", "Sticky", "MediaItem"
  targetId   String?
  metadata   Json?

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  actor   User    @relation(fields: [actorId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([projectId, createdAt])
}

model Comment {
  id         String @id @default(cuid())
  userId     String
  projectId  String
  targetType String  // e.g. "KanbanCard", "Sticky", "Idea"
  targetId   String
  content    String @db.Text

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([projectId, targetType, targetId])
  @@index([userId])
}
```

## API Endpoints

### User / Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/:id` | Public profile (displayName, bio, avatar, tags, public projects) |
| GET | `/api/users?q=&tags=` | User search/discovery |

### Explore
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/explore?q=&tags=&status=&sort=` | Search public projects |
| GET | `/api/projects/explore/featured` | Trending/featured projects |

### Collaboration
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/:id/invite` | Invite user to project |
| PUT | `/api/projects/:id/members/:userId` | Update member role |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/projects/:id/activity` | Project activity feed |
| POST | `/api/projects/:id/comments` | Add comment |
| GET | `/api/projects/:id/comments?targetType=&targetId=` | List comments |

### Presence
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/presence/:projectId` | SSE stream for project presence |
| POST | `/api/presence/:projectId/heartbeat` | Heartbeat ping |

### Friends
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/friends` | List friends (with online status) |
| POST | `/api/friends/request` | Send friend request |
| PUT | `/api/friends/:id` | Accept/decline/block |
| DELETE | `/api/friends/:id` | Remove friend |

### Groups
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/groups` | List user's groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Group detail |
| PUT | `/api/groups/:id` | Update group |
| POST | `/api/groups/:id/members` | Invite/add member |
| PUT | `/api/groups/:id/members/:userId` | Update member role |
| DELETE | `/api/groups/:id/members/:userId` | Remove member |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List notifications (paginated) |
| PUT | `/api/notifications/:id/read` | Mark single as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/notifications/stream` | SSE stream for real-time notifications |

## Auth & Permissions

### Access Control Rules
- **Public profiles**: anyone authenticated can view; user controls which fields are visible
- **Private projects**: only members can access any project endpoint
- **Public projects**: anyone can view; only members can edit
- **Friend requests**: any authenticated user can send (rate-limited)
- **Groups**: only members can see group detail; admins/owner manage membership
- **Notifications**: users can only read/modify their own
- **Comments**: project members can create; own comments can be edited/deleted
- **Activity feed**: visible to project members only

### Rate Limiting
- Friend requests: max 20 per hour per user
- Project invites: max 50 per hour per project
- Comment creation: max 60 per hour per user
- Explore search: max 120 per minute per user

## Real-Time Considerations

### Presence System
- SSE-based (simpler than WebSocket, works through proxies)
- Server tracks active connections per project per user
- Heartbeat every 30 seconds; expire after 90 seconds of silence
- On disconnect: remove from presence, broadcast update to remaining members

### Notification Delivery
- Piggyback on presence SSE connection when available
- Fallback: poll `/api/notifications` every 30 seconds when SSE not connected
- Notification creation triggers SSE event to all user's active connections

### Collaboration Sync
- Existing `SyncOperation` model handles artifact-level sync
- Extend with real-time broadcast: when sync op is applied, push to all project members via SSE
- Conflict resolution: existing OT/CRDT strategy from `11_sync-and-conflicts` ADR applies

## Search & Indexing

### Project Search
- PostgreSQL full-text search on `Project.name`, `Project.description`, `Project.tags`
- GIN index on `tsvector` column for performant search
- Filter by: visibility=PUBLIC, status, tags (array overlap)
- Sort by: relevance, createdAt, member count, activity recency

### User Search
- Full-text search on `User.displayName`, `User.tags`
- GIN index on searchable fields
- Only return users who have opted into public profile visibility

## Migration Strategy
- All existing projects default to `PRIVATE` visibility
- Existing users get `emailDigestFrequency = OFF`
- No data loss — all new fields are optional or have defaults
- Run migrations in sequence: schema additions first, then indexes
