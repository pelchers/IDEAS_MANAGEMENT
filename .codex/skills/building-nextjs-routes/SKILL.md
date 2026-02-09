---
name: building-nextjs-routes
description: Build Next.js 14 App Router routes with Server and Client Components. Use for creating pages, layouts, API routes, route handlers, dynamic segments, and implementing server-first rendering patterns.
---

# Building Next.js Routes

Next.js 14 App Router patterns for server-first, type-safe routing with optimal performance.

## Quick Start

### File-Based Routing

```
app/
├── page.tsx                    # /
├── about/page.tsx              # /about
├── blog/
│   ├── page.tsx               # /blog
│   └── [slug]/page.tsx        # /blog/:slug
├── dashboard/
│   ├── layout.tsx             # Shared layout
│   ├── page.tsx               # /dashboard
│   └── settings/page.tsx      # /dashboard/settings
└── api/
    └── users/route.ts         # /api/users
```

## Server Components (Default)

```typescript
// app/page.tsx
export default async function HomePage() {
  // Fetch data server-side
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return (
    <main>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}
```

**Benefits**:
- No JavaScript sent to client
- Direct database/API access
- SEO-friendly
- Fast initial load

## Client Components

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Use when you need**:
- React hooks (useState, useEffect)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Third-party libraries requiring client-side

## Dynamic Routes

### Single Dynamic Segment

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map(post => ({
    slug: post.slug,
  }));
}
```

### Multiple Dynamic Segments

```typescript
// app/shop/[category]/[product]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: { category: string; product: string };
}) {
  const product = await getProduct(params.category, params.product);

  return <ProductDetails product={product} />;
}
```

### Catch-All Segments

```typescript
// app/docs/[...slug]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  // /docs/a/b/c → params.slug = ['a', 'b', 'c']
  const doc = await getDoc(params.slug);

  return <Documentation doc={doc} />;
}
```

## Layouts

### Root Layout (Required)

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>Global Navigation</nav>
        </header>
        {children}
        <footer>Global Footer</footer>
      </body>
    </html>
  );
}
```

### Nested Layouts

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside>
        <Sidebar />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Layout with Auth

```typescript
// app/(protected)/layout.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <>{children}</>;
}
```

## Route Groups

Organize routes without affecting URL structure:

```
app/
├── (marketing)/
│   ├── layout.tsx         # Marketing layout
│   ├── page.tsx          # /
│   └── about/page.tsx    # /about
└── (app)/
    ├── layout.tsx        # App layout
    └── dashboard/
        └── page.tsx      # /dashboard
```

## API Routes (Route Handlers)

### GET Request

```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const posts = await db.posts.findMany();

  return NextResponse.json(posts);
}
```

### POST Request

```typescript
export async function POST(request: Request) {
  const body = await request.json();

  const post = await db.posts.create({
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
```

### Dynamic API Routes

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await db.posts.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return new NextResponse('Not found', { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const post = await db.posts.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(post);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await db.posts.delete({
    where: { id: params.id },
  });

  return new NextResponse(null, { status: 204 });
}
```

## Loading & Error States

### Loading UI

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <Spinner />;
}
```

### Error Handling

```typescript
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found

```typescript
// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Post Not Found</h2>
      <p>The blog post you're looking for doesn't exist.</p>
    </div>
  );
}

// Trigger from page
import { notFound } from 'next/navigation';

const post = await getPost(params.slug);
if (!post) notFound();
```

## Metadata & SEO

### Static Metadata

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'App description',
};
```

### Dynamic Metadata

```typescript
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

## Data Fetching Patterns

### Parallel Data Fetching

```typescript
export default async function Page() {
  // Fetch in parallel
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts(),
  ]);

  return <Dashboard user={user} posts={posts} />;
}
```

### Sequential Data Fetching

```typescript
export default async function Page() {
  const user = await getUser();
  const posts = await getPostsByUserId(user.id); // Depends on user

  return <Dashboard user={user} posts={posts} />;
}
```

### Streaming with Suspense

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </>
  );
}

async function Posts() {
  const posts = await getPosts(); // Slow query
  return <PostsList posts={posts} />;
}
```

## Navigation

### Link Component

```typescript
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';

export function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    await login();
    router.push('/dashboard');
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Redirect

```typescript
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <Dashboard />;
}
```

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Best Practices

1. **Server Components by default** - Use client components only when needed
2. **Colocate data fetching** - Fetch data where it's needed
3. **Use layouts** - Share UI and reduce re-renders
4. **Generate static params** - Pre-render dynamic routes
5. **Handle errors gracefully** - Use error.tsx and not-found.tsx
6. **Optimize metadata** - Improve SEO with proper metadata
7. **Use route groups** - Organize without affecting URLs
8. **Leverage streaming** - Improve perceived performance

## Common Patterns

### Protected Route

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) redirect('/sign-in');

  const data = await getUserData(userId);
  return <Dashboard data={data} />;
}
```

### Parallel Routes

```typescript
// app/dashboard/@analytics/page.tsx
export default async function Analytics() {
  const data = await getAnalytics();
  return <AnalyticsPanel data={data} />;
}

// app/dashboard/@team/page.tsx
export default async function Team() {
  const members = await getTeamMembers();
  return <TeamPanel members={members} />;
}

// app/dashboard/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <>
      {children}
      {analytics}
      {team}
    </>
  );
}
```

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

