---
name: ensuring-accessibility
description: Ensure accessibility with WCAG compliance, ARIA attributes, and semantic HTML. Use for building inclusive interfaces, keyboard navigation, screen reader support, and accessible forms.
---

# Ensuring Accessibility

Build inclusive web applications that work for everyone with WCAG 2.1 AA compliance.

## Semantic HTML

```typescript
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>

// Bad
<div className="heading">Title</div>

// Good
<h1>Title</h1>

// Bad
<div className="list">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Good
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

## Keyboard Navigation

```typescript
'use client';

export function Dialog({ open, onClose }: DialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <h2 id="dialog-title">Dialog Title</h2>
      <p>Dialog content</p>
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
}

// Custom keyboard navigation
export function Menu() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(items[selectedIndex]);
        break;
    }
  };

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === selectedIndex ? 0 : -1}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

## ARIA Attributes

```typescript
// Labels
<button aria-label="Close dialog">×</button>

// Described by
<input
  type="email"
  aria-describedby="email-help"
  aria-invalid={errors.email ? 'true' : 'false'}
/>
<span id="email-help">We'll never share your email</span>

// Live regions (for dynamic content)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Hidden content
<span className="sr-only">
  This text is only for screen readers
</span>

// Expanded/Collapsed
<button
  aria-expanded={isOpen}
  aria-controls="menu"
  onClick={() => setIsOpen(!isOpen)}
>
  Menu
</button>
<div id="menu" hidden={!isOpen}>
  Menu items
</div>
```

## Focus Management

```typescript
'use client';

import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus modal
      modalRef.current?.focus();
    } else {
      // Restore focus when closed
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

## Color Contrast

```typescript
// Use CSS variables with WCAG AA compliant colors
:root {
  --color-text: oklch(0.2 0 0); /* Dark text */
  --color-background: oklch(1 0 0); /* White background */
  --color-primary: oklch(0.5 0.15 240); /* Blue with sufficient contrast */
}

// Check contrast ratios
// Normal text: 4.5:1 minimum
// Large text (18pt+): 3:1 minimum
// Use tools like WebAIM Contrast Checker
```

## Forms

```typescript
'use client';

import { useForm } from 'react-hook-form';

export function AccessibleForm() {
  const {
    register,
    formState: { errors },
  } = useForm();

  return (
    <form>
      <div>
        <label htmlFor="name">
          Name <span aria-label="required">*</span>
        </label>
        <input
          id="name"
          {...register('name', { required: 'Name is required' })}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" role="alert" className="text-destructive">
            {errors.name.message}
          </span>
        )}
      </div>

      <fieldset>
        <legend>Choose your plan</legend>
        <div>
          <input
            type="radio"
            id="plan-free"
            {...register('plan')}
            value="free"
          />
          <label htmlFor="plan-free">Free</label>
        </div>
        <div>
          <input
            type="radio"
            id="plan-pro"
            {...register('plan')}
            value="pro"
          />
          <label htmlFor="plan-pro">Pro</label>
        </div>
      </fieldset>

      <div>
        <input
          type="checkbox"
          id="terms"
          {...register('terms')}
        />
        <label htmlFor="terms">I accept the terms and conditions</label>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Images

```typescript
import Image from 'next/image';

// Decorative images (alt="")
<Image src="/decoration.svg" alt="" width={100} height={100} />

// Informative images
<Image
  src="/chart.png"
  alt="Sales increased by 30% in Q4"
  width={500}
  height={300}
/>

// Complex images with long description
<figure>
  <Image
    src="/complex-chart.png"
    alt="Quarterly sales breakdown"
    width={800}
    height={400}
  />
  <figcaption>
    Detailed breakdown: Q1 had $100k, Q2 had $150k, Q3 had $120k, Q4 had $200k
  </figcaption>
</figure>

// Icons with accessible labels
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>
```

## Skip Links

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <nav>{/* Navigation */}</nav>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}

// styles/globals.css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Tables

```typescript
export function DataTable({ data }: { data: User[] }) {
  return (
    <table>
      <caption>User List</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
        </tr>
      </thead>
      <tbody>
        {data.map((user) => (
          <tr key={user.id}>
            <th scope="row">{user.name}</th>
            <td>{user.email}</td>
            <td>{user.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Loading States

```typescript
export function LoadingButton({ loading, children }: LoadingButtonProps) {
  return (
    <button disabled={loading} aria-busy={loading}>
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
      <span aria-hidden={loading}>{children}</span>
    </button>
  );
}

// Loading indicator
export function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading content...</span>
      <Spinner aria-hidden="true" />
    </div>
  );
}
```

## Testing Accessibility

```bash
npm install @axe-core/react
```

```typescript
// _app.tsx (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

1. **Keyboard only** - Navigate entire site with Tab, Enter, Arrows, Escape
2. **Screen reader** - Test with NVDA (Windows), VoiceOver (Mac), JAWS
3. **Zoom to 200%** - Ensure layout doesn't break
4. **Color blindness** - Use Chrome DevTools color vision deficiency emulator
5. **Lighthouse audit** - Check accessibility score (aim for 100)

## Best Practices

1. **Use semantic HTML** - Proper elements for proper purposes
2. **Keyboard accessible** - All interactive elements reachable
3. **ARIA when needed** - Supplement, don't replace semantics
4. **Sufficient contrast** - WCAG AA minimum (4.5:1)
5. **Alt text for images** - Descriptive, empty for decorative
6. **Focus indicators** - Visible when navigating by keyboard
7. **Form labels** - Every input has an associated label
8. **Test with real users** - Include people with disabilities

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

