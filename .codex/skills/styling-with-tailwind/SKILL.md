---
name: styling-with-tailwind
description: Style with Tailwind CSS utilities, responsive design, and dark mode. Use for implementing layouts, animations, theming, and responsive components with utility-first CSS patterns.
---

# Styling with Tailwind CSS

Utility-first CSS framework for rapid, consistent, and responsive UI development.

## Quick Start

### Installation

```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configuration

**tailwind.config.ts**:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
      },
    },
  },
  plugins: [],
};

export default config;
```

**globals.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Core Utilities

### Layout

```tsx
{/* Flexbox */}
<div className="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>

{/* Grid */}
<div className="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

{/* Container */}
<div className="container mx-auto px-4">
  <p>Centered content with padding</p>
</div>
```

### Spacing

```tsx
{/* Padding */}
<div className="p-4">All sides</div>
<div className="px-4 py-2">Horizontal & Vertical</div>
<div className="pt-8 pb-4">Top & Bottom</div>

{/* Margin */}
<div className="m-4">All sides</div>
<div className="mx-auto">Centered horizontally</div>
<div className="mt-8 mb-4">Top & Bottom</div>

{/* Gap */}
<div className="flex gap-4">Items with gap</div>
```

### Typography

```tsx
{/* Font Size */}
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-base">Body text</p>
<small className="text-sm text-muted-foreground">Caption</small>

{/* Font Weight */}
<p className="font-light">Light</p>
<p className="font-normal">Normal</p>
<p className="font-semibold">Semibold</p>
<p className="font-bold">Bold</p>

{/* Text Alignment */}
<p className="text-left">Left</p>
<p className="text-center">Center</p>
<p className="text-right">Right</p>

{/* Truncate */}
<p className="truncate">Long text that will be truncated...</p>
<p className="line-clamp-2">Clamp to 2 lines...</p>
```

### Colors

```tsx
{/* Background */}
<div className="bg-primary">Primary background</div>
<div className="bg-secondary">Secondary background</div>
<div className="bg-muted">Muted background</div>

{/* Text */}
<p className="text-primary">Primary text</p>
<p className="text-secondary">Secondary text</p>
<p className="text-muted-foreground">Muted text</p>

{/* Border */}
<div className="border border-gray-200">With border</div>
<div className="border-2 border-primary">Thick primary border</div>
```

## Responsive Design

### Breakpoints

```tsx
{/* Mobile-first approach */}
<div className="
  text-sm          {/* Default: mobile */}
  sm:text-base     {/* 640px+ */}
  md:text-lg       {/* 768px+ */}
  lg:text-xl       {/* 1024px+ */}
  xl:text-2xl      {/* 1280px+ */}
  2xl:text-3xl     {/* 1536px+ */}
">
  Responsive text
</div>

{/* Responsive grid */}
<div className="
  grid
  grid-cols-1      {/* Mobile: 1 column */}
  md:grid-cols-2   {/* Tablet: 2 columns */}
  lg:grid-cols-3   {/* Desktop: 3 columns */}
  gap-4
">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Hide/Show Elements

```tsx
{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">
  Desktop only
</div>

{/* Show on mobile, hide on desktop */}
<div className="block lg:hidden">
  Mobile only
</div>
```

## Dark Mode

### Setup

**tailwind.config.ts**:
```typescript
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
};
```

### Usage

```tsx
{/* Light/dark variants */}
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
">
  Adapts to theme
</div>

{/* Complex dark mode */}
<div className="
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-gray-700
  shadow-sm dark:shadow-gray-800
">
  Card with dark mode
</div>
```

### Theme Toggle

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-accent"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
```

## Common Patterns

### Card Component

```tsx
<div className="
  rounded-lg
  border border-gray-200 dark:border-gray-800
  bg-white dark:bg-gray-900
  p-6
  shadow-sm
  hover:shadow-md
  transition-shadow
">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Button Variants

```tsx
{/* Primary */}
<button className="
  bg-primary text-primary-foreground
  px-4 py-2 rounded-md
  font-medium
  hover:bg-primary/90
  transition-colors
