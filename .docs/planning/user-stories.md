# User Stories

## Epic: Accounts and Access
1. As a user, I want to sign in securely so my projects and settings are protected.
Acceptance Criteria:
- Email/password sign-in works.
- Invalid sessions are rejected and redirected.

2. As a subscribed user, I want paid features unlocked across desktop and web so I can use the full product anywhere.
Acceptance Criteria:
- Entitlements are checked in both clients.
- Subscription state changes propagate within minutes.

3. As an internal tester, I want one admin account with unrestricted access so I can validate every area of the app.
Acceptance Criteria:
- Admin account bypasses subscription gates.
- Admin actions are audit logged.

## Epic: Project Organization
4. As a user, I want to see all projects in a drive-like dashboard so I can quickly find workspaces.
Acceptance Criteria:
- Projects render in grid/list modes.
- Search and sorting are available.

5. As a user, I want each project to map to a real folder so my files remain inspectable and portable.
Acceptance Criteria:
- Creating a project creates expected folder structure.
- Existing project folders can be opened safely.

## Epic: Workspace and Planning
6. As a user, I want a split view with subfolders on the left and project metadata on the right so I can navigate and understand scope in one place.
Acceptance Criteria:
- Left pane reflects default project folders.
- Right pane displays values from `project.json`.

7. As a user, I want to manage tasks in kanban so I can track execution.
Acceptance Criteria:
- Drag/drop between columns works.
- Board state persists and syncs.

8. As a user, I want a whiteboard with draggable/resizable containers, text, and images so I can design ideas visually.
Acceptance Criteria:
- Containers support corner resizing.
- Items support selection, movement, and persistence.

9. As a user, I want a node-based schema planner so I can design data structures.
Acceptance Criteria:
- Nodes/edges persist.
- Export action generates schema output.

10. As a user, I want a directory tree generator so I can scaffold project structure quickly.
Acceptance Criteria:
- Tree preview is editable.
- Apply action writes folders/files safely.

## Epic: AI Assistant
11. As a user, I want a sidebar AI assistant in project pages so I can perform context-aware edits without leaving my workspace.
Acceptance Criteria:
- AI can read scoped project context.
- AI tool actions can update artifacts with explicit user intent.

12. As a user, I want a dedicated AI chat page so I can ask broader planning/build questions and still apply changes into project files.
Acceptance Criteria:
- AI chat can target specific project/folder/file.
- Example: AI adds a new item into `ideas/ideas.json` when requested.

## Epic: Sync and Reliability
13. As a user, I want local work to sync automatically to cloud so I can continue on another device.
Acceptance Criteria:
- Offline edits queue locally and sync when reconnected.
- Conflict resolution path exists for concurrent edits.
