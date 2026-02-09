---
name: tracking-user-analytics
description: Track user analytics with event tracking, dashboards, and privacy-first analytics. Use for implementing analytics, measuring user behavior, and complying with privacy regulations.
---

# Tracking User Analytics

Privacy-first analytics and event tracking for Next.js applications.

## Vercel Analytics

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Google Analytics 4

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
```

### Track Events

```typescript
// lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export function pageview(url: string) {
  window.gtag('config', GA_TRACKING_ID!, {
    page_path: url,
  });
}

export function event({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// Usage
'use client';

import { event } from '@/lib/analytics';

export function SignupButton() {
  const handleClick = () => {
    event({
      action: 'signup_click',
      category: 'engagement',
      label: 'header_button',
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

### Track Page Views

```typescript
// app/providers.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    pageview(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

## Custom Event Tracking

```typescript
// lib/analytics.ts
interface EventProperties {
  [key: string]: string | number | boolean;
}

export function trackEvent(
  eventName: string,
  properties?: EventProperties
) {
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', eventName, properties);
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Custom analytics service
  // sendToAnalyticsService(eventName, properties);
}

// Usage examples
trackEvent('profile_created', {
  userId: user.id,
  userType: user.type,
});

trackEvent('link_clicked', {
  linkId: link.id,
  linkType: link.type,
  position: index,
});

trackEvent('subscription_started', {
  plan: 'pro',
  price: 9.99,
  billingCycle: 'monthly',
});
```

## Track Form Interactions

```typescript
'use client';

import { trackEvent } from '@/lib/analytics';

export function ContactForm() {
  const handleSubmit = async (data: FormData) => {
    trackEvent('form_submitted', {
      formName: 'contact',
    });

    try {
      await submitForm(data);

      trackEvent('form_success', {
        formName: 'contact',
      });
    } catch (error) {
      trackEvent('form_error', {
        formName: 'contact',
        error: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        onFocus={() => trackEvent('form_field_focused', { field: 'email' })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Track E-Commerce

```typescript
// Track product views
trackEvent('product_viewed', {
  productId: product.id,
  productName: product.name,
  category: product.category,
  price: product.price,
});

// Track add to cart
trackEvent('add_to_cart', {
  productId: product.id,
  quantity: 1,
  price: product.price,
});

// Track purchase
trackEvent('purchase', {
  transactionId: order.id,
  value: order.total,
  currency: 'USD',
  items: order.items.map(item => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  })),
});
```

## User Identification

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export function UserTracker() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // Identify user in analytics
      if (window.gtag) {
        window.gtag('set', 'user_properties', {
          user_id: user.id,
          user_type: user.publicMetadata.userType,
        });
      }

      // Custom analytics service
      // analytics.identify(user.id, {
      //   email: user.emailAddresses[0].emailAddress,
      //   name: `${user.firstName} ${user.lastName}`,
      // });
    }
  }, [user]);

  return null;
}
```

## Privacy-First Analytics (Plausible)

```bash
npm install plausible-tracker
```

```typescript
// lib/plausible.ts
import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: 'yourdomain.com',
});

export function trackPageview() {
  plausible.trackPageview();
}

export function trackEvent(
  eventName: string,
  props?: Record<string, string | number>
) {
  plausible.trackEvent(eventName, { props });
}

// app/layout.tsx
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
  strategy="afterInteractive"
/>
```

## Cookie Consent

```typescript
'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      // Initialize analytics
      initializeAnalytics();
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    initializeAnalytics();
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="container flex items-center justify-between">
        <p>We use cookies to improve your experience.</p>
        <div className="flex gap-2">
          <button onClick={rejectCookies}>Reject</button>
          <button onClick={acceptCookies}>Accept</button>
        </div>
      </div>
    </div>
  );
}

function initializeAnalytics() {
  // Load Google Analytics
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
  document.head.appendChild(script);

  // Initialize
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', process.env.NEXT_PUBLIC_GA_ID);
}
```

## Server-Side Analytics

```typescript
// app/api/analytics/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { event, properties } = await request.json();

  // Store in database
  await db.events.create({
    data: {
      name: event,
      properties,
      timestamp: new Date(),
    },
  });

  // Send to analytics service
  // await sendToAnalytics(event, properties);

  return NextResponse.json({ success: true });
}

// Client
async function trackServerEvent(event: string, properties: any) {
  await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, properties }),
  });
}
```

## Best Practices

1. **Privacy first** - Get consent before tracking
2. **Track meaningful events** - Focus on business metrics
3. **Minimize data collection** - Only collect what's needed
4. **Anonymize when possible** - Use hashed IDs
5. **Comply with regulations** - GDPR, CCPA, etc.
6. **Test tracking** - Verify events fire correctly
7. **Document events** - Maintain event catalog
8. **Respect Do Not Track** - Honor user preferences

## Resources

- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Plausible Analytics](https://plausible.io/docs)

