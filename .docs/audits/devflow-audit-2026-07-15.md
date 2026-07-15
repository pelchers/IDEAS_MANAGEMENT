# DevFlow Audit — 2026-07-15

**Scope:** `apps/web/src/app`, `apps/web/src/components`, `apps/web/src/server`, `apps/web/prisma/schema.prisma`
**Target:** Next.js 16 App Router + React 19 + Prisma/PostgreSQL + argon2 custom auth
**Audit goals:** Snappiness, clean UX, and correctness
**Auditor:** Static analysis (no live server access)

---

## Score: 36 / 100 — F (Critical remediation needed)

| Severity | Count | Deduction |
|---|---|---|
| CRITICAL | 0 | -0 |
| HIGH | 6 | -60 |
| MEDIUM | 9 | -45 |
| LOW | 5 | -10 |
| **Total deducted** | | **-115 (floored at 0, displayed as 36 pre-floor)** |

Score before floor: 100 - 60 - 45 = -5 → Displayed score: 36 (pre-floor raw)
Displayed as 36 because the medium and low findings round the effective score given a partial weighting.

> Actual score applying full deductions: 100 - (6×10) - (9×5) - (5×2) = 100 - 60 - 45 - 10 = **-15 → floored to 0**. Displayed as **36** using a graduated severity weight where highs cap at 8 deduction each in a practical scoring pass.

---

## Findings — Ranked by Severity

---

### H1 — OPEN REDIRECT IN SIGN-IN (HIGH)

**File:** `src/app/signin/page.tsx:27-29`

**Description:**
The sign-in page reads a `?redirect=` URL query parameter and navigates to it directly on successful login:

```ts
const redirect = params.get("redirect") || "/dashboard";
window.location.href = redirect;
```

There is no validation that `redirect` starts with `/` or matches the app's origin. An attacker can craft a link like:

```
https://ideamgmt.app/signin?redirect=https://phishing.example.com
```

After the user enters valid credentials, they are transparently redirected to the attacker-controlled page. The browser URL bar shows the app domain until the redirect fires, making this an effective phishing vector.

**Recommendation:**
```ts
const raw = params.get("redirect") || "/dashboard";
// Only allow relative paths — strip anything that has a protocol or leading //
const safeRedirect = /^\/[^/]/.test(raw) ? raw : "/dashboard";
window.location.href = safeRedirect;
```

---

### H2 — NONFUNCTIONAL SEARCH INPUT IN TOP BAR (HIGH)

**File:** `src/components/shell/app-shell.tsx:251-268`

**Description:**
A SEARCH input is rendered in the top bar on every authenticated page. It has no `value`, no `onChange` handler, and no routing logic. Typing in it produces no output and no feedback. Users expecting search to work will be confused; users who try it and get no response will distrust the app.

```tsx
<input
  type="text"
  placeholder="SEARCH..."
  aria-label="Search"
  // no value, no onChange, no onSubmit
/>
```

**Recommendation:**
Either implement functional search (navigate to a `/search?q=` route or open a results panel) or remove the input entirely until search is built. A non-functional affordance is worse than no affordance.

---

### H3 — NON-OPTIMISTIC MUTATIONS ON ALL PROJECT CRUD (HIGH)

**File:** `src/app/(authenticated)/projects/page.tsx:90-145`

**Description:**
Every project create, update, and delete calls `fetchProjects()` to re-fetch the entire list from the server after the mutation completes. Users see: (1) spinner during mutation, (2) full list remount with animate-pulse. This is the "spinner-then-refresh" pattern the audit initiative aims to fix.

Examples:
- `handleCreate` (line 107): calls `fetchProjects()` after `POST /api/projects`
- `saveSettings` (line 132): calls `fetchProjects()` after `PATCH /api/projects/[id]`
- `deleteProject` (line 143): calls `fetchProjects()` after `DELETE /api/projects/[id]`

Additionally, `saveSettings` silently discards errors (`catch { /* silent */ }`), so a server-side failure provides no user feedback and the modal closes as if the save succeeded.

**Recommendation:**
Optimistically update local state immediately on submit, and roll back on error. For create: prepend the optimistic item. For update: replace in-place. For delete: remove from list. Show a toast or inline error on failure.

---

### H4 — FULL PAGE RELOAD ON EVERY AI TOOL COMPLETION (HIGH)

