/**
 * Comprehensive Convex Validators Reference
 * Complete examples of all validator types
 */

import { v } from "convex/values";

// ======================
// PRIMITIVE VALIDATORS
// ======================

export const primitiveExamples = {
  // Basic types
  stringField: v.string(),
  numberField: v.number(),
  booleanField: v.boolean(),
  nullField: v.null(),
  anyField: v.any(),

  // ID references
  userId: v.id("users"),
  profileId: v.id("profiles"),
  linkId: v.id("links"),
};

// ======================
// OPTIONAL AND NULLABLE
// ======================

export const optionalExamples = {
  // Optional (can be undefined)
  bio: v.optional(v.string()),
  age: v.optional(v.number()),

  // Nullable (can be null)
  deletedAt: v.union(v.number(), v.null()),

  // Both optional and nullable
  middleName: v.optional(v.union(v.string(), v.null())),

  // Optional ID reference
  parentId: v.optional(v.id("categories")),
};

// ======================
// ARRAY VALIDATORS
// ======================

export const arrayExamples = {
  // Primitive arrays
  tags: v.array(v.string()),
  scores: v.array(v.number()),
  flags: v.array(v.boolean()),

  // Array of IDs
  memberIds: v.array(v.id("users")),

  // Array of objects
  socialLinks: v.array(
    v.object({
      platform: v.string(),
      url: v.string(),
      verified: v.boolean(),
    })
  ),

  // Nested arrays (array of array)
  matrix: v.array(v.array(v.number())),

  // Optional array
  categories: v.optional(v.array(v.string())),
};

// ======================
// OBJECT VALIDATORS
// ======================

export const objectExamples = {
  // Simple object
  address: v.object({
    street: v.string(),
    city: v.string(),
    zip: v.string(),
  }),

  // Nested objects
  metadata: v.object({
    created: v.object({
      userId: v.string(),
      timestamp: v.number(),
    }),
    updated: v.optional(
      v.object({
        userId: v.string(),
        timestamp: v.number(),
      })
    ),
  }),

  // Object with arrays
  permissions: v.object({
    roles: v.array(v.string()),
    scopes: v.array(v.string()),
  }),

  // Optional object
  theme: v.optional(
    v.object({
      primaryColor: v.string(),
      backgroundColor: v.string(),
      fontFamily: v.string(),
    })
  ),
};

// ======================
// LITERAL VALIDATORS
// ======================

export const literalExamples = {
  // Single literal
  type: v.literal("USER"),

  // Union of literals (enum-like)
  status: v.union(
    v.literal("ACTIVE"),
    v.literal("INACTIVE"),
    v.literal("PENDING"),
    v.literal("DELETED")
  ),

  // User types
  userType: v.union(
    v.literal("PROFILE_OWNER"),
    v.literal("BRAND_SPONSOR"),
    v.literal("VISITOR")
  ),

  // Link types
  linkType: v.union(
    v.literal("URL"),
    v.literal("EMAIL"),
    v.literal("TIMER"),
    v.literal("SHOPIFY")
  ),
};

// ======================
// UNION VALIDATORS
// ======================

export const unionExamples = {
  // String or number
  mixedId: v.union(v.string(), v.number()),

  // Multiple types
  value: v.union(v.string(), v.number(), v.boolean()),

  // Literal union (recommended for enums)
  priority: v.union(
    v.literal("LOW"),
    v.literal("MEDIUM"),
    v.literal("HIGH")
  ),

  // Complex union
  content: v.union(
    v.object({ type: v.literal("text"), text: v.string() }),
    v.object({ type: v.literal("image"), url: v.string() }),
    v.object({ type: v.literal("video"), url: v.string(), duration: v.number() })
  ),
};

// ======================
// RECORD VALIDATORS
// ======================

export const recordExamples = {
  // String keys, string values
  labels: v.record(v.string(), v.string()),

  // String keys, number values
  scores: v.record(v.string(), v.number()),

  // String keys, any values
  metadata: v.record(v.string(), v.any()),

  // String keys, object values
  settings: v.record(
    v.string(),
    v.object({
      enabled: v.boolean(),
      value: v.union(v.string(), v.number()),
    })
  ),
};

// ======================
// COMPLETE TABLE EXAMPLES
// ======================

export const profileTableValidator = v.object({
  // Required fields
  userId: v.string(),
  slug: v.string(),
  displayName: v.string(),

  // Optional fields
  bio: v.optional(v.string()),
  profileImage: v.optional(v.string()),
  website: v.optional(v.string()),

  // Enum field
  userType: v.union(
    v.literal("PROFILE_OWNER"),
    v.literal("BRAND_SPONSOR"),
    v.literal("VISITOR")
  ),

  // Object field
  theme: v.optional(
    v.object({
      primaryColor: v.string(),
      backgroundColor: v.string(),
      fontFamily: v.string(),
    })
  ),

  // Array field
  socialLinks: v.optional(
    v.array(
      v.object({
        platform: v.string(),
        url: v.string(),
      })
    )
  ),

  // Metadata fields
  isActive: v.boolean(),
  _updatedTime: v.optional(v.number()),
});

export const linkTableValidator = v.object({
  // Foreign key
  profileId: v.id("profiles"),

  // Discriminator
  type: v.union(
    v.literal("URL"),
    v.literal("EMAIL"),
    v.literal("TIMER")
  ),

  // Common fields
  title: v.string(),
  position: v.number(),
  isActive: v.boolean(),

  // Type-specific fields (all optional)
  url: v.optional(v.string()),
  email: v.optional(v.string()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),

  // Analytics
  clicks: v.optional(v.number()),
  lastClickedAt: v.optional(v.number()),
});

export const brandSponsorValidator = v.object({
  // Identity
  userId: v.string(),
  companyName: v.string(),
  logo: v.optional(v.string()),

  // Targeting
  category: v.string(),
  targetCountries: v.array(v.string()),
  targetAgeRange: v.object({
    min: v.number(),
    max: v.number(),
  }),

  // Pricing
  costPerClick: v.number(),
  monthlyBudget: v.number(),
  remainingBudget: v.number(),

  // Status
  isActive: v.boolean(),
  approvalStatus: v.union(
    v.literal("PENDING"),
    v.literal("APPROVED"),
    v.literal("REJECTED")
  ),

  // Timestamps
  _updatedTime: v.optional(v.number()),
});

