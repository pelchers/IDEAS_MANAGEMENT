# Remediation Plan — API Validation Hardening
**Audit**: 001 | **Date**: 2026-04-08 | **Priority**: P1 (High)
**References**: `001.06-code-2026-04-08.md` C-03, `001.07-api-2026-04-08.md` API-01, API-02, API-03, API-04

## Overview
This plan addresses the systematic absence of Zod validation on API routes, the lack of pagination on list endpoints, and the missing API versioning strategy. Implementing these reduces the attack surface, improves developer experience, and makes the API production-ready.

---

## Item 1: Shared request validation utility (C-03, API-04)
**File**: New `src/server/validate.ts`
**Effort**: 2 hours for utility + 4 hours to apply to 26 routes

### Utility
```ts
// src/server/validate.ts
import { NextResponse } from "next/server";
import { z } from "zod";

export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_error",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  return { data: result.data };
}

export function isValidationError(r: unknown): r is NextResponse {
  return r instanceof NextResponse;
}
```

### Example application to `/api/ai/chat`:
```ts
const ChatBodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system", "tool"]),
    content: z.string(),
    parts: z.array(z.unknown()).optional(),
  })).min(1),
  sessionId: z.string().optional(),
  projectId: z.string().optional(),
  pageContext: z.string().optional(),
});

const validated = await validateBody(req, ChatBodySchema);
if (isValidationError(validated)) return validated;
const { messages, sessionId, projectId, pageContext } = validated.data;
```

### Routes to Update (Priority Order)
1. `/api/ai/chat/route.ts` — large body, complex structure
2. `/api/projects/route.ts` (POST)
3. `/api/projects/[id]/route.ts` (PATCH)
4. `/api/ai/config/route.ts`
5. `/api/sync/force/route.ts`
6. `/api/projects/[id]/members/route.ts` (POST)
7. All remaining 20 routes

---

## Item 2: Add pagination to list endpoints (API-02)
**Files**: `/api/ai/sessions`, `/api/projects`, `/api/ai/sessions/[id]/messages`
**Effort**: 3 hours

### Pattern
Add consistent `limit` / `offset` parameters to all list endpoints:
```ts
const url = new URL(req.url);
const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
const offset = parseInt(url.searchParams.get("offset") ?? "0");

const [items, total] = await Promise.all([
  prisma.aiChatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
    select: { ... },
  }),
  prisma.aiChatSession.count({ where: { userId: user.id } }),
]);

return NextResponse.json({
  ok: true,
  sessions: items,
  pagination: { limit, offset, total, hasMore: offset + limit < total },
});
```

### Endpoints needing pagination
- `GET /api/ai/sessions` — unbounded user session list
- `GET /api/ai/sessions/[id]/messages` — unbounded message list
- `GET /api/projects` — already has search/filter, add take/skip
- `GET /api/auth/me/export` — cap at 100 projects, paginate messages

---

## Item 3: API versioning documentation (API-01)
**Effort**: 2 hours

### Short-term Approach
Document the current API as v1 without changing URLs. Add an `API-Version` response header to all routes:

```ts
// src/server/api-version.ts
export const API_VERSION = "1.0.0";

export function withApiVersion(response: NextResponse): NextResponse {
  response.headers.set("API-Version", API_VERSION);
  return response;
}
```

Create `docs/api/v1-reference.md` listing all endpoints, request shapes, and response shapes.

### Long-term Approach (for breaking changes)
When a breaking change is needed, add a `/api/v2/` route prefix alongside the existing `/api/` routes, and add a deprecation notice header to v1 responses.

---

## Item 4: Fix SDK package exports (API-01)
**File**: `packages/sdk/src/index.ts`
**Effort**: 1 hour

### Problem
`packages/sdk/src/index.ts` exports nothing (`export {}`). The SDK package exists but provides no typed API client.

### Minimum Fix
Export typed response interfaces matching current API responses:
```ts
// packages/sdk/src/index.ts
export interface ApiOkResponse<T = Record<string, unknown>> {
  ok: true;
  [key: string]: T | boolean;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  message?: string;
}

export type ApiResponse<T = Record<string, unknown>> = ApiOkResponse<T> | ApiErrorResponse;

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "PLANNING" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  tags: string[];
  memberCount?: number;
  userRole?: "OWNER" | "EDITOR" | "VIEWER" | null;
  createdAt: string;
  updatedAt: string;
}

// ... additional type exports
```

---

## Verification Steps
1. All 26 previously unvalidated routes now return 400 with `{ ok: false, error: "validation_error" }` on malformed input
2. List endpoints return `pagination` metadata and respect `limit`/`offset` parameters
3. `API-Version` header present on all responses
4. SDK package exports compile-checked types matching API response shapes
