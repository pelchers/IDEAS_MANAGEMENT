---
name: improving-web-performance
description: Improve web performance with image optimization, code splitting, and caching. Use for reducing load times, optimizing Core Web Vitals, and implementing performance best practices.
---

# Improving Web Performance

Next.js 14 performance optimization for fast, efficient web applications.

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div>
      {/* Optimized with automatic format conversion, resizing, lazy loading */}
      <Image
        src={profile.avatar}
        alt={profile.displayName}
        width={200}
        height={200}
        priority // For above-the-fold images
      />

      {/* Responsive images */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />

      {/* Background image */}
      <div className="relative h-64">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={75}
        />
      </div>
    </div>
  );
}
```

### Blur Placeholder

```typescript
<Image
  src="/profile.jpg"
  alt="Profile"
  width={500}
  height={500}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Generate with plaiceholder
/>
```

## Code Splitting

### Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// Lazy load component
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <Spinner />,
  ssr: false, // Disable server-side rendering
});

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Chart data={data} />
    </div>
  );
}

// Load multiple exports
const { VideoPlayer } = dynamic(() =>
  import('@/components/Video').then((mod) => ({ default: mod.VideoPlayer }))
);
```

### Route-Based Code Splitting

Next.js automatically code-splits by route. Each page only loads what's needed.

```typescript
// app/dashboard/page.tsx - Separate bundle
export default function Dashboard() { ... }

// app/settings/page.tsx - Separate bundle
export default function Settings() { ... }
```

## Caching

### HTTP Caching Headers

```typescript
// app/api/posts/route.ts
export async function GET() {
  const posts = await fetchPosts();

  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### Next.js Caching

```typescript
// Static page (cached at build time)
export default async function StaticPage() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  return <div>{data}</div>;
}

// Dynamic page (no caching)
export const dynamic = 'force-dynamic';

export default async function DynamicPage() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store', // Never cache
  });

  return <div>{data}</div>;
}
```

### React Cache

```typescript
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});

// Called multiple times in component tree, but only fetches once
export default async function Page() {
  const user = await getUser('123');
  return <UserProfile user={user} />;
}
```

## Font Optimization

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

// Local fonts
import localFont from 'next/font/local';

const customFont = localFont({
  src: './fonts/CustomFont.woff2',
  display: 'swap',
  variable: '--font-custom',
});
```

## Loading States & Streaming

### Loading UI

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

### Streaming with Suspense

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <AnotherSlowComponent />
      </Suspense>
    </>
  );
}

async function SlowComponent() {
  const data = await fetchSlowData();
  return <div>{data}</div>;
}
```

## Bundle Analysis

```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js config
});

// Run: ANALYZE=true npm run build
```

## Prefetching

```typescript
import Link from 'next/link';

// Automatic prefetching with Link
<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>

// Programmatic prefetching
'use client';

import { useRouter } from 'next/navigation';

export function Navigation() {
  const router = useRouter();

  return (
    <button
      onMouseEnter={() => router.prefetch('/dashboard')}
      onClick={() => router.push('/dashboard')}
    >
      Dashboard
    </button>
  );
}
```

## Reduce JavaScript

```typescript
'use client';

// Only mark interactive components as client
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Keep everything else as server components
export default async function Page() {
  const data = await fetchData();

  return (
    <div>
      <StaticContent data={data} /> {/* Server component */}
      <Counter /> {/* Client component */}
    </div>
  );
}
```

## Database Query Optimization

```typescript
// Bad: N+1 query problem
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.authorId } });
}

// Good: Include relation in single query
const posts = await db.post.findMany({
  include: { author: true },
});

// Pagination
const posts = await db.post.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

// Select only needed fields
const users = await db.user.findMany({
  select: { id: true, name: true, email: true },
});
```

## Reduce Render Blocking

```typescript
// Defer non-critical scripts
<Script src="/analytics.js" strategy="lazyOnload" />

// Load critical scripts early
<Script src="/tracking.js" strategy="beforeInteractive" />

// Default: Load after page interactive
<Script src="/widgets.js" strategy="afterInteractive" />
```

## Optimize Third-Party Scripts

```typescript
import Script from 'next/script';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  );
}
```

## Core Web Vitals

### Largest Contentful Paint (LCP)

```typescript
// Optimize images above fold
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Preload
/>

// Preload critical resources
export const metadata = {
  other: {
    'link': [
      { rel: 'preload', href: '/fonts/font.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    ],
  },
};
```

### Cumulative Layout Shift (CLS)

```typescript
// Always specify dimensions
<Image
  src="/image.jpg"
  alt="Image"
  width={500}
  height={300} // Prevents layout shift
/>

// Reserve space for dynamic content
<div className="min-h-[200px]">
  {loading ? <Skeleton /> : <Content />}
</div>
```

### First Input Delay (FID) / Interaction to Next Paint (INP)

```typescript
// Use React 18 concurrent features
import { useTransition } from 'react';

function SearchInput() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      setQuery(e.target.value); // Mark as non-urgent
    });
  }

  return <input onChange={handleChange} />;
}
```

## Monitoring

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

## Best Practices

1. **Use Next.js Image** - Automatic optimization
2. **Code split wisely** - Dynamic imports for heavy components
3. **Cache aggressively** - HTTP headers + Next.js caching
4. **Optimize fonts** - Use next/font for automatic optimization
5. **Stream with Suspense** - Improve perceived performance
6. **Analyze bundle** - Remove unused dependencies
7. **Prefetch links** - Faster navigation
8. **Monitor Core Web Vitals** - Track real user metrics

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance)
- [Core Web Vitals](https://web.dev/vitals)