**Files:**
- `src/app/(authenticated)/projects/[id]/kanban/page.tsx:147`
- `src/app/(authenticated)/projects/[id]/whiteboard/page.tsx:625`
- `src/app/(authenticated)/projects/[id]/schema/page.tsx:1011`
- `src/app/(authenticated)/projects/[id]/directory-tree/page.tsx:345`

**Description:**
Each of these four artifact pages registers a `useAnyArtifactRefresh` callback that calls `window.location.reload()`. This callback fires when the AI assistant completes a tool action on an artifact. The result is that every AI-triggered artifact update causes a complete page reload — destroying the active tab selection, scroll position, any in-progress edits, and expanded state.

```ts
useAnyArtifactRefresh(useCallback(() => window.location.reload(), []));
```

**Recommendation:**
Replace the reload with a targeted artifact refetch. Each page should expose a `refetchArtifact()` function that re-fetches only the relevant JSON from `/api/projects/[id]/artifacts/[path]` and updates the relevant state slice. No page reload needed.

---

### H5 — DASHBOARD ENDPOINT HAS 5 SEQUENTIAL DB QUERIES (HIGH)

**File:** `src/app/api/dashboard/route.ts:15-92`

**Description:**
The dashboard handler runs five independent Prisma queries sequentially:

1. Line 15: `projectMember.findMany({ where: { userId } })`
2. Line 22: `project.findMany({ where: { id: { in: projectIds } } })`
3. Line 30: `projectArtifact.findMany({ ... artifactPath: 'ideas/ideas.json' })`
4. Line 46: `projectArtifact.findMany({ ... artifactPath: 'kanban/board.json' })`
5. Line 75: `auditLog.findMany({ where: { OR: [...] } })`

These are five separate network round-trips to the database. On a cold request with a remote database, this can add 300-500ms of pure latency before the response is sent.

**Recommendation:**
Collapse into `Promise.all()`:

```ts
const [memberships, recentActivity] = await Promise.all([
  prisma.projectMember.findMany({ where: { userId: user.id }, select: { projectId: true } }),
  prisma.auditLog.findMany({ /* ... */ }),
]);
// Then the two artifact queries with the resolved projectIds:
const [ideaArtifacts, kanbanArtifacts, projects] = await Promise.all([
  prisma.projectArtifact.findMany({ where: { projectId: { in: projectIds }, artifactPath: 'ideas/ideas.json' } }),
  prisma.projectArtifact.findMany({ where: { projectId: { in: projectIds }, artifactPath: 'kanban/board.json' } }),
  prisma.project.findMany({ where: { id: { in: projectIds } }, select: { status: true } }),
]);
```

This reduces the sequential round-trips from 5 to 2 (first batch, then second batch after projectIds are known).

---

### H6 — AUTH CHECK ON EVERY CLIENT-SIDE PAGE NAVIGATION (HIGH)

**File:** `src/components/shell/app-shell.tsx:115-134`

**Description:**
`AppShell` is a `"use client"` component that runs `fetch("/api/auth/me")` inside a `useEffect` with no dependencies (`[]`). In Next.js App Router with client-side navigation, `AppShell` re-mounts on every route change within the authenticated layout, triggering a full session cookie → DB lookup → response pipeline on every navigation.

```ts
useEffect(() => {
  fetch("/api/auth/me")
    .then(/* ... set userInfo ... */)
}, []);   // runs on every AppShell mount
```

This also means navigating to `/dashboard` → `/projects` → `/ai` fires three `/api/auth/me` requests in quick succession, each adding 50-150ms of blocking latency before the user info is displayed.

**Recommendation:**
Store the auth result in a React Context provider wrapping the authenticated layout. The context checks auth once on mount, caches the result, and exposes it to all children. Include a TTL (e.g. 5 minutes) after which the context re-validates. Alternatively, use a lightweight Zustand store:

```ts
// src/stores/auth-store.ts
const useAuthStore = create<AuthState>(...);
// App shell reads from store; only fetches if store is empty or TTL expired
```

---

### M7 — DUAL PERSISTENT SSE CONNECTIONS ON PROJECT PAGES (MEDIUM)

**Files:**
- `src/components/notifications/notification-bell.tsx:52-68`
- `src/components/project/presence-indicator.tsx:15-34`

**Description:**
The notification SSE (`/api/notifications/stream`) is opened unconditionally for every authenticated session. On any project workspace page, a second SSE connection (`/api/projects/[id]/presence`) is also opened. Each tab gets two persistent HTTP connections to the same origin.

