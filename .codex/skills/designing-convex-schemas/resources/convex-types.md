# Convex TypeScript Types Reference

## Table of Contents

- [Generated Types](#generated-types)
- [Type Inference](#type-inference)
- [Type Utilities](#type-utilities)
- [Function Types](#function-types)
- [Validator Types](#validator-types)
- [Custom Type Patterns](#custom-type-patterns)

---

## Generated Types

### Document Types

```typescript
import { Doc, Id } from "../convex/_generated/dataModel";

// Get document type from table name
type Profile = Doc<"profiles">;
type Link = Doc<"links">;
type BrandSponsor = Doc<"brandSponsors">;

// Usage in components
interface ProfileCardProps {
  profile: Doc<"profiles">;
}

function ProfileCard({ profile }: ProfileCardProps) {
  return <div>{profile.displayName}</div>;
}

// Usage in functions
export const updateProfile = mutation({
  handler: async (ctx, args: { profile: Doc<"profiles"> }) => {
    // TypeScript knows all fields
    console.log(args.profile.displayName);
    console.log(args.profile.bio);
  },
});
```

### ID Types

```typescript
import { Id } from "../convex/_generated/dataModel";

// Type-safe IDs
type ProfileId = Id<"profiles">;
type LinkId = Id<"links">;

// Function arguments
export const getProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }: { profileId: Id<"profiles"> }) => {
    return await ctx.db.get(profileId);
  },
});

// Type guards
function isProfileId(id: string): id is Id<"profiles"> {
  // Implementation would check ID format
  return id.startsWith("profile_");
}
```

### Table Names

```typescript
import { TableNames } from "../convex/_generated/dataModel";

// Union of all table names
type AllTables = TableNames;
// "profiles" | "links" | "brandSponsors" | ...

// Generic function
function getTableCount<T extends TableNames>(
  ctx: QueryCtx,
  tableName: T
): Promise<number> {
  return ctx.db.query(tableName).collect().then(docs => docs.length);
}
```

---

## Type Inference

### Infer from Validators

```typescript
import { Infer } from "convex/values";
import { v } from "convex/values";

// Define validator
const profileValidator = v.object({
  userId: v.string(),
  displayName: v.string(),
  bio: v.optional(v.string()),
  theme: v.optional(
    v.object({
      primaryColor: v.string(),
      backgroundColor: v.string(),
    })
  ),
});

// Infer type from validator
type ProfileInput = Infer<typeof profileValidator>;
// {
//   userId: string;
//   displayName: string;
//   bio?: string;
//   theme?: {
//     primaryColor: string;
//     backgroundColor: string;
//   };
// }

// Use in mutation
export const createProfile = mutation({
  args: profileValidator,
  handler: async (ctx, args: ProfileInput) => {
    // TypeScript knows the shape
    return await ctx.db.insert("profiles", args);
  },
});
```

### Partial Types

```typescript
import { Doc } from "../convex/_generated/dataModel";

// Partial update type
type ProfileUpdate = Partial<Doc<"profiles">>;

export const updateProfile = mutation({
  args: {
    profileId: v.id("profiles"),
    updates: v.any(),  // Validated at runtime
  },
  handler: async (ctx, { profileId, updates }: {
    profileId: Id<"profiles">;
    updates: ProfileUpdate;
  }) => {
    await ctx.db.patch(profileId, updates);
  },
});
```

---

## Type Utilities

### Pick Specific Fields

```typescript
import { Doc } from "../convex/_generated/dataModel";

// Pick only certain fields
type ProfileBasic = Pick<Doc<"profiles">, "_id" | "displayName" | "slug">;

// Use in query return type
export const getProfileBasic = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }): Promise<ProfileBasic | null> => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_slug", q => q.eq("slug", slug))
      .first();

    if (!profile) return null;

    return {
      _id: profile._id,
      displayName: profile.displayName,
      slug: profile.slug,
    };
  },
});
```

### Omit Fields

```typescript
// Omit system fields
type ProfileWithoutMeta = Omit<Doc<"profiles">, "_id" | "_creationTime">;

// Create type
export const createProfile = mutation({
  handler: async (ctx, args: ProfileWithoutMeta) => {
    // Don't need _id or _creationTime when creating
    return await ctx.db.insert("profiles", args);
  },
});
```

### Required Fields

```typescript
// Make all optional fields required
type ProfileRequired = Required<Doc<"profiles">>;

// Validate complete profile
function isCompleteProfile(profile: Doc<"profiles">): profile is ProfileRequired {
  return !!(
    profile.bio &&
    profile.website &&
    profile.profileImage
  );
}
```

---

## Function Types

### Query Context

```typescript
import { QueryCtx, MutationCtx } from "../convex/_generated/server";

// Reusable helper with typed context
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User not found");
  return user;
}

// Use in query
export const getMyProfile = query({
  handler: async (ctx: QueryCtx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .first();
  },
});
```

### Action Context

```typescript
import { ActionCtx } from "../convex/_generated/server";

// Typed action
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (
    ctx: ActionCtx,
    { to, subject, body }: { to: string; subject: string; body: string }
  ) => {
    // Access to runQuery, runMutation, runAction
    const profile = await ctx.runQuery(api.profiles.getByEmail, { email: to });

    // External API call
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html: body }),
    });
  },
});
```

### HTTP Action Context

```typescript
import { httpRouter } from "convex/server";
import { HttpRouter } from "../convex/_generated/server";

const http: HttpRouter = httpRouter();

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: async (request, ctx) => {
    // Request is Web API Request
    const signature = request.headers.get("stripe-signature");
    const body = await request.text();

    // Verify and process webhook
    // ctx has runQuery, runMutation, runAction

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});

export default http;
```

---

## Validator Types

### Branded Types

```typescript
import { v } from "convex/values";

// Create branded type for email
const emailValidator = v.string();  // Runtime validation elsewhere

type Email = string & { readonly __brand: "Email" };

function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Use branded type
interface User {
  name: string;
  email: Email;
}

export const createUser = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, { name, email }) => {
    if (!isEmail(email)) {
      throw new Error("Invalid email");
    }

    // Now email is type Email
    const user: User = { name, email };
    return await ctx.db.insert("users", user);
  },
});
```

### Union Type Narrowing

```typescript
import { Doc } from "../convex/_generated/dataModel";

type Link = Doc<"links">;

// Type guards for discriminated unions
function isUrlLink(link: Link): link is Link & { type: "URL"; url: string } {
  return link.type === "URL";
}

function isEmailLink(link: Link): link is Link & { type: "EMAIL"; email: string } {
  return link.type === "EMAIL";
}

function isTimerLink(link: Link): link is Link & { type: "TIMER"; startDate: number; endDate: number } {
  return link.type === "TIMER";
}

// Usage
export const getLinkData = query({
  args: { linkId: v.id("links") },
  handler: async (ctx, { linkId }) => {
    const link = await ctx.db.get(linkId);
    if (!link) return null;

    if (isUrlLink(link)) {
      // TypeScript knows link.url exists
      return { type: "URL", url: link.url };
    } else if (isEmailLink(link)) {
      // TypeScript knows link.email exists
      return { type: "EMAIL", email: link.email };
    } else if (isTimerLink(link)) {
      // TypeScript knows link.startDate and link.endDate exist
      return { type: "TIMER", start: link.startDate, end: link.endDate };
    }

    return null;
  },
});
```

---

## Custom Type Patterns

### Pagination Types

```typescript
import { PaginationResult } from "convex/server";
import { Doc } from "../convex/_generated/dataModel";

type ProfilePage = PaginationResult<Doc<"profiles">>;

export const listProfiles = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, { paginationOpts }): Promise<ProfilePage> => {
    return await ctx.db.query("profiles").paginate(paginationOpts);
  },
});

// Usage in component
function ProfileList() {
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 20,
    cursor: null as string | null,
  });

  const result: ProfilePage = useQuery(api.profiles.listProfiles, { paginationOpts });

  return (
    <div>
      {result.page.map(profile => <ProfileCard key={profile._id} profile={profile} />)}
      {result.continueCursor && (
        <button onClick={() => setPaginationOpts({ ...paginationOpts, cursor: result.continueCursor })}>
          Load More
        </button>
      )}
    </div>
  );
}
```

### Readonly Types

```typescript
// Prevent mutations on returned data
export const getProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }): Promise<Readonly<Doc<"profiles">> | null> => {
    return await ctx.db.get(profileId);
  },
});

// TypeScript prevents mutations
const profile = await api.profiles.getProfile({ profileId });
if (profile) {
  // Error: Cannot assign to 'displayName' because it is a read-only property
  // profile.displayName = "New Name";
}
```

### Generic Repository Pattern

```typescript
import { GenericId, Doc } from "../convex/_generated/dataModel";
import { TableNames } from "../convex/_generated/dataModel";
import { QueryCtx, MutationCtx } from "../convex/_generated/server";

class Repository<T extends TableNames> {
  constructor(
    private ctx: QueryCtx | MutationCtx,
    private tableName: T
  ) {}

  async get(id: GenericId<T>): Promise<Doc<T> | null> {
    return await this.ctx.db.get(id);
  }

  async list(): Promise<Doc<T>[]> {
    return await this.ctx.db.query(this.tableName).collect();
  }

  async create(data: Omit<Doc<T>, "_id" | "_creationTime">): Promise<GenericId<T>> {
    if ("patch" in this.ctx.db) {
      // MutationCtx
      return await this.ctx.db.insert(this.tableName, data as any);
    }
    throw new Error("Cannot insert in query context");
  }
}

// Usage
export const createProfile = mutation({
  handler: async (ctx, args: Omit<Doc<"profiles">, "_id" | "_creationTime">) => {
    const repo = new Repository(ctx, "profiles");
    return await repo.create(args);
  },
});
```

### Zod Integration

```typescript
import { z } from "zod";
import { v } from "convex/values";

// Zod schema
const profileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  bio: z.string().max(500).optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

// Convex validator (for runtime)
const profileValidator = v.object({
  userId: v.string(),
  displayName: v.string(),
  slug: v.string(),
  bio: v.optional(v.string()),
});

// Mutation with both validations
export const createProfile = mutation({
  args: profileValidator,
  handler: async (ctx, args: ProfileInput) => {
    // Additional Zod validation
    const parsed = profileSchema.parse(args);

    return await ctx.db.insert("profiles", parsed);
  },
});
```

---

## Best Practices

1. **Always use generated types** from `_generated/dataModel`
2. **Leverage type inference** instead of manual type definitions
3. **Use type guards** for discriminated unions
4. **Brand types** for domain-specific strings (Email, URL, etc.)
5. **Readonly for queries**, mutable for mutations
6. **Generic utilities** for reusable logic
7. **Validate at boundaries** with both Convex and Zod
8. **Document complex types** with JSDoc comments

