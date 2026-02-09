---
name: managing-typescript-types
description: Manage TypeScript types with generics, type guards, and utility types. Use for creating type-safe code, inferring types, building reusable type patterns, and ensuring compile-time safety.
---

# Managing TypeScript Types

Master TypeScript's type system for type-safe, maintainable, and self-documenting code.

## Quick Start

### Basic Types

```typescript
// Primitives
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;
const nothing: null = null;
const notDefined: undefined = undefined;

// Arrays
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ['a', 'b', 'c'];

// Tuples
const coordinates: [number, number] = [10, 20];

// Any (avoid when possible)
let anything: any = 'hello';
anything = 42; // No error

// Unknown (safer than any)
let value: unknown = 'hello';
if (typeof value === 'string') {
  console.log(value.toUpperCase()); // OK after type guard
}
```

### Interfaces & Types

```typescript
// Interface
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional
  readonly createdAt: Date; // Read-only
}

// Type alias
type UserRole = 'admin' | 'user' | 'moderator';

type UserWithRole = User & {
  role: UserRole;
};

// Extending interfaces
interface Admin extends User {
  permissions: string[];
}
```

## Generics

### Basic Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');
const auto = identity(true); // Type inference

// Generic interface
interface Response<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: Response<User> = {
  data: { id: '1', name: 'John', email: 'john@example.com', createdAt: new Date() },
  status: 200,
  message: 'Success',
};

// Generic type
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};
```

### Constrained Generics

```typescript
// Constraint with extends
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: '1', name: 'John', age: 30 };
const name = getProperty(user, 'name'); // OK
// const invalid = getProperty(user, 'invalid'); // Error

// Multiple constraints
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ name: 'John' }, { age: 30 });
```

### Generic Classes

```typescript
class GenericArray<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  getAll(): T[] {
    return this.items;
  }
}

const numberArray = new GenericArray<number>();
numberArray.add(1);
numberArray.add(2);

const stringArray = new GenericArray<string>();
stringArray.add('hello');
```

## Type Guards

### typeof Type Guards

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript knows it's string
  } else {
    return value.toFixed(2); // TypeScript knows it's number
  }
}
```

### instanceof Type Guards

```typescript
class Dog {
  bark() { console.log('Woof!'); }
}

class Cat {
  meow() { console.log('Meow!'); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows it's Dog
  } else {
    animal.meow(); // TypeScript knows it's Cat
  }
}
```

### Custom Type Guards

```typescript
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // TypeScript knows it's Fish
  } else {
    pet.fly(); // TypeScript knows it's Bird
  }
}
```

### Discriminated Unions

```typescript
interface SuccessResponse {
  type: 'success';
  data: any;
}

interface ErrorResponse {
  type: 'error';
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
  if (response.type === 'success') {
    console.log(response.data); // OK
  } else {
    console.error(response.error); // OK
  }
}
```

## Utility Types

### Partial & Required

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// Make all properties optional
type PartialUser = Partial<User>;
const update: PartialUser = { name: 'John' }; // OK

// Make all properties required
interface OptionalUser {
  id?: string;
  name?: string;
}

type RequiredUser = Required<OptionalUser>;
const user: RequiredUser = { id: '1', name: 'John' }; // All required
```

### Pick & Omit

```typescript
// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
const preview: UserPreview = { id: '1', name: 'John' };

// Omit specific properties
type UserWithoutEmail = Omit<User, 'email'>;
const withoutEmail: UserWithoutEmail = { id: '1', name: 'John' };
```

### Record

```typescript
// Create object type with specific keys
type Role = 'admin' | 'user' | 'moderator';

type RolePermissions = Record<Role, string[]>;

const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read'],
  moderator: ['read', 'write'],
};
```

### Readonly & ReadonlyArray

```typescript
interface Config {
  apiUrl: string;
  timeout: number;
}

type ReadonlyConfig = Readonly<Config>;

const config: ReadonlyConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

// config.apiUrl = 'new-url'; // Error: readonly

// Readonly array
const numbers: ReadonlyArray<number> = [1, 2, 3];
// numbers.push(4); // Error: readonly
```

### ReturnType & Parameters

```typescript
function createUser(name: string, age: number) {
  return { id: '1', name, age };
}

// Get return type
type User = ReturnType<typeof createUser>;
// { id: string; name: string; age: number; }

// Get parameter types
type CreateUserParams = Parameters<typeof createUser>;
// [string, number]
```

### Awaited (Unwrap Promise)

```typescript
async function fetchUser(): Promise<User> {
  return { id: '1', name: 'John', email: 'john@example.com', createdAt: new Date() };
}

type UserType = Awaited<ReturnType<typeof fetchUser>>;
// User (not Promise<User>)
```

## Advanced Patterns

### Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<number>; // false

// With infer
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FnReturn = GetReturnType<() => number>; // number
```

### Mapped Types

```typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface User {
  id: string;
  name: string;
}

type OptionalUser = Optional<User>;
// { id?: string; name?: string; }

type NullableUser = Nullable<User>;
// { id: string | null; name: string | null; }
```

### Template Literal Types

```typescript
type EventName = 'click' | 'scroll' | 'mousemove';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onScroll' | 'onMousemove'

type Getter<T extends string> = `get${Capitalize<T>}`;
type Setter<T extends string> = `set${Capitalize<T>}`;

type PropertyAccessors<T extends string> = Getter<T> | Setter<T>;
// 'getName' | 'setName'
```

### Branded Types

```typescript
type UserId = string & { readonly __brand: unique symbol };
type ProductId = string & { readonly __brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createProductId(id: string): ProductId {
  return id as ProductId;
}

function getUser(id: UserId) { /* ... */ }

const userId = createUserId('123');
const productId = createProductId('456');

getUser(userId); // OK
// getUser(productId); // Error: different brands
```

## React TypeScript Patterns

### Component Props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
```

### Generic Components

```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
}

export function Select<T>({ options, value, onChange, getLabel }: SelectProps<T>) {
  return (
    <select value={String(value)} onChange={e => onChange(options[Number(e.target.value)])}>
      {options.map((option, index) => (
        <option key={index} value={index}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

### Hooks with Types

```typescript
import { useState } from 'react';

// Type inference
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// Explicit type
const [user, setUser] = useState<User | null>(null);

// Custom hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
}
```

## Best Practices

1. **Use strict mode** - Enable `strict: true` in tsconfig.json
2. **Avoid any** - Use `unknown` instead, then narrow with type guards
3. **Prefer interfaces for objects** - Extend easily, better error messages
4. **Use type for unions** - Better for complex type operations
5. **Leverage type inference** - Don't over-annotate
6. **Use readonly** - Prevent accidental mutations
7. **Create branded types** - For IDs and sensitive values
8. **Document complex types** - Use JSDoc comments

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)