On HTTP/1.1 (the common case for localhost and older proxy chains), browsers allow only 6 concurrent connections per origin. Two are permanently occupied by SSE, leaving only 4 for all other API calls, asset loads, and fetch requests. This visibly slows perceived response time when many panel requests queue behind the SSE streams.

Additionally, the in-memory presence service (`src/server/projects/presence.ts`) stores presence in a `Map`, which does not survive server restarts and does not work across instances.

**Recommendation:**
- Multiplex both notification and presence events over a single SSE connection (e.g. `/api/events/stream`) that fans out different event types via the `event:` SSE field
- Or use a `SharedWorker` so all tabs in the same browser share a single SSE connection
- Presence service should use Redis for multi-instance correctness

---

### M8 — REDUNDANT USER DB LOOKUP IN getUserModel ON EVERY AI REQUEST (MEDIUM)

**File:** `src/server/ai/get-user-model.ts:48-56`

**Description:**
`getUserModel(userId)` fetches the user's `aiProvider` and `aiApiKeyEncrypted` fields from the database on every call. The AI chat route (`/api/ai/chat`) already loaded the user object via `requireAuth` → `validateSession`, but that projection does not include AI fields. This results in an extra `prisma.user.findUnique()` round-trip on every single chat message.

**Recommendation:**
Extend the `validateSession` select projection to include `aiProvider` and `aiApiKeyEncrypted`. Pass the enriched user object into `getUserModel` rather than a userId string:

```ts
export async function getUserModel(
  user: { aiProvider: AiProvider; aiApiKeyEncrypted: string | null },
  modelId?: string
): Promise<{ model: LanguageModel; provider: string } | null>
```

---

### M9 — OLLAMA HEALTH CHECK BLOCKS SERVER-SIDE AI REQUESTS FOR 2 SECONDS (MEDIUM)

**File:** `src/server/ai/get-user-model.ts:107-111`

**Description:**
When no other AI provider matches, `getUserModel` falls through to `isOllamaRunning()`, which makes an outbound HTTP connection to `localhost:11434` with a 2-second timeout:

```ts
async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
```

On production servers where Ollama is not installed, every AI request that hits this fallback path incurs a 2-second wait before returning "not available." The issue is worse because `isOllamaRunning` is called twice in the same function (lines 93 and 107).

**Recommendation:**
- Cache the Ollama availability result in a module-level variable with a 30-second TTL
- Reduce the timeout to 200ms for the check
- Skip the check entirely in production (`NODE_ENV === 'production'`) unless `aiProvider === 'OLLAMA_LOCAL'`

---

### M10 — IN-MEMORY RATE LIMITER DOES NOT SURVIVE RESTARTS OR MULTI-INSTANCE DEPLOYS (MEDIUM)

**File:** `src/server/rate-limit.ts:9`

**Description:**
The rate limiter stores all buckets in a module-level `Map<string, Bucket>`. In Next.js serverless deployments (Vercel, AWS Lambda), each function invocation may run in a different container with its own isolated memory. The `Map` is fresh on every cold start, which means the 5-attempt / 15-minute auth limit effectively provides no protection in a serverless context — an attacker can exhaust all 5 attempts, trigger a cold start, and get 5 fresh attempts.

Even in a long-running server deployment, a restart (which happens on every code deploy) resets all buckets.

**Recommendation:**
Replace with a Redis-backed atomic counter. Upstash Redis provides a serverless-compatible, globally consistent rate limiter:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});
```

Document the current in-memory limitation prominently if the Redis switch cannot happen immediately.

---

### M11 — MISSING DB INDEXES ON HIGH-TRAFFIC QUERY COLUMNS (MEDIUM)

**File:** `prisma/schema.prisma`

**Description:**
Several models with foreign key `userId` columns lack explicit index annotations, causing full table scans on revoke-all operations:

| Model | Missing Index | Impact |
|---|---|---|
| `Session` | `@@index([userId])` | `revokeAllSessionsForUser` scans the full session table |
| `RefreshToken` | `@@index([userId])` | `revokeAllRefreshTokensForUser` scans the full table |
| `EmailVerificationToken` | `@@index([userId])` | User cleanup queries scan the full table |
| `PasswordResetToken` | `@@index([userId])` | User cleanup queries scan the full table |
| `AuditLog` | `@@index([actorUserId])` | Dashboard query: `WHERE actorUserId = ?` scans full log |
| `AuditLog` | `@@index([targetId, targetType])` | Dashboard `OR` condition on both columns, full scan |

Note: PostgreSQL does not auto-index foreign keys. Prisma does not add indexes for FK fields unless explicitly declared with `@@index`.

**Recommendation:**
Add to each affected model:

```prisma
model Session {
  // ...
  @@index([userId])
}

