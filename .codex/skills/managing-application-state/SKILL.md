---
name: managing-application-state
description: Manage application state with Zustand and React Query. Use for global state management, server state caching, optimistic updates, and client-side data synchronization.
---

# Managing Application State

Zustand for client state + React Query for server state = optimal state management.

## Zustand (Client State)

### Installation

```bash
npm install zustand
```

### Basic Store

```typescript
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// Usage
function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

### Persist State

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'preferences', // localStorage key
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
```

### Immer Middleware (Immutable Updates)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],
    addTodo: (todo) =>
      set((state) => {
        state.todos.push(todo); // Direct mutation with Immer
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) todo.completed = !todo.completed;
      }),
    removeTodo: (id) =>
      set((state) => {
        state.todos = state.todos.filter((t) => t.id !== id);
      }),
  }))
);
```

### Slices Pattern

```typescript
// User slice
interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

// UI slice
interface UISlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const createUISlice = (set: any): UISlice => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state: any) => ({ sidebarOpen: !state.sidebarOpen })),
});

// Combined store
type Store = UserSlice & UISlice;

export const useStore = create<Store>()((...a) => ({
  ...createUserSlice(...a),
  ...createUISlice(...a),
}));
```

## React Query (Server State)

### Installation

```bash
npm install @tanstack/react-query
```

### Setup Provider

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';

function Posts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Query with Parameters

```typescript
function Post({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`);
      return res.json();
    },
    enabled: !!id, // Only run if id exists
  });

  return <div>{data?.title}</div>;
}
```

### Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPost: { title: string; content: string }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (data: { title: string; content: string }) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], (old: Todo[]) => [
      ...old,
      newTodo,
    ]);

    // Return context with snapshot
    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context?.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### Pagination

```typescript
function Posts() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      const res = await fetch(`/api/posts?page=${page}`);
      return res.json();
    },
    keepPreviousData: true, // Keep old data while fetching new
  });

  return (
    <>
      <PostList posts={data?.posts} />
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage((p) => p + 1)} disabled={!data?.hasMore}>
        Next
      </button>
    </>
  );
}
```

### Infinite Scroll

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function InfinitePosts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/posts?page=${pageParam}`);
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  return (
    <>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        {isFetchingNextPage ? 'Loading...' : 'Load More'}
      </button>
    </>
  );
}
```

## Convex Integration

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function Profile({ userId }: { userId: string }) {
  // Convex query (automatically reactive)
  const profile = useQuery(api.profiles.get, { userId });

  // Convex mutation
  const updateProfile = useMutation(api.profiles.update);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile.displayName}</h1>
      <button onClick={() => updateProfile({ userId, displayName: 'New Name' })}>
        Update
      </button>
    </div>
  );
}
```

## Combined Pattern (Zustand + React Query)

```typescript
// Use Zustand for UI state
const uiStore = useUIStore();

// Use React Query for server data
const { data: posts } = useQuery(['posts'], fetchPosts);

function PostsPage() {
  const { sidebarOpen, toggleSidebar } = useUIStore(); // UI state
  const { data, isLoading } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts }); // Server state

  return (
    <div>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      {sidebarOpen && <Sidebar />}
      {isLoading ? <Loading /> : <PostList posts={data} />}
    </div>
  );
}
```

## Best Practices

1. **Zustand for UI state** - Theme, sidebar, modals, form state
2. **React Query for server state** - API data, caching, synchronization
3. **Persist carefully** - Only persist what's necessary
4. **Use slices** - Organize large stores
5. **Leverage React Query caching** - Avoid duplicate requests
6. **Optimistic updates** - Better UX for mutations
7. **Handle loading/error states** - Always provide feedback
8. **Use Convex for real-time** - Automatic subscriptions

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Convex React Guide](https://docs.convex.dev/client/react)

