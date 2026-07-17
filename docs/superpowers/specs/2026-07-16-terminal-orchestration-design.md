# Terminal Task Orchestration + Complementary Pages — Design Spec

**Date:** 2026-07-16
**Branch:** `Home-Work`
**Status:** Approved (scope + forks confirmed with user)

## Goal
Let the app dispatch ("poke") commands to terminals in the user's environment via
a **runner/bridge**, tie it into the existing `Task` model, and add three
complementary pages (command snippets, activity timeline, automation rules). Also
user-story test under-covered areas.

## Confirmed decisions
- Runner: **Node bridge (functional) + VS Code extension scaffold**.
- Execution: **auto-run** dispatched commands on the runner.
- Pages: Orchestrator + Command Snippets + Activity Timeline + Automation Rules — all real UIs.

## Data model (Prisma)
```
enum RunnerStatus { ONLINE OFFLINE ERROR }
model Runner {
  id, userId, name, tokenHash (unique), status, workingDir?, lastSeenAt?, meta Json?
  commands RunnerCommand[]
  @@index([userId])
}
enum CommandStatus { QUEUED RUNNING DONE FAILED CANCELED }
model RunnerCommand {
  id, runnerId, userId, taskId?, command, cwd?, status, exitCode?, output(text),
  createdAt, startedAt?, finishedAt?
  @@index([runnerId, status]) @@index([userId]) @@index([taskId])
}
model CommandSnippet { id, userId, name, command, description?, timestamps  @@index([userId]) }
enum AutomationTrigger { TASK_STATUS_CHANGED TASK_CREATED }
model AutomationRule {
  id, userId, name, enabled, trigger, conditionJson Json, runnerId?, command, timestamps
  @@index([userId])
}
```
Activity timeline reuses existing `AuditLog` + `ProjectActivity` + `RunnerCommand`
(aggregated in one API) — no new activity model.

## Runner protocol (auth = per-runner token, hashed at rest)
- `POST /api/runners` (user) → create runner, return token ONCE.
- `GET /api/runners` / `DELETE /api/runners/:id` (user).
- `POST /api/runners/heartbeat` (runner token) → ONLINE + lastSeen.
- `GET /api/runners/poll` (runner token) → claim next QUEUED command, mark RUNNING.
- `POST /api/runners/commands/:id/output` (runner token) → append stdout/stderr.
- `POST /api/runners/commands/:id/result` (runner token) → exitCode → DONE/FAILED.
- `POST /api/runners/:id/dispatch` (user) → queue a command (optional taskId).
- `GET /api/runners/commands` (user) → list/filter; `GET .../commands/:id/stream` (user, SSE) → live output.

## Bridge (`apps/web/scripts/runner-agent.mjs`)
Self-contained Node script (Node 22 global fetch + child_process, zero deps):
heartbeat loop, long-poll for commands, spawn shell, stream stdout/stderr to the
output endpoint, post result on exit. **Auto-run.** Usage:
`node runner-agent.mjs --url http://localhost:3001 --token <token> --cwd <dir>`.

## VS Code extension scaffold (`packages/vscode-runner/`)
`package.json` manifest (engines.vscode, activationEvents, contributes.commands),
`src/extension.ts` (activate → poll app → on command `terminal.sendText(cmd)` in a
managed terminal), README. Terminal OUTPUT capture noted as a TODO (VS Code
terminals don't expose output directly; a pseudoterminal/task path is documented).

## Pages (+ nav + Cmd-K commands)
- `/orchestrator` — runners (status, create → token reveal + copy bridge command),
  command console (pick runner, type/pick snippet, optional task link, dispatch,
  live SSE output), command history.
- `/snippets` — CRUD command snippets; "Run on <runner>".
- `/activity` — aggregated timeline feed.
- `/automations` — CRUD rules; on task status change (hooked in the task PATCH
  route) matching rules auto-dispatch their command to the chosen runner.

## Task integration
Orchestrator dispatch can attach a `taskId`; automation rules fire on task
status/create; a command's task link is shown in history.

## Testing
- Unit (vitest): runner token auth, command lifecycle (dispatch→poll→output→result),
  automation matching, snippet CRUD, activity aggregation.
- E2E (Playwright): orchestrator (create runner, dispatch a command, protocol
  round-trip simulated in-test), snippets CRUD, automations CRUD, activity renders.
- User-story sweep of under-covered areas (whiteboard/schema/directory/ideas/
  conflicts/friends/groups/notifications/profile).

## Security
Runner is the user's own agent (per-user token) running their own commands on their
own machine — like a self-hosted CI runner. Tokens hashed at rest; runner endpoints
authenticated by token; all user endpoints require the session.
