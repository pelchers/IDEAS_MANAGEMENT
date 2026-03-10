Phase: phase_2
Session: 2_design-system-and-shell
Date: 2026-03-10
Owner: orchestrator
Status: complete

# Phase 2 — App Shell (Navigation + Layout)

## Objectives
Build the AppShell, TopBar, and authenticated layout as a faithful 1:1 reproduction
of the pass-1 concept navigation system.

## Tasks
- [ ] Read pass-1 index.html navigation structure (hamburger, drawer, overlay, nav links)
- [ ] Read pass-1 app.js navigation handlers (hamburger toggle, overlay click, escape key)
- [ ] Build AppShell React component matching pass-1 exactly
- [ ] Build TopBar component matching pass-1 exactly
- [ ] Build authenticated layout wrapping children in AppShell + TopBar
- [ ] Wire all 10 nav links to correct routes
- [ ] Verify slam animation, overlay behavior, keyboard handling

## Pass-1 Navigation Reference (from index.html + app.js)
The navigation system has:
- Hamburger button: top-left, 48x48px, 3 horizontal lines (3px thick each)
- Nav drawer: 280px wide, slides from left with slam animation cubic-bezier(0.2,0,0,1)
- Overlay: semi-transparent black behind drawer, click to close
- 10 numbered nav links in the drawer:
  01 DASHBOARD    → /dashboard
  02 PROJECTS     → /projects (list view)
  03 WORKSPACE    → /projects/[id] (project detail)
  04 KANBAN       → /projects/[id]/kanban
  05 WHITEBOARD   → /projects/[id]/whiteboard
  06 SCHEMA       → /projects/[id]/schema
  07 DIRECTORY    → /projects/[id]/directory-tree
  08 IDEAS        → /projects/[id]/ideas
  09 AI CHAT      → /ai
  10 SETTINGS     → /settings
- User profile in drawer footer: avatar circle with initials, name, email
- Top bar: 60px height, fixed, view title (uppercase), search input, notification bell
- Close drawer: overlay click, Escape key, nav link click

## Deliverables
- AppShell component with drawer + overlay
- TopBar component with title + search + notification
- Authenticated layout
- All 10 routes navigable

## Validation Checklist
- [ ] Drawer opens with slam animation
- [ ] Drawer closes on overlay click, Escape, nav click
- [ ] All 10 nav links visible and routable
- [ ] Top bar shows view title in uppercase
- [ ] Phase review created
- [ ] Committed and pushed
