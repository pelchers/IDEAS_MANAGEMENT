---
name: validating-with-zod
description: Validate data with Zod schemas, refinements, and transforms. Use for form validation, API input validation, type inference, and runtime type safety with TypeScript integration.
---

# Validating with Zod

TypeScript-first schema validation with static type inference and runtime safety.

## Quick Start

### Installation

```bash
npm install zod
```

### Basic Schema

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

// Infer TypeScript type
type User = z.infer<typeof UserSchema>;

// Parse data (throws on invalid)
const user = UserSchema.parse({
  name: 'John',
  age: 30,
  email: 'john@example.com',
});

// Safe parse (returns result object)
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## Primitive Types

```typescript
// String
const StringSchema = z.string();
const MinLengthSchema = z.string().min(3);
const MaxLengthSchema = z.string().max(50);
const EmailSchema = z.string().email();
const UrlSchema = z.string().url();
const UuidSchema = z.string().uuid();

// Number
const NumberSchema = z.number();
const IntSchema = z.number().int();
const PositiveSchema = z.number().positive();
const MinSchema = z.number().min(0);
const MaxSchema = z.number().max(100);

// Boolean
const BooleanSchema = z.boolean();

// Date
const DateSchema = z.date();
const MinDateSchema = z.date().min(new Date('2024-01-01'));

// Literal
const LiteralSchema = z.literal('hello');
const RoleSchema = z.enum(['admin', 'user', 'moderator']);
```

## Objects

```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user']).default('user'),
  createdAt: z.date(),
});

// Optional fields
const OptionalSchema = z.object({
  required: z.string(),
  optional: z.string().optional(),
  nullable: z.string().nullable(),
  nullish: z.string().nullish(), // null or undefined
});

// Partial (all fields optional)
const PartialUserSchema = UserSchema.partial();

// Pick specific fields
const UserPreviewSchema = UserSchema.pick({
  id: true,
  name: true,
});

// Omit specific fields
const UserWithoutEmailSchema = UserSchema.omit({
  email: true,
});

// Extend schema
const AdminSchema = UserSchema.extend({
  permissions: z.array(z.string()),
});

// Merge schemas
const MergedSchema = z.object({ a: z.string() })
  .merge(z.object({ b: z.number() }));
```

## Arrays

```typescript
// Array of strings
const StringArraySchema = z.array(z.string());

// Array with constraints
const ArraySchema = z.array(z.number())
  .min(1) // At least 1 item
  .max(10) // At most 10 items
  .nonempty(); // Alias for .min(1)

// Array of objects
const UsersSchema = z.array(UserSchema);
```

## Unions & Discriminated Unions

```typescript
// Simple union
const StringOrNumber = z.union([z.string(), z.number()]);

// Discriminated union
const ResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('success'),
    data: z.any(),
  }),
  z.object({
    type: z.literal('error'),
    error: z.string(),
  }),
]);

type Response = z.infer<typeof ResponseSchema>;

function handleResponse(response: Response) {
  if (response.type === 'success') {
    console.log(response.data);
  } else {
    console.error(response.error);
  }
}
```

## Refinements (Custom Validation)

```typescript
// Simple refinement
const PasswordSchema = z.string()
  .min(8)
  .refine(
    (val) => /[A-Z]/.test(val),
    { message: 'Must contain uppercase letter' }
  )
  .refine(
    (val) => /[0-9]/.test(val),
    { message: 'Must contain number' }
  );

// Object refinement
const SignupSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords must match',
    path: ['confirmPassword'], // Error path
  }
);

// Complex refinement
const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);
```

## Transforms

```typescript
// Transform value
const TrimmedString = z.string().transform((val) => val.trim());

const NumberFromString = z.string().transform((val) => parseInt(val, 10));

// Transform object
const UserSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  email: z.string().email().transform((val) => val.toLowerCase()),
  age: z.string().transform((val) => parseInt(val, 10)),
});

// Pipe multiple transformations
const ProcessedSchema = z.string()
  .transform((val) => val.trim())
  .transform((val) => val.toLowerCase())
  .transform((val) => val.replace(/\s+/g, '-'));
```

## Form Validation

### React Hook Form Integration

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  age: z.number().int().min(13, 'Must be at least 13').max(120),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
});

type FormData = z.infer<typeof formSchema>;

export function SignupForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      age: 18,
      acceptTerms: false,
    },
  });

  async function onSubmit(data: FormData) {
    console.log(data); // Type-safe and validated
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>;
}
```

## API Validation

### Next.js API Route

```typescript
import { z } from 'zod';
import { NextResponse } from 'next/server';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(5).optional(),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const data = CreatePostSchema.parse(body);

    // Create post with validated data
    const post = await createPost(data);

    return NextResponse.json(post);
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

### Convex Validation

```typescript
import { v } from 'convex/values';
import { mutation } from './_generated/server';

// Convex has built-in validators, but you can use Zod for complex validation
export const createProfile = mutation({
  args: {
    slug: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Additional Zod validation
    const ProfileSchema = z.object({
      slug: z.string()
        .min(3)
        .max(30)
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
      displayName: z.string().min(1).max(50),
      bio: z.string().max(500).optional(),
    });

    const validated = ProfileSchema.parse(args);

    return await ctx.db.insert('profiles', validated);
  },
});
```

## Error Handling

```typescript
const result = UserSchema.safeParse(data);

if (!result.success) {
  // Access errors
  console.log(result.error.issues);

  // Format errors
  const fieldErrors = result.error.flatten();
  console.log(fieldErrors.fieldErrors);

  // Custom error formatting
  const errors = result.error.issues.reduce((acc, issue) => {
    const path = issue.path.join('.');
    acc[path] = issue.message;
    return acc;
  }, {} as Record<string, string>);

  return { errors };
}

const validData = result.data;
```

## Common Patterns

### Nested Objects

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
  country: z.string(),
});

const UserSchema = z.object({
  name: z.string(),
  address: AddressSchema,
  billingAddress: AddressSchema.optional(),
});
```

### Recursive Schemas

```typescript
type Category = {
  name: string;
  subcategories: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema),
  })
);
```

### Environment Variables

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.string().transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

### File Upload

```typescript
const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5_000_000, 'Max file size is 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
});
```

### URL Parameters

```typescript
const SearchParamsSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

// Usage in Next.js
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const params = SearchParamsSchema.parse(searchParams);
  // params is type-safe with defaults
}
```

## Best Practices

1. **Use safeParse for user input** - Avoid throwing errors
2. **Infer types from schemas** - Single source of truth
3. **Use refinements for complex validation** - Beyond basic types
4. **Provide clear error messages** - Help users fix issues
5. **Transform data early** - Normalize inputs (trim, lowercase)
6. **Validate at boundaries** - API routes, form submissions
7. **Reuse schemas** - DRY principle with extend/pick/omit
8. **Use discriminated unions** - For polymorphic data

## Resources

- [Zod Documentation](https://zod.dev)
- [React Hook Form Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)

