---
name: handling-application-errors
description: Handle application errors with error boundaries, logging, and user feedback. Use for implementing error recovery, monitoring errors, and providing graceful degradation.
---

# Handling Application Errors

Robust error handling for production-ready Next.js applications.

## Error Boundaries

### Global Error Boundary

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Route-Specific Error Boundary

```typescript
// app/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4">
      <h2>Dashboard Error</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Reload Dashboard</button>
    </div>
  );
}
```

### Global Error (500 Pages)

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Critical Error</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Reload</button>
      </body>
    </html>
  );
}
```

## Not Found Handling

```typescript
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link href="/">Go home</Link>
    </div>
  );
}

// Trigger from page
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getProfile(params.slug);

  if (!profile) {
    notFound(); // Shows not-found.tsx
  }

  return <ProfileView profile={profile} />;
}
```

## API Error Handling

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation error
    const data = UserSchema.parse(body);

    // Business logic error
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const user = await db.user.create({ data });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    // Database error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Unknown error
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

// Usage
export async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}
```

## Error Logging

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
) {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };

  // Console (development)
  if (process.env.NODE_ENV === 'development') {
    console[level](JSON.stringify(logEntry, null, 2));
    return;
  }

  // Production logging service (e.g., Sentry, LogRocket)
  if (level === 'error') {
    // Send to error tracking
    // Sentry.captureException(new Error(message), { extra: context });
  }

  // Send to logging service
  // sendToLogService(logEntry);
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    log('info', message, context),
  warn: (message: string, context?: LogContext) =>
    log('warn', message, context),
  error: (message: string, context?: LogContext) =>
    log('error', message, context),
};

// Usage
logger.error('Failed to create user', {
  userId: '123',
  error: error.message,
  stack: error.stack,
});
```

## Toast Notifications

```typescript
'use client';

import { useToast } from '@/components/ui/use-toast';

export function CreatePostForm() {
  const { toast } = useToast();

  async function handleSubmit(data: FormData) {
    try {
      await createPost(data);

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Retry Logic

```typescript
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// Usage
const data = await fetchWithRetry(
  () => fetch('/api/data').then((r) => r.json()),
  3,
  1000
);
```

## Graceful Degradation

```typescript
'use client';

import { useEffect, useState } from 'react';

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(setError);
  }, []);

  // Show error state with fallback
  if (error) {
    return (
      <div className="p-4 border border-destructive rounded-md">
        <p className="text-destructive">Failed to load analytics</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error.message}
        </p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return <Skeleton />;

  return <Analytics data={data} />;
}
```

## Error Monitoring (Sentry)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
    }
    return event;
  },
});

// Manual error capture
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    extra: {
      userId: user.id,
      operation: 'riskyOperation',
    },
  });
}
```

## Best Practices

1. **Error boundaries at strategic levels** - Global + route-specific
2. **User-friendly messages** - Don't expose technical details
3. **Log errors comprehensively** - Include context for debugging
4. **Graceful degradation** - Show fallback UI when features fail
5. **Retry transient errors** - Network failures, rate limits
6. **Monitor errors in production** - Use Sentry, LogRocket, etc.
7. **Validate inputs early** - Fail fast with clear messages
8. **Handle async errors** - Always catch Promise rejections

## Resources

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Handling Patterns](https://www.patterns.dev/posts/error-handling)

