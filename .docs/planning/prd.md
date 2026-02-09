# Product Requirements Document (PRD)

## 1. Product Summary
A production-ready idea management and software planning platform delivered as:
- Desktop app (Electron)
- Web app (Next.js)

Both clients share the same core domain behavior and provide project browsing, kanban, whiteboarding, schema planning, directory generation, ideas management, and AI-assisted workflows.

## 2. Problem
Builders use disconnected tools for ideas, planning boards, architecture diagrams, and project files. This causes context switching, weak traceability, and inconsistent execution.

## 3. Target Users
- Solo developers with multiple active projects.
- Small software teams needing structured planning and execution.
- Consultants/agencies managing many project workspaces.

## 4. Objectives
- Provide one system connecting ideation, planning, and project files.
- Support account-based access with authentication and subscription controls.
- Preserve a real project folder contract while enabling cloud sync.
- Deliver production-grade reliability, security, and deployment readiness.

## 5. Key Features
### 5.1 Accounts and Authentication
- Email/password account creation and login (roll-your-own auth service).
- Session lifecycle with secure refresh flows.
- Password reset and email verification.
- Route and API protection across web and desktop clients.

### 5.2 Subscriptions and Entitlements
- Subscription plans with Stripe billing.
- Entitlement checks for gated features.
- Desktop app enforces active subscription (except admin override account).

### 5.3 Admin Override Account
- One protected admin user/key for unrestricted access.
- Used for internal testing and release validation.
- Audit logging of admin actions.

### 5.4 Project Dashboard (Drive-like)
- Grid/list of projects.
- Search, sort, filter by tags/status/updated date.
- Create/open/archive project workspaces.

### 5.5 Project Workspace View
- Left pane: default subfolders/files.
- Right pane: project overview from `project.json`.
- Folder-specific actions (open kanban, whiteboard, schema, planning docs).

### 5.6 Kanban
- Columns, cards, labels, priorities, due dates, assignees.
- Drag/drop transitions.
- Persistent board artifact per project.

### 5.7 Whiteboard
- Infinite canvas.
- Draggable/clickable/resizable containers with corner handles.
- Text blocks and image attachments.
- Node linking and grouping.

### 5.8 Ideas List
- Quick capture inbox.
- Tagging and categorization.
- Promote ideas into tasks, board cards, or whiteboard items.

### 5.9 Schema Planner
- Node-based data modeling.
- Relationship edges and field definitions.
- Export pipeline for schema artifacts.

### 5.10 Directory Tree Generator
- Template-driven scaffolding.
- Preview-before-apply.
- Writes tree specs and generated outputs.

### 5.11 AI Assistant
- Sidebar AI assistant available in project context.
- Dedicated `/ai` full-page chat for broader work.
- Tool actions that can modify project artifacts on user request (for example add an item to `ideas/ideas.json`).
- Command/audit trace for file-changing actions.

## 6. Non-Functional Requirements
- Production-ready release quality from initial launch.
- Scale target: 1,000+ active users.
- Cross-platform desktop support and web parity for core workflows.
- Strong data integrity and recovery guarantees.
- Security controls for auth, billing, and AI-driven file operations.

## 7. Out of Scope (Initial Release)
- Real-time multi-user collaborative editing on the same board/canvas.
- Mobile-native apps.

## 8. Success Metrics
- Time from project creation to first actionable board < 3 minutes.
- 95%+ successful sync completion for connected clients.
- Auth + subscription gate reliability (no unauthorized feature access regressions).
- High repeat weekly usage across dashboard, ideas, kanban, and AI workflows.
