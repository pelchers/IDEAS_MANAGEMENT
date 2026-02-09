---
name: using-radix-primitives
description: Use Radix UI primitives for accessible, composable components. Use for building custom UI components with built-in accessibility, keyboard navigation, and focus management.
---

# Using Radix Primitives

Unstyled, accessible UI primitives for building custom components with Radix UI.

## Installation

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
# Install only the primitives you need
```

## Dialog

```typescript
import * as Dialog from '@radix-ui/react-dialog';

export function AlertDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>Delete Account</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
          <Dialog.Title className="text-lg font-semibold">
            Are you sure?
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mt-2">
            This action cannot be undone. This will permanently delete your account.
          </Dialog.Description>
          <div className="mt-4 flex gap-2 justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2">Cancel</button>
            </Dialog.Close>
            <button className="px-4 py-2 bg-red-500 text-white">
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Dropdown Menu

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function UserMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full">
          <Avatar />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white rounded-lg shadow-lg p-1"
          sideOffset={5}
        >
          <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
            Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-red-500">
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

## Popover

```typescript
import * as Popover from '@radix-ui/react-popover';

export function DatePicker() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button>Pick a date</button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-lg shadow-lg p-4"
          sideOffset={5}
        >
          <div>
            {/* Calendar component */}
            <Calendar />
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

## Tabs

```typescript
import * as Tabs from '@radix-ui/react-tabs';

export function ProfileTabs() {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List className="flex border-b">
        <Tabs.Trigger
          value="overview"
          className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
        >
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger
          value="activity"
          className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
        >
          Activity
        </Tabs.Trigger>
        <Tabs.Trigger
          value="settings"
          className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
        >
          Settings
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="overview" className="p-4">
        <OverviewPanel />
      </Tabs.Content>
      <Tabs.Content value="activity" className="p-4">
        <ActivityPanel />
      </Tabs.Content>
      <Tabs.Content value="settings" className="p-4">
        <SettingsPanel />
      </Tabs.Content>
    </Tabs.Root>
  );
}
```

## Accordion

```typescript
import * as Accordion from '@radix-ui/react-accordion';

export function FAQ() {
  return (
    <Accordion.Root type="multiple">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger className="flex justify-between w-full py-4">
            <span>What is Radix UI?</span>
            <ChevronDownIcon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="pb-4">
          Radix UI is a library of unstyled, accessible components.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger className="flex justify-between w-full py-4">
            <span>How do I style components?</span>
            <ChevronDownIcon />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="pb-4">
          Use Tailwind CSS, CSS-in-JS, or any styling solution.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
```

## Select

```typescript
import * as Select from '@radix-ui/react-select';

export function CountrySelect() {
  return (
    <Select.Root>
      <Select.Trigger className="px-4 py-2 border rounded">
        <Select.Value placeholder="Select a country" />
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-white rounded shadow-lg">
          <Select.Viewport className="p-1">
            <Select.Item value="us" className="px-2 py-1 hover:bg-gray-100">
              <Select.ItemText>United States</Select.ItemText>
            </Select.Item>
            <Select.Item value="ca" className="px-2 py-1 hover:bg-gray-100">
              <Select.ItemText>Canada</Select.ItemText>
            </Select.Item>
            <Select.Item value="uk" className="px-2 py-1 hover:bg-gray-100">
              <Select.ItemText>United Kingdom</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

## Slider

```typescript
import * as Slider from '@radix-ui/react-slider';

export function VolumeSlider() {
  return (
    <Slider.Root
      className="relative flex items-center w-48 h-5"
      defaultValue={[50]}
      max={100}
      step={1}
    >
      <Slider.Track className="relative grow h-1 bg-gray-200 rounded">
        <Slider.Range className="absolute h-full bg-blue-500 rounded" />
      </Slider.Track>
      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full" />
    </Slider.Root>
  );
}
```

## Toast

```typescript
import * as Toast from '@radix-ui/react-toast';
import { useState } from 'react';

export function ToastDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Toast.Provider swipeDirection="right">
      <button onClick={() => setOpen(true)}>Show Toast</button>

      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        className="bg-white rounded-lg shadow-lg p-4"
      >
        <Toast.Title className="font-semibold">Success!</Toast.Title>
        <Toast.Description className="text-sm text-gray-600">
          Your changes have been saved.
        </Toast.Description>
        <Toast.Action asChild altText="Undo">
          <button className="text-sm text-blue-500">Undo</button>
        </Toast.Action>
        <Toast.Close>×</Toast.Close>
      </Toast.Root>

      <Toast.Viewport className="fixed bottom-0 right-0 p-4" />
    </Toast.Provider>
  );
}
```

## Tooltip

```typescript
import * as Tooltip from '@radix-ui/react-tooltip';

export function IconButton() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="p-2">
            <TrashIcon />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-sm"
            sideOffset={5}
          >
            Delete item
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

## Context Menu

```typescript
import * as ContextMenu from '@radix-ui/react-context-menu';

export function FileItem() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="block p-4 border">
        Right-click me
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="bg-white rounded shadow-lg p-1">
          <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100">
            Open
          </ContextMenu.Item>
          <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100">
            Rename
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
          <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100 text-red-500">
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
```

## Composition Pattern

```typescript
// Build complex components from primitives
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

export function SettingsDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Settings</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Tabs.Root defaultValue="general">
            <Tabs.List>
              <Tabs.Trigger value="general">General</Tabs.Trigger>
              <Tabs.Trigger value="security">Security</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="general">
              <GeneralSettings />
            </Tabs.Content>
            <Tabs.Content value="security">
              <SecuritySettings />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Data Attributes for Styling

```typescript
// Radix uses data attributes for state
<Tabs.Trigger
  className="
    px-4 py-2
    data-[state=active]:bg-blue-500
    data-[state=inactive]:bg-gray-100
    data-[disabled]:opacity-50
  "
>
  Tab
</Tabs.Trigger>

// Available data attributes:
// - data-[state=open|closed]
// - data-[state=active|inactive]
// - data-[disabled]
// - data-[highlighted]
// - data-[placeholder]
```

## Accessibility Features

All Radix primitives include:
- **Keyboard navigation** - Arrow keys, Enter, Escape, etc.
- **Focus management** - Auto-focus, focus trapping
- **ARIA attributes** - Proper roles, labels, states
- **Screen reader support** - Announcements, descriptions
- **RTL support** - Right-to-left language support

## Best Practices

1. **Use asChild prop** - Merge props with custom components
2. **Portal for overlays** - Render dialogs, popovers outside DOM hierarchy
3. **Style with data attributes** - Use state data attributes
4. **Compose primitives** - Build complex UIs from simple parts
5. **Follow ARIA patterns** - Primitives implement WAI-ARIA
6. **Test keyboard navigation** - Ensure all interactions work
7. **Customize focus styles** - Make focus indicators visible

## Resources

- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [Radix UI GitHub](https://github.com/radix-ui/primitives)
- [shadcn/ui](https://ui.shadcn.com) - Pre-styled Radix components

