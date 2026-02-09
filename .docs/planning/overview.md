# Idea Management App Overview

## Goal
Build a production-ready product with two clients that stay functionally aligned:
- Desktop app (Electron) for deep local filesystem workflows
- Web app (Next.js) for browser access and hosted collaboration

Each project is represented by a real folder structure and mirrored to cloud-backed storage/services for authenticated multi-device use.

## Core Product Direction
- Google Drive-like project browser as the home experience.
- Per-project split view:
  - Left: project subfolders/files
  - Right: project overview and descriptors read from `project.json`
- Feature pages map directly to project artifacts:
  - `planning/` docs (PRD/TRD/notes)
  - `kanban/` board data
  - `whiteboard/` canvas data and assets
  - `schema/` model graphs and exports
  - `directory-tree/` generated structure plans
  - `ideas/` captured idea backlog
- AI included in Phase 1:
  - Contextual sidebar on workspace pages
  - Dedicated full-page AI chat with tool actions across project files

## Functional Emphasis
- Kanban board for planning and execution.
- Whiteboard with draggable, clickable, resizable containers (corner handles), rich text, and image inserts.
- Ideas list for rapid capture and conversion into tasks/artifacts.
- Node-based schema planner.
- Directory tree generator.
- Authenticated user accounts, subscription gating, and admin override account.

## Product Posture
This is not an MVP scope. Planning, architecture, security, billing, and operations target deployable production quality for 1,000+ active users.
