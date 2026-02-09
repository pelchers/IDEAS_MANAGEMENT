/**
 * Convex Index Patterns Reference
 * Common index configurations and query patterns
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ======================
// SINGLE FIELD INDEXES
// ======================

export const singleFieldIndexExamples = defineSchema({
  profiles: defineTable({
    userId: v.string(),
    slug: v.string(),
    email: v.string(),
    displayName: v.string(),
  })
    // Index by user ID (most common query)
    .index("by_user", ["userId"])

    // Index by slug (for profile lookups)
    .index("by_slug", ["slug"])

    // Index by email (for user lookups)
    .index("by_email", ["email"]),
});

// Query examples:
// ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", userId))
// ctx.db.query("profiles").withIndex("by_slug", q => q.eq("slug", "johndoe"))

// ======================
// COMPOUND INDEXES
// ======================

export const compoundIndexExamples = defineSchema({
  links: defineTable({
    profileId: v.id("profiles"),
    position: v.number(),
    isActive: v.boolean(),
    type: v.string(),
  })
    // Query by profile, then order by position
    .index("by_profile_position", ["profileId", "position"])

    // Query by profile and active status
    .index("by_profile_active", ["profileId", "isActive"])

    // Query by profile, active status, then type
    .index("by_profile_active_type", ["profileId", "isActive", "type"]),
});

// Query examples:
// Get all links for a profile, ordered by position
// ctx.db.query("links")
//   .withIndex("by_profile_position", q => q.eq("profileId", profileId))

// Get active links for a profile
// ctx.db.query("links")
//   .withIndex("by_profile_active", q =>
//     q.eq("profileId", profileId).eq("isActive", true)
//   )

// Get active URL links for a profile
// ctx.db.query("links")
//   .withIndex("by_profile_active_type", q =>
//     q.eq("profileId", profileId).eq("isActive", true).eq("type", "URL")
//   )

// ======================
// TIME-BASED INDEXES
// ======================

export const timeBasedIndexExamples = defineSchema({
  analytics: defineTable({
    linkId: v.id("links"),
    timestamp: v.number(),
    eventType: v.string(),
    userId: v.optional(v.string()),
  })
    // Query by link, then filter by time range
    .index("by_link_time", ["linkId", "timestamp"])

    // Query by event type, then time
    .index("by_event_time", ["eventType", "timestamp"])

    // Query by link and event type, then time
    .index("by_link_event_time", ["linkId", "eventType", "timestamp"]),
});

// Query examples:
// Get recent analytics for a link
// ctx.db.query("analytics")
//   .withIndex("by_link_time", q =>
//     q.eq("linkId", linkId).gt("timestamp", Date.now() - 7 * 24 * 60 * 60 * 1000)
//   )

// Get clicks in last 30 days
// const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
// ctx.db.query("analytics")
//   .withIndex("by_event_time", q =>
//     q.eq("eventType", "CLICK").gte("timestamp", thirtyDaysAgo)
//   )

// ======================
// SEARCH INDEXES
// ======================

export const searchIndexExamples = defineSchema({
  profiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    isActive: v.boolean(),
    userType: v.string(),
  })
    .index("by_user", ["userId"])

    // Full-text search on displayName
    .searchIndex("search_by_name", {
      searchField: "displayName",
      filterFields: ["isActive", "userType"],
    }),

  links: defineTable({
    profileId: v.id("profiles"),
    title: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_profile", ["profileId"])

    // Search links by title
    .searchIndex("search_by_title", {
      searchField: "title",
      filterFields: ["profileId", "isActive"],
    }),
});

// Query examples:
// Search profiles by name
// ctx.db.query("profiles")
//   .withSearchIndex("search_by_name", q =>
//     q.search("displayName", "john").eq("isActive", true)
//   )

// Search active links for a profile
// ctx.db.query("links")
//   .withSearchIndex("search_by_title", q =>
//     q.search("title", "contact")
//       .eq("profileId", profileId)
//       .eq("isActive", true)
//   )

// ======================
// POLYMORPHIC INDEXES
// ======================

export const polymorphicIndexExamples = defineSchema({
  activities: defineTable({
    entityType: v.union(
      v.literal("PROFILE"),
      v.literal("LINK"),
      v.literal("BRAND")
    ),
    entityId: v.string(),
    actionType: v.string(),
    timestamp: v.number(),
  })
    // Query all activities for an entity
    .index("by_entity", ["entityType", "entityId"])

    // Query activities by type and time
    .index("by_action_time", ["actionType", "timestamp"])

    // Query entity activities by time
    .index("by_entity_time", ["entityType", "entityId", "timestamp"]),
});

// Query examples:
// Get all profile activities
// ctx.db.query("activities")
//   .withIndex("by_entity", q =>
//     q.eq("entityType", "PROFILE").eq("entityId", profileId)
//   )

// Get recent view events
// ctx.db.query("activities")
//   .withIndex("by_action_time", q =>
//     q.eq("actionType", "VIEW").gt("timestamp", recentTime)
//   )

// ======================
// MULTI-TENANT INDEXES
// ======================

export const multiTenantIndexExamples = defineSchema({
  organizationLinks: defineTable({
    organizationId: v.string(),
    workspaceId: v.string(),
    userId: v.string(),
    linkId: v.id("links"),
  })
    // Query by organization
    .index("by_org", ["organizationId"])

    // Query by workspace within organization
    .index("by_org_workspace", ["organizationId", "workspaceId"])

    // Query by user within workspace
    .index("by_org_workspace_user", [
      "organizationId",
      "workspaceId",
      "userId",
    ]),
});

// Query examples:
// Get all links for an organization
// ctx.db.query("organizationLinks")
//   .withIndex("by_org", q => q.eq("organizationId", orgId))

// Get workspace links
// ctx.db.query("organizationLinks")
//   .withIndex("by_org_workspace", q =>
//     q.eq("organizationId", orgId).eq("workspaceId", workspaceId)
//   )

// ======================
// BEST PRACTICES EXAMPLES
// ======================

export const bestPracticesSchema = defineSchema({
  // ✅ Good: Index frequently queried fields
  posts: defineTable({
    authorId: v.string(),
    published: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published_date", ["published", "createdAt"]),

  // ✅ Good: Use compound indexes for related filters
  products: defineTable({
    categoryId: v.string(),
    inStock: v.boolean(),
    price: v.number(),
  })
    .index("by_category_stock_price", ["categoryId", "inStock", "price"]),

  // ✅ Good: Index both directions for bidirectional queries
  friendships: defineTable({
    userId1: v.string(),
    userId2: v.string(),
    status: v.string(),
  })
    .index("by_user1", ["userId1", "status"])
    .index("by_user2", ["userId2", "status"]),
});

// ======================
// STAGED INDEXES
// ======================

// For large tables, use staged indexes to backfill asynchronously
export const stagedIndexExample = defineSchema({
  largeTable: defineTable({
    userId: v.string(),
    data: v.string(),
  })
    // Regular index
    .index("by_user", ["userId"])

    // Staged index (backfills in background)
    // Remove 'staged: true' once backfill completes
    // .index("by_new_field", ["newField"], { staged: true }),
});

// ======================
// INDEX LIMITS
// ======================

/**
 * Convex Index Limits:
 * - Maximum 16 fields per index
 * - Maximum 32 indexes per table
 * - _creationTime is automatically appended as tiebreaker
 * - No duplicate fields in an index
 * - No reserved fields (starting with _) except _creationTime
 */

