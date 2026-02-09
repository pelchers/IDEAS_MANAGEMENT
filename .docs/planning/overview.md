# Idea Management App Overview

## Goal
Build a desktop Electron app for idea management and software development planning where each project is a real folder on disk and every app page maps directly to files in that project folder.

## Core Product Direction
- Google Drive-like project browser as the home experience.
- Per-project split view:
  - Left: project subfolders/files
  - Right: project overview and descriptors read from `project.json`
- Feature pages that map to default subfolders:
  - `planning/` for PRD/TRD/spec files
  - `kanban/` for a board file rendered as an interactive board
  - `whiteboard/` for node/container canvas data
  - `schema/` for data schema planner assets
  - `directory-tree/` for generated structure files
- Built-in AI workflow support through a CLI-driven sidebar in-app.

## Functional Emphasis
- Kanban board for planning and execution.
- Whiteboard with draggable, clickable, resizable containers (corner handles), rich text, and image inserts.
- User dashboard and ideas list for triage and prioritization.
- Node-based schema planner and whiteboard integration.
- Directory tree generator that can scaffold project structures.

## Outcome
A single system where ideation, planning, and execution artifacts stay connected to real project folders and remain easy to navigate and version.
