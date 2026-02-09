# Advanced Convex Schema Patterns

## Table of Contents

- [Schema Migrations](#schema-migrations)
- [Circular References](#circular-references)
- [Soft Deletes](#soft-deletes)
- [Audit Trails](#audit-trails)
- [Multi-Tenancy](#multi-tenancy)
- [Versioning](#versioning)
- [Polymorphic Associations](#polymorphic-associations)
- [Time-Series Data](#time-series-data)
- [Staged Indexes](#staged-indexes)

---

## Schema Migrations

### Adding New Fields

New optional fields are backward compatible:

```typescript
// Before
profiles: defineTable({
  userId: v.string(),
  displayName: v.string(),
}),

// After - safe migration
profiles: defineTable({
  userId: v.string(),
  displayName: v.string(),
  bio: v.optional(v.string()),  // New optional field
  website: v.optional(v.string()),
}),
```

### Changing Required Fields

Use optional fields + backfill mutation:

```typescript
// Step 1: Make field optional
profiles: defineTable({
  userId: v.string(),
  displayName: v.string(),
  slug: v.optional(v.string()),  // Changed from required
}),

// Step 2: Backfill mutation
export const backfillSlugs = internalMutation({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    for (const profile of profiles) {
      if (!profile.slug) {
        await ctx.db.patch(profile._id, {
          slug: generateSlug(profile.displayName),
        });
      }
    }
  },
});

// Step 3: After backfill, make required (deploy new schema)
profiles: defineTable({
  userId: v.string(),
  displayName: v.string(),
  slug: v.string(),  // Now required
}),
```

### Renaming Fields

Use two-phase migration:

```typescript
// Phase 1: Add new field, keep old field
profiles: defineTable({
  userId: v.string(),
  name: v.optional(v.string()),  // Old field
  displayName: v.optional(v.string()),  // New field
}),

// Backfill migration
export const migrateNameToDisplayName = internalMutation({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    for (const profile of profiles) {
      if (profile.name && !profile.displayName) {
        await ctx.db.patch(profile._id, {
          displayName: profile.name,
        });
      }
    }
  },
});

// Phase 2: Remove old field (after all code uses new field)
profiles: defineTable({
  userId: v.string(),
  displayName: v.string(),  // Only new field
}),
```

---

## Circular References

### Pattern: Nullable References

```typescript
users: defineTable({
  name: v.string(),
  preferencesId: v.union(v.id("preferences"), v.null()),
}),
preferences: defineTable({
  userId: v.union(v.id("users"), v.null()),
  theme: v.string(),
}),

// Usage
const prefsId = await ctx.db.insert("preferences", {
  userId: null,
  theme: "dark",
});

const userId = await ctx.db.insert("users", {
  name: "John",
  preferencesId: prefsId,
});

await ctx.db.patch(prefsId, { userId });
```

### Pattern: Separate Join Table

```typescript
users: defineTable({
  name: v.string(),
}),
preferences: defineTable({
  theme: v.string(),
}),
userPreferences: defineTable({
  userId: v.id("users"),
  preferencesId: v.id("preferences"),
})
  .index("by_user", ["userId"])
  .index("by_preferences", ["preferencesId"]),
```

---

## Soft Deletes

### Pattern: Boolean Flag

```typescript
profiles: defineTable({
  userId: v.string(),
  displayName: v.string(),
  isDeleted: v.boolean(),
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
})
  .index("by_user_deleted", ["userId", "isDeleted"]),

// Soft delete mutation
export const softDeleteProfile = mutation({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(profileId, {
      isDeleted: true,
      deletedAt: Date.now(),
      deletedBy: user._id,
    });
  },
});

// Query active profiles
export const getActiveProfiles = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user_deleted", q =>
        q.eq("userId", userId).eq("isDeleted", false)
      )
      .collect();
  },
});
```

---

## Audit Trails

### Pattern: Audit Log Table

```typescript
auditLogs: defineTable({
  entityType: v.string(),
  entityId: v.string(),
  action: v.union(
    v.literal("CREATE"),
    v.literal("UPDATE"),
    v.literal("DELETE")
  ),
  userId: v.string(),
  changes: v.optional(
    v.object({
      before: v.any(),
      after: v.any(),
    })
  ),
  timestamp: v.number(),
})
  .index("by_entity", ["entityType", "entityId"])
  .index("by_user_time", ["userId", "timestamp"])
  .index("by_action_time", ["action", "timestamp"]),

// Usage in mutation
export const updateProfile = mutation({
  args: { profileId: v.id("profiles"), updates: v.any() },
  handler: async (ctx, { profileId, updates }) => {
    const user = await getCurrentUser(ctx);
    const before = await ctx.db.get(profileId);

    await ctx.db.patch(profileId, updates);

    await ctx.db.insert("auditLogs", {
      entityType: "PROFILE",
      entityId: profileId,
      action: "UPDATE",
      userId: user._id,
      changes: { before, after: { ...before, ...updates } },
      timestamp: Date.now(),
    });
  },
});
```

---

## Multi-Tenancy

### Pattern: Organization-Scoped Data

```typescript
organizations: defineTable({
  name: v.string(),
  slug: v.string(),
  ownerId: v.string(),
})
  .index("by_slug", ["slug"])
  .index("by_owner", ["ownerId"]),

workspaces: defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  slug: v.string(),
})
  .index("by_org", ["organizationId"])
  .index("by_org_slug", ["organizationId", "slug"]),

profiles: defineTable({
  organizationId: v.id("organizations"),
  workspaceId: v.optional(v.id("workspaces")),
  userId: v.string(),
  slug: v.string(),
})
  .index("by_org_workspace", ["organizationId", "workspaceId"])
  .index("by_org_user", ["organizationId", "userId"]),

// Query with org scope
export const getOrgProfiles = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_org_workspace", q =>
        q.eq("organizationId", organizationId)
      )
      .collect();
  },
});
```

---

## Versioning

### Pattern: Document Versioning

```typescript
documents: defineTable({
  currentVersionId: v.id("documentVersions"),
  title: v.string(),
})
  .index("by_current_version", ["currentVersionId"]),

documentVersions: defineTable({
  documentId: v.id("documents"),
  versionNumber: v.number(),
  content: v.string(),
  createdBy: v.string(),
  timestamp: v.number(),
})
  .index("by_document_version", ["documentId", "versionNumber"])
  .index("by_document_time", ["documentId", "timestamp"]),

// Create new version
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  handler: async (ctx, { documentId, content }) => {
    const user = await getCurrentUser(ctx);
    const doc = await ctx.db.get(documentId);

    // Get latest version number
    const versions = await ctx.db
      .query("documentVersions")
      .withIndex("by_document_version", q =>
        q.eq("documentId", documentId)
      )
      .order("desc")
      .take(1);

    const nextVersion = (versions[0]?.versionNumber ?? 0) + 1;

    const versionId = await ctx.db.insert("documentVersions", {
      documentId,
      versionNumber: nextVersion,
      content,
      createdBy: user._id,
      timestamp: Date.now(),
    });

    await ctx.db.patch(documentId, { currentVersionId: versionId });
  },
});
```

---

## Polymorphic Associations

### Pattern: Type Discriminator

```typescript
notifications: defineTable({
  userId: v.string(),
  type: v.union(
    v.literal("PROFILE_UPDATE"),
    v.literal("NEW_FOLLOWER"),
    v.literal("LINK_CLICK")
  ),
  read: v.boolean(),

  // Type-specific fields (all optional)
  profileId: v.optional(v.id("profiles")),
  followerId: v.optional(v.string()),
  linkId: v.optional(v.id("links")),
  clickCount: v.optional(v.number()),

  timestamp: v.number(),
})
  .index("by_user_read", ["userId", "read"])
  .index("by_user_time", ["userId", "timestamp"]),

// Usage with type guards
export const getNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", q => q.eq("userId", userId))
      .order("desc")
      .take(20);

    return notifications.map(notif => {
      switch (notif.type) {
        case "PROFILE_UPDATE":
          return { ...notif, profile: ctx.db.get(notif.profileId!) };
        case "NEW_FOLLOWER":
          return { ...notif, follower: notif.followerId };
        case "LINK_CLICK":
          return { ...notif, link: ctx.db.get(notif.linkId!), clicks: notif.clickCount };
      }
    });
  },
});
```

---

## Time-Series Data

### Pattern: Bucketed Time-Series

```typescript
analyticsDaily: defineTable({
  linkId: v.id("links"),
  date: v.string(),  // "2024-01-15"
  clicks: v.number(),
  uniqueVisitors: v.number(),
  revenue: v.number(),
})
  .index("by_link_date", ["linkId", "date"]),

analyticsHourly: defineTable({
  linkId: v.id("links"),
  timestamp: v.number(),  // Rounded to hour
  clicks: v.number(),
  uniqueVisitors: v.number(),
})
  .index("by_link_time", ["linkId", "timestamp"]),

// Aggregate data
export const aggregateHourlyToDaily = internalMutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const links = await ctx.db.query("links").collect();

    for (const link of links) {
      const hourlyData = await ctx.db
        .query("analyticsHourly")
        .withIndex("by_link_time", q =>
          q.eq("linkId", link._id)
            .gte("timestamp", startOfDay)
            .lte("timestamp", endOfDay)
        )
        .collect();

      const totalClicks = hourlyData.reduce((sum, h) => sum + h.clicks, 0);
      const uniqueVisitors = new Set(hourlyData.map(h => h.uniqueVisitors)).size;

      await ctx.db.insert("analyticsDaily", {
        linkId: link._id,
        date,
        clicks: totalClicks,
        uniqueVisitors,
        revenue: 0,  // Calculate from other sources
      });
    }
  },
});
```

---

## Staged Indexes

### Pattern: Large Table Index Backfill

```typescript
// Step 1: Add staged index
export default defineSchema({
  largeTable: defineTable({
    userId: v.string(),
    newField: v.string(),
  })
    .index("by_user", ["userId"])
    // Mark as staged - Convex backfills in background
    .index("by_new_field", ["newField"], { staged: true }),
});

// Step 2: Monitor backfill via Convex dashboard
// The index builds asynchronously without blocking writes

// Step 3: Once backfill complete, remove 'staged: true'
export default defineSchema({
  largeTable: defineTable({
    userId: v.string(),
    newField: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_new_field", ["newField"]),  // Now active
});
```

---

## Performance Patterns

### Pattern: Denormalization

```typescript
// Normalized (requires multiple queries)
users: defineTable({
  name: v.string(),
}),
profiles: defineTable({
  userId: v.id("users"),
  bio: v.string(),
}),

// Denormalized (single query, duplicated data)
profiles: defineTable({
  userId: v.id("users"),
  userName: v.string(),  // Duplicated from users table
  bio: v.string(),
}),

// Update both on user name change
export const updateUserName = mutation({
  args: { userId: v.id("users"), newName: v.string() },
  handler: async (ctx, { userId, newName }) => {
    await ctx.db.patch(userId, { name: newName });

    // Update denormalized data
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    for (const profile of profiles) {
      await ctx.db.patch(profile._id, { userName: newName });
    }
  },
});
```

### Pattern: Computed Fields

```typescript
links: defineTable({
  profileId: v.id("profiles"),
  url: v.string(),

  // Computed fields (updated via mutations)
  clicks: v.number(),
  lastClickedAt: v.optional(v.number()),
  clickThroughRate: v.optional(v.number()),
})
  .index("by_profile_clicks", ["profileId", "clicks"]),

// Update computed fields
export const trackClick = mutation({
  args: { linkId: v.id("links") },
  handler: async (ctx, { linkId }) => {
    const link = await ctx.db.get(linkId);
    const views = await getViews(ctx, linkId);

    await ctx.db.patch(linkId, {
      clicks: link.clicks + 1,
      lastClickedAt: Date.now(),
      clickThroughRate: ((link.clicks + 1) / views) * 100,
    });
  },
});
```

