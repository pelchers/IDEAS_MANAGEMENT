---
name: handling-react-forms
description: Handle React forms with React Hook Form and Zod validation. Use for building type-safe forms, managing form state, handling validation errors, and integrating with UI component libraries.
---

# Handling React Forms

React Hook Form + Zod for performant, type-safe forms with minimal re-renders.

## Quick Start

```bash
npm install react-hook-form @hookform/resolvers zod
```

## Basic Form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    await login(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Login'}
      </button>
    </form>
  );
}
```

## With shadcn/ui Components

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>Your public display name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Form Validation Patterns

```typescript
// Complex validation schema
const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),

  email: z.string().email('Invalid email address'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),

  confirmPassword: z.string(),

  age: z.number().int().min(13, 'Must be at least 13'),

  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

## Field Types

### Text Input

```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input placeholder="John Doe" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Number Input

```typescript
<FormField
  control={form.control}
  name="age"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Age</FormLabel>
      <FormControl>
        <Input
          type="number"
          {...field}
          onChange={e => field.onChange(parseInt(e.target.value))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select

```typescript
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea

```typescript
<FormField
  control={form.control}
  name="bio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bio</FormLabel>
      <FormControl>
        <Textarea placeholder="Tell us about yourself" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox

```typescript
<FormField
  control={form.control}
  name="marketing"
  render={({ field }) => (
    <FormItem className="flex items-center space-x-2">
      <FormControl>
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <FormLabel>Send me marketing emails</FormLabel>
    </FormItem>
  )}
/>
```

### Radio Group

```typescript
<FormField
  control={form.control}
  name="plan"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Plan</FormLabel>
      <FormControl>
        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pro" id="pro" />
            <Label htmlFor="pro">Pro</Label>
          </div>
        </RadioGroup>
      </FormControl>
    </FormItem>
  )}
/>
```

### File Upload

```typescript
const schema = z.object({
  avatar: z.instanceof(File).optional(),
});

<FormField
  control={form.control}
  name="avatar"
  render={({ field: { value, onChange, ...field } }) => (
    <FormItem>
      <FormLabel>Avatar</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept="image/*"
          {...field}
          onChange={e => onChange(e.target.files?.[0])}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

## Dynamic Fields (Arrays)

```typescript
import { useFieldArray } from 'react-hook-form';

const schema = z.object({
  links: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url(),
  })),
});

export function LinksForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      links: [{ title: '', url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`links.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Title" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`links.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="URL" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => append({ title: '', url: '' })}>
          Add Link
        </Button>
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

## Form State Management

```typescript
const {
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  formState: { errors, isDirty, isValid, isSubmitting },
} = useForm<FormData>();

// Watch field value
const emailValue = watch('email');

// Set field value programmatically
setValue('email', 'new@example.com');

// Reset form
reset();

// Reset with new values
reset({ email: 'default@example.com' });
```

## Async Validation

```typescript
const schema = z.object({
  username: z.string()
    .min(3)
    .refine(
      async (username) => {
        const available = await checkUsernameAvailability(username);
        return available;
      },
      { message: 'Username is already taken' }
    ),
});
```

## Server Actions Integration

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const data = {
    title: formData.get('title'),
    content: formData.get('content'),
  };

  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.posts.create({ data: result.data });
  return { success: true };
}

// Client component
'use client';

export function CreatePostForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);

    const result = await createPost(formData);

    if (result.errors) {
      // Handle errors
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## Error Handling

```typescript
// Display field errors
{errors.email && <span className="text-destructive">{errors.email.message}</span>}

// Display all errors
{Object.keys(errors).length > 0 && (
  <div className="text-destructive">
    Please fix the errors above
  </div>
)}

// Set custom errors
form.setError('email', {
  type: 'manual',
  message: 'This email is already registered',
});

// Clear errors
form.clearErrors('email');
```

## Best Practices

1. **Use Zod for validation** - Type-safe and runtime validated
2. **Leverage defaultValues** - Prevent uncontrolled to controlled warnings
3. **Use FormField with shadcn/ui** - Consistent, accessible forms
4. **Handle loading states** - Show feedback during submission
5. **Reset form after submit** - Clear form or update with new values
6. **Validate on blur** - Better UX than on change
7. **Use useFieldArray** - For dynamic lists
8. **Server-side validation** - Never trust client-side only

## Resources

- [React Hook Form Docs](https://react-hook-form.com)
- [Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [shadcn/ui Forms](https://ui.shadcn.com/docs/components/form)