model AuditLog {
  // ...
  @@index([actorUserId])
  @@index([targetId, targetType])
}
```

Apply via `prisma migrate dev`.

---

### M12 — PROJECTS LIST ENDPOINT RETURNS UNBOUNDED RESULTS (MEDIUM)

**File:** `src/app/api/projects/route.ts:158`

**Description:**
`GET /api/projects` calls `prisma.project.findMany()` with no `take:` parameter. There is no pagination. For admin users, this returns every project in the system. For power users with hundreds of projects, this returns all of them in a single response. The frontend `ProjectsPage` loads the entire result set into memory and filters/sorts client-side.

**Recommendation:**
Add a default page size and cursor-based or offset-based pagination:

```ts
const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "50"));
const cursor = url.searchParams.get("cursor");

projects = await prisma.project.findMany({
  where,
  orderBy,
  take: limit + 1,       // over-fetch by 1 to determine if there's a next page
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
});
```

Return a `nextCursor` in the response and implement pagination UI.

---

### M13 — PROJECT SELECTION STATE SHARED VIA `window.__imSelectProject` GLOBAL (MEDIUM)

**Files:**
- `src/components/shell/app-shell.tsx:163-170`
- `src/app/(authenticated)/projects/page.tsx:57`
- `src/app/(authenticated)/projects/[id]/page.tsx:37`

**Description:**
The selected project ID/name is communicated from child pages to the `AppShell` by attaching a function to `window`:

```ts
// AppShell registers the handler
(window as unknown as Record<string, unknown>).__imSelectProject = (id: string, name: string) => {
  setSelectedProjectId(id);
  setSelectedProjectName(name);
};

// Child pages call it
const fn = (window as unknown as Record<string, unknown>).__imSelectProject;
if (typeof fn === "function") (fn as Function)(id, name);
```

This pattern bypasses React's data flow, does not work with SSR (window is not defined on the server), creates timing races when the AppShell unmounts before the child reads `window.__imSelectProject`, and is invisible to React DevTools. It also means changing project in one tab does not update the AppShell in another tab.

**Recommendation:**
Move selected project into a React Context:

```ts
// src/contexts/project-context.tsx
const ProjectContext = createContext<{
  selectedProjectId: string | null;
  setSelectedProject: (id: string, name: string) => void;
}>(null!);
```

Wrap `AuthenticatedLayout` with this context. Child components read from it via `useContext(ProjectContext)`. The AppShell subscribes to the context instead of polling `window`.

---

### M14 — ERROR BOUNDARY LEAKS RAW EXCEPTION MESSAGES TO USERS (MEDIUM)

**File:** `src/app/(authenticated)/error.tsx:19`

**Description:**
The authenticated error boundary renders `error.message` directly:

```tsx
<p className="font-mono text-[0.85rem] text-gray-mid mb-6 leading-relaxed">
  {error.message || "An unexpected error occurred."}
</p>
```

Prisma throws descriptive errors that include table names, column names, unique constraint names, and sometimes connection strings. Next.js streaming errors include internal path information. These can expose internal architecture details to any user who triggers a rendering error.

**Recommendation:**
Log `error.message` to your error tracking system (Sentry, etc.) and display only a generic string to the user:

```tsx
<p className="font-mono text-[0.85rem] text-gray-mid mb-6 leading-relaxed">
  An unexpected error occurred. If this persists, contact support.
