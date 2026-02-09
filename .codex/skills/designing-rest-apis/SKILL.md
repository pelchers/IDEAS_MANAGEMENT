---
name: designing-rest-apis
description: Design REST APIs with Next.js route handlers and webhooks. Use for creating type-safe API endpoints, handling HTTP methods, processing webhooks, and implementing API authentication.
---

# Designing REST APIs

Next.js 14 App Router API patterns for type-safe, production-ready REST APIs.

## Quick Start

### Basic Route Handler

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Dynamic Routes

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await db.users.findUnique({ where: { id: params.id } });

  if (!user) {
    return new NextResponse('Not found', { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const user = await db.users.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(user);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await db.users.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
```

## Request Validation

```typescript
import { z } from 'zod';
import { NextResponse } from 'next/server';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(13).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateUserSchema.parse(body);

    const user = await db.users.create({ data });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Authentication

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const data = await getUserData(userId);
  return NextResponse.json(data);
}

// API Key authentication
export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey || !isValidApiKey(apiKey)) {
    return new NextResponse('Invalid API key', { status: 401 });
  }

  // Process request
}
```

## Query Parameters

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sort = searchParams.get('sort') || 'createdAt';

  const users = await db.users.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sort]: 'desc' },
  });

  return NextResponse.json({
    data: users,
    page,
    limit,
    total: await db.users.count(),
  });
}
```

## Webhooks

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return new NextResponse('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return new NextResponse('OK', { status: 200 });
}
```

## Error Handling

```typescript
class APIError extends Error {
  constructor(
    public message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';

  const { success, limit, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  }

  // Process request
}
```

## CORS

```typescript
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

## Response Helpers

```typescript
// lib/api-response.ts
export class APIResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }

  static error(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
  }

  static created<T>(data: T) {
    return this.success(data, 201);
  }

  static noContent() {
    return new NextResponse(null, { status: 204 });
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message = 'Not found') {
    return this.error(message, 404);
  }
}

// Usage
export async function GET() {
  const users = await db.users.findMany();
  return APIResponse.success(users);
}
```

## Pagination Helper

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}

function paginate<T>(items: T[], params: PaginationParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  return {
    data: items.slice(skip, skip + limit),
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const users = await db.users.findMany();
  const result = paginate(users, { page, limit });

  return NextResponse.json(result);
}
```

## Best Practices

1. **Validate all inputs** - Use Zod for type-safe validation
2. **Authenticate requests** - Check auth before processing
3. **Handle errors gracefully** - Return proper status codes
4. **Use typed responses** - Consistent response format
5. **Rate limit public endpoints** - Prevent abuse
6. **Log errors** - Monitor API health
7. **Version your API** - Use /api/v1 for versioning
8. **Document endpoints** - OpenAPI/Swagger specs

## Resources

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [API Routes Best Practices](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

