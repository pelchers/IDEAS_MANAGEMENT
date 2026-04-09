# Remediation Plan — Performance: Code Splitting and Caching
**Audit**: 001 | **Date**: 2026-04-08 | **Priority**: P1 (High)
**References**: `001.01-performance-2026-04-08.md` findings P-01, P-02, P-03, P-04, P-05

## Overview
This plan addresses the high-severity performance findings: monolithic page files, no caching layer, and font loading strategy. These fixes will reduce initial JS bundle size, improve perceived performance, and eliminate redundant API calls.

---

## Item 1: Split whiteboard and schema pages (P-01, P-03)
**Files**: `whiteboard/page.tsx` (2,336 lines), `schema/page.tsx` (2,853 lines)
**Effort**: 2-3 days each

### Strategy
Extract each large page into focused submodules using `next/dynamic` for heavy canvas sections:

**Whiteboard proposed structure**:
```
projects/[id]/whiteboard/
  page.tsx                    (< 100 lines, loads dynamic components)
  _whiteboard-canvas.tsx      (canvas rendering, ~600 lines)
  _whiteboard-tools.tsx       (tool palette, shortcuts, ~200 lines)
  _whiteboard-sticky.tsx      (sticky note modals, ~200 lines)
  _whiteboard-media.tsx       (media viewer/uploader, ~200 lines)
  _whiteboard-types.ts        (all TypeScript interfaces, ~100 lines)
  _whiteboard-utils.ts        (renderMarkdownToHtml, genId, geometry, ~150 lines)
```

**Schema proposed structure**:
```
projects/[id]/schema/
  page.tsx                    (< 100 lines, dynamic loader)
  _schema-canvas.tsx          (main canvas + entity rendering)
  _schema-toolbar.tsx         (tool palette)
  _schema-forms.tsx           (entity/field/relation edit forms)
  _schema-export.tsx          (SQL/JSON export panel)
  _schema-types.ts            (all TypeScript interfaces)
  _schema-utils.ts            (layout algorithms, graph utilities)
```

**Dynamic loading pattern**:
```tsx
// page.tsx
import dynamic from "next/dynamic";

const WhiteboardCanvas = dynamic(
  () => import("./_whiteboard-canvas"),
  { ssr: false, loading: () => <WhiteboardLoadingSkeleton /> }
);
```

---

## Item 2: Add React Query for data caching (P-02)
**Files**: All authenticated pages using raw `fetch` + `useState`
**Effort**: 1-2 days

### Setup
```bash
pnpm --filter web add @tanstack/react-query @tanstack/react-query-devtools
```

Add provider to `src/app/(authenticated)/layout.tsx`:
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 60 seconds
      gcTime: 5 * 60_000, // 5 minutes
    },
  },
});

export default function AuthenticatedLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Migrate pages to use `useQuery` — example for projects page:
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["projects", searchParams],
  queryFn: () => fetch("/api/projects?" + searchParams).then(r => r.json()),
  staleTime: 60_000,
});
```

---

## Item 3: Replace Google Fonts import with next/font (P-05)
**Files**: `src/app/globals.css`, `src/app/layout.tsx`
**Effort**: 30 minutes

### Fix
Remove from `globals.css`:
```css
/* Remove this line: */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
```

Add to `src/app/layout.tsx`:
```tsx
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
      ...
    </html>
  );
}
```

---

## Item 4: Configure next/image for media items (P-08)
**Files**: `whiteboard/page.tsx`, `next.config.ts`
**Effort**: 1 hour

### Problem
Media items are stored as base64 `dataURL` in the artifact JSON, causing large payloads. Long-term, media should be stored in object storage (S3/R2) and loaded via `next/image` with proper optimisation.

### Short-term Fix
Add image domains to `next.config.ts` and set a maximum data URL size warning:
```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // restrict to known CDN domains in production
    ],
  },
};
```

### Long-term Recommendation
Replace base64 dataURL storage with presigned URL uploads to R2/S3. This is a larger architectural change and is tracked separately.

---

## Expected Outcomes
- Initial JS bundle for whiteboard/schema routes: reduced by ~60-70% via dynamic loading
- Dashboard and project list re-fetch rate: reduced by ~80% via React Query staleTime
- Font loading: eliminated render-blocking external CSS request
- Overall Lighthouse performance score improvement: estimated 15-25 points on affected routes
