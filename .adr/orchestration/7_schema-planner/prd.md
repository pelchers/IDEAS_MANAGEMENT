# PRD — 7_schema-planner

## Summary
The schema planner is a visual entity-relationship diagram tool for designing database schemas. It supports three data source modes: manual creation from scratch, import from a local directory (parsing project files for models/types), and import from a GitHub repository. All schemas are exportable to Prisma, SQL DDL, and JSON formats.

## Goals
- Entity cards matching pass-1 (thick borders, field rows, type badges)
- Rough.js hand-drawn relation lines between entities
- Full entity and field CRUD with real-time visual updates
- Three schema source modes: Manual, Local Directory, GitHub Repo
- Export to Prisma schema, SQL DDL, and JSON
- Persistent storage via artifact API

## Feature Areas

### 1. Schema CRUD (Manual Mode)
- Create, edit, delete entities with name and color
- Add, edit, delete fields with name, type, required, unique, PK, FK badges
- Create and delete relations between entities (1:1, 1:N, N:N)
- Drag entity cards to reposition on canvas
- Auto-save to artifact API on any change

### 2. GitHub Repository Import
- Connect to a public GitHub repo by owner/repo (or full URL)
- Fetch repo tree via GitHub API (no auth needed for public repos)
- Parse common schema files: Prisma (.prisma), TypeScript interfaces/types (.ts), SQL migrations (.sql), JSON schema (.json)
- Convert parsed models into schema entities with fields and types
- User can edit/extend the imported schema after import
- Option to re-sync from the same repo

### 3. Local Directory Import
- User provides a path or pastes a directory tree structure (text)
- Parse the tree to identify schema-like files
- For files the user uploads: parse Prisma, TypeScript, SQL, JSON schemas
- Convert parsed models into entities
- User can edit/extend after import

### 4. Export
- Export to Prisma schema format (.prisma)
- Export to SQL DDL (CREATE TABLE statements)
- Export to JSON (raw entity/relation data)
- Download as file or copy to clipboard

## Non-Goals
- Private GitHub repos (would require OAuth — defer to V2)
- Live sync with GitHub (one-time import, then manual re-sync)
- Code generation beyond schema files