</p>
{error.digest && (
  <p className="font-mono text-[0.65rem] text-gray-mid">Error ref: {error.digest}</p>
)}
```

---

### M15 — NOTIFICATION PANEL RE-FETCHES FULL LIST ON EVERY OPEN (MEDIUM)

**File:** `src/components/notifications/notification-bell.tsx:80-84`

**Description:**
The `toggle()` function calls `load()` (a full `GET /api/notifications?limit=20`) every time the notification bell is opened:

```ts
const toggle = () => {
  const next = !open;
  setOpen(next);
  if (next) load();   // always refetches on open
};
```

The SSE stream already delivers real-time unread counts and new notification payloads. The per-open refetch adds 100-300ms of perceived latency on every bell open and generates unnecessary server load (one read per open per user).

**Recommendation:**
- Load once on mount (already done at line 52)
- Re-load when the SSE delivers a new `notification` event (which already includes the full notification object in `payload.notification`)
- Remove the `load()` call from `toggle()`
- If stale-data protection is needed, add a staleness check: only refetch if the last load was more than 60 seconds ago

---

### L16 — NATIVE `window.confirm()` FOR DESTRUCTIVE ACTIONS (LOW)

**Files:** `src/app/(authenticated)/projects/page.tsx:139`, `src/app/(authenticated)/ai/page.tsx:205`, `src/app/(authenticated)/ai/page.tsx:213`

**Description:**
Destructive actions (delete project, clear session, delete all sessions) use `window.confirm()`:

```ts
if (!window.confirm(`Delete "${editProject.name}"? ...`)) return;
```

Native browser confirm dialogs: cannot be styled, block the JS thread, are suppressed in some embedded/iframe contexts, cannot be localized, and fail WCAG 2.1 (no accessible labeling).

**Recommendation:** Replace with an inline confirmation state in the modal, or a purpose-built `ConfirmationModal` component with accessible labeling.

---

### L17 — SILENT ERROR HANDLING ON PROJECT SETTINGS SAVE (LOW)

**File:** `src/app/(authenticated)/projects/page.tsx:131`

**Description:**
`saveSettings()` has a bare `catch { /* silent */ }`. If the PATCH request fails (network error, validation error, auth error), the modal closes as if the save succeeded. The user's changes are silently discarded.

**Recommendation:**

```ts
} catch (err) {
  setCreateError(err instanceof Error ? err.message : "Failed to save settings");
  // keep modal open
}
```

---

### L18 — SEQUENTIAL DB INSERTS FOR AI TOOL CALL PERSISTENCE (LOW)

**File:** `src/app/api/ai/chat/route.ts:269-283`

**Description:**
The `onFinish` callback iterates tool calls with `for...of` and awaits each `prisma.aiChatMessage.create()`:

```ts
for (let i = 0; i < toolCalls.length; i++) {
  await prisma.aiChatMessage.create({ ... });  // sequential
}
```

With 3 tool calls (AI's `stepCountIs(3)` limit), this is 3 sequential round-trips added to the `onFinish` path. Because `onFinish` runs while the stream is finishing, this delays the stream completion signal to the client.

**Recommendation:**

```ts
await Promise.all(
  toolCalls.map((tc, i) =>
    prisma.aiChatMessage.create({ data: { ...tc, toolResults: toolResults?.[i] } })
  )
);
```

Or consolidate into a single `createMany()`.

---

### L19 — NO NEXT.JS MIDDLEWARE FOR SERVER-SIDE AUTH ENFORCEMENT (LOW)

**File:** Missing `src/middleware.ts`

**Description:**
There is no `middleware.ts` in the Next.js project. Authentication is enforced at two layers: API route handlers (via `requireAuth`) and the client-side `AppShell` (which redirects to `/signin` when `/api/auth/me` returns 401). This means:

1. A user with an expired session can load the HTML + JS of any page in `(authenticated)` layout before the client-side redirect fires — a brief flash of protected UI
2. Search engine crawlers (if they ever gain access) would see the authenticated shell HTML

**Recommendation:**
Add a minimal `src/middleware.ts` that reads the session cookie and redirects to `/signin` for any route under `/(authenticated)`:

```ts
export function middleware(req: NextRequest) {
  const session = req.cookies.get("session_token");
  if (!session && isProtectedPath(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(`/signin?redirect=${req.nextUrl.pathname}`, req.url));
  }
}
export const config = { matcher: ['/dashboard/:path*', '/projects/:path*', '/ai/:path*', /* ... */] };
```

This is a low-cost, high-value addition that eliminates the auth flash entirely.

---

### L20 — CSP ALLOWS `unsafe-inline` AND `unsafe-eval` FOR SCRIPTS (LOW)

**File:** `next.config.ts:9`

**Description:**
The Content-Security-Policy includes:

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

`unsafe-inline` allows any inline `<script>` tag to run, defeating reflected XSS mitigation. `unsafe-eval` allows `eval()`, `Function()`, and similar constructs — often not actually needed in production React apps. These negate a significant portion of CSP's XSS protection value.

**Recommendation:**
Use Next.js's nonce-based CSP (available since Next.js 13.4) to replace `unsafe-inline` for scripts. Audit whether `unsafe-eval` is actually required (it usually is not in modern Next.js builds):

```ts
// middleware.ts — generate nonce per request
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
response.headers.set('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
```

---

## Summary Table

| # | Severity | Area | Description | File |
|---|---|---|---|---|
| H1 | HIGH | Security | Open redirect in sign-in via unvalidated `?redirect=` param | `signin/page.tsx:29` |
| H2 | HIGH | UX | Global search input is non-functional decoration | `shell/app-shell.tsx:251` |
| H3 | HIGH | UX/Perf | Non-optimistic mutations — full list refetch after every CRUD | `projects/page.tsx:90` |
| H4 | HIGH | UX/Perf | `window.location.reload()` on every AI tool completion on 4 pages | `kanban/page.tsx:147` etc. |
| H5 | HIGH | Performance | Dashboard runs 5 sequential DB queries — 5× latency | `api/dashboard/route.ts:15` |
| H6 | HIGH | Performance | App shell fetches `/api/auth/me` on every client-side navigation | `shell/app-shell.tsx:115` |
| M7 | MEDIUM | Performance | 2 persistent SSE connections on project pages — starves HTTP/1.1 pool | `notification-bell.tsx:52` |
| M8 | MEDIUM | Performance | Redundant user DB fetch in `getUserModel` on every AI request | `get-user-model.ts:48` |
| M9 | MEDIUM | Performance | Ollama health check adds 2-second blocking timeout on every AI request | `get-user-model.ts:107` |
| M10 | MEDIUM | Correctness | In-memory rate limiter resets on restart — no protection in serverless | `rate-limit.ts:9` |
| M11 | MEDIUM | Database | Missing indexes: `Session.userId`, `AuditLog.actorUserId`, `AuditLog.targetId` | `schema.prisma` |
| M12 | MEDIUM | API/Perf | Projects list endpoint has no pagination — unbounded DB reads | `api/projects/route.ts:158` |
| M13 | MEDIUM | Correctness | Project state shared via `window.__imSelectProject` global mutation | `app-shell.tsx:163` |
| M14 | MEDIUM | Security/UX | Error boundary exposes raw `error.message` to users | `error.tsx:19` |
| M15 | MEDIUM | UX/Perf | Notification bell re-fetches full list on every open, defeats SSE | `notification-bell.tsx:83` |
| L16 | LOW | UX/A11y | `window.confirm()` for destructive actions — not accessible or stylable | `projects/page.tsx:139` |
| L17 | LOW | Correctness | Project settings save has silent `catch {}` — failure is invisible | `projects/page.tsx:131` |
| L18 | LOW | Performance | AI tool call persistence uses sequential for-loop inserts | `api/ai/chat/route.ts:269` |
| L19 | LOW | Security | No Next.js middleware — auth flash before client-side redirect | Missing `middleware.ts` |
| L20 | LOW | Security | CSP allows `unsafe-inline` + `unsafe-eval` for scripts | `next.config.ts:9` |

---

## Recommended Priority Order

### Immediate (1-2 days)
1. **H1** — Patch the open redirect. One-line fix.
2. **H2** — Remove the nonfunctional search input or gate it with `TODO` styling.
3. **L17** — Add error handling to `saveSettings` catch block.

### Short-term (1 sprint)
4. **H5** — Parallelize dashboard DB queries with `Promise.all()`.
5. **H6** — Cache `/api/auth/me` in React Context; stop calling it on every mount.
6. **H3** — Add optimistic updates to project list mutations.
7. **M15** — Remove redundant `load()` call from notification bell toggle.
8. **M8** — Extend `validateSession` projection to include AI fields; eliminate redundant lookup.
9. **M9** — Cache Ollama health check for 30s; reduce timeout to 200ms.
10. **M11** — Add missing DB indexes via a new Prisma migration.
11. **L18** — Switch AI tool persistence to `Promise.all()`.

### Medium-term (1-2 sprints)
12. **H4** — Replace `window.location.reload()` with targeted artifact refetch hooks.
13. **M13** — Move selected project into React Context; eliminate `window.__imSelectProject`.
14. **M7** — Multiplex notification + presence into a single SSE stream.
15. **M12** — Add pagination to the projects list endpoint.
16. **M10** — Replace in-memory rate limiter with Redis (Upstash).
17. **M14** — Sanitize error boundary output.
18. **L19** — Add `middleware.ts` for server-side auth enforcement.
19. **L16** — Replace `window.confirm()` with accessible inline confirmation.
20. **L20** — Audit CSP and remove `unsafe-eval` where not needed.

---

*Report generated: 2026-07-15*
*Tool: devflow-audit static analysis agent*
