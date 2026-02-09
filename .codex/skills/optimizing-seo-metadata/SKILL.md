---
name: optimizing-seo-metadata
description: Optimize SEO with Next.js metadata, Open Graph images, and structured data. Use for improving search rankings, social sharing, and implementing best SEO practices.
---

# Optimizing SEO Metadata

Next.js 14 metadata API for SEO, social sharing, and discoverability.

## Static Metadata

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LinkWave - Social Link Management',
  description: 'Manage all your social links in one place',
  keywords: ['links', 'social media', 'profile'],
};
```

## Dynamic Metadata

```typescript
// app/profile/[slug]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await getProfile(params.slug);

  return {
    title: `${profile.displayName} - LinkWave`,
    description: profile.bio || `Check out ${profile.displayName}'s links`,
    openGraph: {
      title: profile.displayName,
      description: profile.bio,
      images: [profile.avatar],
    },
  };
}
```

## Complete Metadata Example

```typescript
export const metadata: Metadata = {
  // Basic
  title: 'LinkWave',
  description: 'Manage your social links',

  // Keywords
  keywords: ['links', 'social', 'profile', 'bio'],

  // Authors
  authors: [{ name: 'LinkWave Team' }],

  // Creator
  creator: 'LinkWave',

  // Publisher
  publisher: 'LinkWave Inc',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://linkwave.com',
    siteName: 'LinkWave',
    title: 'LinkWave - Social Link Management',
    description: 'Manage all your social links',
    images: [
      {
        url: 'https://linkwave.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkWave',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@linkwave',
    creator: '@linkwave',
    title: 'LinkWave',
    description: 'Manage your social links',
    images: ['https://linkwave.com/twitter-image.png'],
  },

  // Verification
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },

  // Alternates
  alternates: {
    canonical: 'https://linkwave.com',
  },
};
```

## Title Templates

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | LinkWave',
    default: 'LinkWave - Social Link Management',
  },
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About', // Becomes "About | LinkWave"
};
```

## Open Graph Images

### Static Image

```typescript
export const metadata: Metadata = {
  openGraph: {
    images: '/og-image.png',
  },
};
```

### Dynamic Image Generation

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'LinkWave';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 60,
          color: 'white',
          background: 'linear-gradient(to right, #667eea, #764ba2)',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

// Usage
export const metadata: Metadata = {
  openGraph: {
    images: '/api/og?title=My Profile',
  },
};
```

## Structured Data (JSON-LD)

```typescript
// app/profile/[slug]/page.tsx
export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getProfile(params.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.displayName,
    url: `https://linkwave.com/${profile.slug}`,
    image: profile.avatar,
    description: profile.bio,
    sameAs: profile.links.map((link) => link.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileView profile={profile} />
    </>
  );
}
```

## Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await getAllProfiles();

  return [
    {
      url: 'https://linkwave.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://linkwave.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...profiles.map((profile) => ({
      url: `https://linkwave.com/${profile.slug}`,
      lastModified: new Date(profile.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];
}
```

## Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://linkwave.com/sitemap.xml',
  };
}
```

## Canonical URLs

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://linkwave.com/profile/john',
  },
};
```

## Language Alternates

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://linkwave.com',
    languages: {
      'en-US': 'https://linkwave.com/en-US',
      'es-ES': 'https://linkwave.com/es-ES',
      'fr-FR': 'https://linkwave.com/fr-FR',
    },
  },
};
```

## Best Practices

1. **Use descriptive titles** - 50-60 characters
2. **Write compelling descriptions** - 150-160 characters
3. **Include relevant keywords** - Natural language
4. **Generate OG images** - 1200x630px for sharing
5. **Add structured data** - Help search engines understand
6. **Create sitemap** - Aid search engine crawling
7. **Use canonical URLs** - Avoid duplicate content
8. **Optimize for mobile** - Most traffic is mobile

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me)
- [Schema.org](https://schema.org)

