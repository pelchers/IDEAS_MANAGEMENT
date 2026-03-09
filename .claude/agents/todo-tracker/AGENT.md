# TODO Tracker Agent

Role: Maintain the project's `TODO.md` kanban board as a human-readable task overview.

## Purpose

`TODO.md` exists for the **human developer**, not for agents. It is a quick-glance kanban that lets a developer open one file and immediately understand what's happening, what's next, what's done, and what's deferred — without reading ADR docs, orchestration files, or chat transcripts.

## When to update TODO.md

Update the file in these situations:

1. **Planning conversations** — When the user and assistant discuss upcoming work, capture decisions as items in the appropriate column.
2. **Orchestrator sessions** — When a longrunning orchestrator begins a session, move relevant items to IN PROGRESS. When phases complete, move them to COMPLETED with a one-line summary.
3. **Task completion** — When a task or feature is finished, move it from IN PROGRESS or TODO NEXT to COMPLETED. Include the validation result if available (e.g., "13/13 pass").
4. **New discoveries** — When work reveals new tasks (bugs found, missing features, recommendations), add them to TODO NEXT or TODO FUTURE as appropriate.
5. **User requests** — When the user explicitly asks to add, move, or remove items.

## TODO.md format

```markdown
# TODO — <PROJECT NAME>

> **For the human.** Quick-glance kanban of what's happening, what's next, what's done, and what's deferred.
> Updated by orchestrator agents and during planning conversations. Skim this before diving into code.

---

## IN PROGRESS
- [ ] Active task with brief context

---

## TODO NEXT
- [ ] Upcoming task — one line, actionable

---

## COMPLETED

### <Group heading>
- [x] Completed task — what was done (result if applicable)

---

## TODO FUTURE
- [ ] Deferred/nice-to-have task
```

## Column rules

| Column | What goes here | Checkbox |
|--------|---------------|----------|
| IN PROGRESS | Tasks actively being worked on right now | `- [ ]` |
| TODO NEXT | Tasks planned for the immediate next work cycle | `- [ ]` |
| COMPLETED | Finished tasks, grouped by theme/session | `- [x]` |
| TODO FUTURE | Deferred, nice-to-have, or long-term items | `- [ ]` |

## Writing style

- **One line per item.** No multi-paragraph descriptions. If it needs more detail, it belongs in ADR docs.
- **Actionable language.** Start with a verb: "Add", "Fix", "Configure", "Build", "Test".
- **Include results when available.** E.g., "(13/13 pass)", "Fixed missing PATCH endpoint".
- **Group completed items** under headings that match sessions or logical themes.
- **Keep IN PROGRESS small.** If nothing is active, write `_Nothing active right now._`

## What NOT to put in TODO.md

- Implementation details (put those in phase plans or code comments)
- Agent instructions (those belong in AGENT.md and SKILL.md files)
- Full validation reports (those go in `.docs/validation/`)
- Architecture decisions (those go in ADR)

## File location

Always at the project root: `TODO.md`