">
  Primary
</button>

{/* Secondary */}
<button className="
  bg-secondary text-secondary-foreground
  px-4 py-2 rounded-md
  font-medium
  hover:bg-secondary/80
  transition-colors
">
  Secondary
</button>

{/* Outline */}
<button className="
  border border-input
  bg-background
  px-4 py-2 rounded-md
  font-medium
  hover:bg-accent hover:text-accent-foreground
  transition-colors
">
  Outline
</button>

{/* Ghost */}
<button className="
  px-4 py-2 rounded-md
  font-medium
  hover:bg-accent hover:text-accent-foreground
  transition-colors
">
  Ghost
</button>
```

### Form Input

```tsx
<input
  type="text"
  className="
    flex h-10 w-full
    rounded-md border border-input
    bg-background
    px-3 py-2
    text-sm
    ring-offset-background
    file:border-0 file:bg-transparent file:text-sm file:font-medium
    placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
  "
  placeholder="Enter text..."
/>
```

### Hero Section

```tsx
<section className="
  container mx-auto
  px-4 py-16 md:py-24
  text-center
">
  <h1 className="
    text-4xl md:text-5xl lg:text-6xl
    font-bold
    mb-6
  ">
    Welcome to Our App
  </h1>
  <p className="
    text-lg md:text-xl
    text-muted-foreground
    max-w-2xl mx-auto
    mb-8
  ">
    Build amazing things with our platform
  </p>
  <button className="
    bg-primary text-primary-foreground
    px-6 py-3 rounded-md
    font-medium
    hover:bg-primary/90
    transition-colors
  ">
    Get Started
  </button>
</section>
```

### Navigation Bar

```tsx
<nav className="
  sticky top-0 z-50
  w-full
  border-b bg-background/95
  backdrop-blur
  supports-[backdrop-filter]:bg-background/60
">
  <div className="container flex h-14 items-center">
    <div className="mr-4 flex">
      <a href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold">Logo</span>
      </a>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
        <a href="/about">About</a>
      </nav>
    </div>
    <div className="ml-auto flex items-center space-x-4">
      <button>Sign In</button>
    </div>
  </div>
</nav>
```

## Animations

### Transitions

```tsx
{/* Basic transition */}
<div className="transition-all duration-300 hover:scale-105">
  Hover to scale
</div>

{/* Color transition */}
<button className="
  bg-primary
  transition-colors duration-200
  hover:bg-primary/90
">
  Smooth color change
</button>

{/* Shadow transition */}
<div className="
  shadow-sm
  transition-shadow duration-300
  hover:shadow-lg
">
  Hover for shadow
</div>
```

### Transforms

```tsx
{/* Scale */}
<button className="hover:scale-110 active:scale-95 transition-transform">
  Scale on hover
</button>

{/* Rotate */}
<div className="hover:rotate-12 transition-transform">
  Rotate on hover
</div>

{/* Translate */}
<div className="hover:-translate-y-1 transition-transform">
  Lift on hover
</div>
```

### Animations

```tsx
{/* Spin */}
<div className="animate-spin">
  <LoaderIcon />
</div>

{/* Pulse */}
<div className="animate-pulse">
  Loading...
</div>

{/* Bounce */}
<div className="animate-bounce">
  ↓
</div>
```

## Custom Utilities

### Add to tailwind.config.ts

```typescript
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
};
```

## Best Practices

1. **Mobile-first** - Start with mobile styles, add responsive variants
2. **Use CSS variables** - For theme colors and values
3. **Compose utilities** - Group related utilities with comments
4. **Avoid @apply** - Use utilities directly in HTML
5. **Use arbitrary values sparingly** - Stick to design system
6. **Leverage dark mode** - Always consider dark mode variants
7. **Optimize for performance** - Purge unused styles in production

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com)
- [Play CDN](https://tailwindcss.com/docs/installation/play-cdn)

