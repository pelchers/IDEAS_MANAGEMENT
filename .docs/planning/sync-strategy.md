# Local vs Hosted Filesystem Sync Strategy

## 1. Selected Approach
Use a hybrid model:
- Cloud is canonical for synchronized account/project state.
- Desktop maintains a local mirrored workspace for speed and offline operation.

## 2. Precedence Rules
- Connected state: successful cloud writes become canonical revision.
- Offline state: local writes are accepted immediately and queued.
- Reconnection: queued operations replayed to cloud in order.

## 3. Operation Model
- Every mutation generates an operation entry:
  - `operationId`
  - `projectId`
  - `artifactPath`
  - `baseRevision`
  - `payload`
  - `timestamp`
- Operations stored locally until acknowledged by server.

## 4. Conflict Policy
- Auto-merge for append-only artifacts where safe (`ideas`, chat logs).
- Structured merge attempts for JSON board/canvas updates.
- Manual resolver UI when automatic merge is unsafe.

## 5. Failure and Recovery
- Per-artifact snapshots before risky merges.
- User-visible sync state and retry controls.
- `force pull` and `force push` as explicit recovery actions.

## 6. Why This Model
- Preserves local-first responsiveness for desktop workflows.
- Enables account, subscription, and multi-device continuity.
- Keeps web and desktop behavior aligned under one data contract.
