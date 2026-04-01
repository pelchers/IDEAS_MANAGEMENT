# Idea Logging

System documentation for the idea logging agent and skill.

## Purpose

The idea logging system captures raw ideas into a persistent repo-local structure and turns them into immediately usable planning artifacts. It exists to stop idea capture from being ad hoc and to keep the `.ideas/` system synchronized across sibling repos.

## When to Use

- when a user wants to log a new idea
- when an idea needs a same-name planning folder
- when `.ideas/` conventions need to be applied or repaired
- when idea updates must be mirrored across the sync-repo set

## Architecture

```text
User request
  -> Idea Logger Agent
     -> logging-ideas skill
        -> .ideas/ideas.md
        -> .ideas/<Idea Title>/
        -> .ideas/SYNC-REPOS.md
        -> cross-repo sync targets
```

## Key Concepts

- `ideas.md` is the master list for the current repo.
- Each idea gets a same-name subfolder under `.ideas/`.
- Idea subfolders use the same planning-file conventions as `.docs/planning/`, adapted per idea.
- Cross-repo sync applies to both `.ideas/` content and the supporting idea-logger components.

## Workflow

1. Parse the user idea and derive a stable title.
2. Add or update the idea entry in `.ideas/ideas.md`.
3. Create the same-name planning folder.
4. Write applicable planning docs.
5. Mirror `.ideas/SYNC-REPOS.md`.
6. Sync `.ideas/` and component artifacts across repos.

## Agent & Skill Locations

| Component | Claude Path | Codex Path |
|-----------|-------------|------------|
| Idea Logger Agent | `.claude/agents/idea-logger/agent.md` | `.codex/agents/idea-logger/AGENT.md` |
| Logging Ideas Skill | `.claude/skills/logging-ideas/SKILL.md` | `.codex/skills/logging-ideas/SKILL.md` |

## Integration with Other Systems

- **repo_setup**: reuses planning-document conventions for idea subfolders.
- **claude_codex_sync**: keeps the agent and skill mirrored between provider trees.
- **trinary_sync**: related conceptually because idea logging also requires cross-repo propagation.
