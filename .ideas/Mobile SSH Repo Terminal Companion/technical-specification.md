# Technical Specification

## Proposed Stack

- React Native
- Expo
- TypeScript
- SSH client and terminal emulation libraries appropriate for Expo compatibility
- Optional lightweight host-side helper service if raw SSH proves insufficient for repo indexing and structured filesystem metadata

## Architecture

### Mobile Client

- connection management UI
- terminal session surface
- repo inventory UI with list/table/grid views
- filesystem browser
- local credential and session cache

### PC Host

- SSH server as the baseline transport
- shell environment where Codex or Claude Code already run
- optional repo-index helper to speed repo discovery and reduce repeated full-disk scans

### Data Flow

1. User selects or creates a host connection.
2. Mobile app authenticates over SSH.
3. App either:
   - invokes shell commands over SSH for repo/file discovery, or
   - talks to a local helper on the PC for richer metadata.
4. User opens terminal session or navigates repositories/files.
5. Terminal commands run on the PC host and stream output back to the phone.

## Major Technical Decisions

- Prefer SSH as the trust boundary and transport instead of inventing a custom remote protocol first.
- Keep repo discovery logic portable so it can run either over shell commands or a host helper service.
- Separate terminal transport concerns from repo/file browsing concerns; they share connection state but not UI assumptions.

## Constraints

- Expo compatibility may limit low-level terminal features unless a custom development client or native module is introduced.
- Mobile text selection, keyboard handling, and terminal rendering are likely to need native-quality tuning.
- Direct full-drive browsing from `C:\` requires careful safety boundaries to avoid destructive remote operations.
