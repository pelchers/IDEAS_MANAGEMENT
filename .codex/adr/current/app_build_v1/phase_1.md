# Phase Plan

Phase: phase_1
Session: app_build_v1
Date: 2026-02-10
Owner: longrunning-agent
Status: in_progress

## Objectives
- Scaffold the monorepo structure and baseline dev scripts.
- Stand up a minimal Next.js web app with an API health endpoint and request middleware skeleton.
- Stand up a minimal Electron desktop spine that can select a local project root and render a file tree view.
- Add initial shared domain contracts (zod) for core artifacts.

## Task checklist
- [ ] Create monorepo layout: pps/web, pps/desktop, packages/*.
- [ ] Root tooling: pnpm-workspace.yaml, 	urbo.json, root package.json, base TS config.
- [ ] packages/schemas: initial zod schemas for project.json and sync operation envelope.
- [ ] pps/web: Next.js scaffold + GET /api/health.
- [ ] pps/desktop: Electron + React renderer; IPC for selectDirectory and listDirectory.
- [ ] Desktop: stub sync queue writer (append NDJSON op under .meta/).

## Deliverables
- Repo builds and runs dev servers for web and desktop.
- Electron can select a directory and render a simple tree.

## Validation checklist
- [ ] pnpm -w -r -v succeeds (workspace recognized)
- [ ] pnpm --filter web dev starts
- [ ] pnpm --filter desktop dev starts
- [ ] Desktop directory selection and listing works
- [ ] Changes committed

## Risks / blockers
- Electron and Next.js shared UI packaging can add complexity; keep Phase 1 minimal and focus on plumbing.

## Notes
- Requirements source: .codex/adr/orchestration/app_build_v1/primary_task_list.md + .docs/planning/*.
