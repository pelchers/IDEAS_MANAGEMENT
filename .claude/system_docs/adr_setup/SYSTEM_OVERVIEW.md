# System Overview: ADR Setup

## What It Is

The ADR Setup system manages the `.adr/` workspace — the project's permanent record of architectural decisions, build sessions, and phase completion history. It is both a bootstrapper (creating the folder structure) and a lifecycle manager (tracking phases from planned to complete).

## Component Map

```
.claude/
├── agents/adr-setup/AGENT.md              # Execution agent
└── skills/adr-setup/
    ├── SKILL.md                            # Core skill definition
    ├── templates/
    │   ├── primary_task_list.md            # Checklist template
    │   ├── prd.md                          # PRD template
    │   ├── technical_requirements.md       # Tech spec template
    │   └── notes.md                        # Running log template
    └── references/conventions.md           # Naming and structure rules

.adr/
├── orchestration/<N>_<session-name>/       # Permanent session docs (4 files)
├── current/<N>_<session-name>/             # Active phase files
├── history/<N>_<session-name>/             # Completed phase archives
└── agent_ingest/                           # Imported agent notes
```

## When to Use vs Alternatives

| Scenario | Use adr_setup | Alternative |
|----------|---------------|-------------|
| Starting a new project | Yes — bootstrap .adr/ first | Manual folder creation |
| Starting a new build session | Yes — creates 4 orchestration files | Skip if session is informal |
| Completing a phase | Yes — enforces checklist + writes review | Manual if phase is trivial |
| Auditing folder compliance | Yes | `ls` and visual inspection |
| Reading session notes | No — read directly | N/A |

## Integration with Other Systems

| System | Integration |
|--------|-------------|
| **session_orchestration** | Orchestrator creates phases, calls adr-setup to complete them |
| **todo_tracker** | Reads `orchestration/*/primary_task_list.md` to populate TODO columns |
| **frontend_spec** | Sessions with UI work require `frontend_spec.md` in orchestration folder |
| **savepoint** | Natural trigger: create a savepoint after each phase completion |
| **repo_setup** | repo-setup calls adr-setup to initialize the .adr/ workspace |

## Naming Convention

Session folders follow `<N>_<lowercase-kebab-domain>`:
- Numeric prefix: 1, 2, 3... (never padded)
- Separator: underscore after number
- Domain: lowercase-kebab, descriptive
- Examples: `1_APP_FOUNDATIONS`, `3_auth-flow`, `7_payments`

## Design Decisions

**Why 4 files per orchestration session?**
Separating prd/tech_requirements/task_list/notes prevents any single file from becoming unwieldy. Each has a distinct audience: PRD for product intent, tech_requirements for implementation decisions, task_list for status tracking, notes for running commentary.

**Why require all checkboxes before completion?**
Prevents "done-ish" phases from polluting history. The checklist is the contract between the planning phase and the build phase.

**Why orchestration/ vs current/ vs history/?**
Orchestration holds permanent docs that survive phase transitions. Current holds the live working plan. History is the audit trail. This three-way split prevents accidental overwrites.

## Constraints

- Session names must use `<N>_` prefix with exact numeric ordering
- Phase files require metadata frontmatter — skeleton files are rejected
- Frontend sessions require a `frontend_spec.md` before phase work begins
- Commit messages follow: `ADR Session N Phase M: <description>`
