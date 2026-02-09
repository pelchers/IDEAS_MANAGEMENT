# User Stories

## Epic: Project Organization
1. As a user, I want to see all projects in a drive-like dashboard so I can quickly find workspaces.
Acceptance Criteria:
- Projects render in grid/list modes.
- Search and sorting are available.

2. As a user, I want each project to map to a real folder so my files are portable and inspectable outside the app.
Acceptance Criteria:
- Creating a project creates the expected folder structure.
- Opening a project reads existing folder contents without migration prompts.

## Epic: Project Workspace
3. As a user, I want a split view with subfolders on the left and project metadata on the right so I can navigate and understand scope in one place.
Acceptance Criteria:
- Left pane reflects default project folders.
- Right pane displays values from `project.json`.

## Epic: Kanban
4. As a user, I want to manage tasks on a kanban board so I can plan and track execution.
Acceptance Criteria:
- Drag/drop between columns works.
- Board state persists to disk.

## Epic: Whiteboard
5. As a user, I want draggable and resizable containers with text and images so I can visually plan architecture and ideas.
Acceptance Criteria:
- Containers support corner-based resizing.
- Canvas items support selection and movement.
- Image insertion persists paths/references.

## Epic: Ideas
6. As a user, I want an ideas inbox so I can capture concepts before promoting them into projects/tasks.
Acceptance Criteria:
- Idea creation/edit/delete flows exist.
- Ideas can be linked to project entities.

## Epic: Schema + Directory Planning
7. As a user, I want a node-based schema planner so I can design data structures visually.
Acceptance Criteria:
- Nodes and edges persist.
- Export action generates schema output.

8. As a user, I want a directory tree generator so I can scaffold project folders consistently.
Acceptance Criteria:
- Tree preview is editable.
- Apply action writes folders/files safely.

## Epic: AI Assistance
9. As a user, I want a CLI-powered AI sidebar so I can generate and refine artifacts from within context.
Acceptance Criteria:
- Commands execute via app sidebar.
- Output streams to UI with command history.
- User can run context-aware prompts per project.
