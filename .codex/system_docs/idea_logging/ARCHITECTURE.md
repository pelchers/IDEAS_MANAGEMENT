# Idea Logging Architecture

## Component Flow

```mermaid
flowchart TD
    A[User asks to log an idea] --> B[Idea Logger Agent]
    B --> C[logging-ideas skill]
    C --> D[Update .ideas/ideas.md]
    C --> E[Create .ideas idea folder]
    C --> F[Write planning docs]
    C --> G[Mirror .ideas/SYNC-REPOS.md]
    C --> H[Sync .ideas and component files to sync repos]
```

## Boundaries

- The agent owns execution flow and reporting.
- The skill defines conventions and trigger conditions.
- The `.ideas/` folder stores business content.
- `SYNC-REPOS.md` defines propagation targets.

## Design Notes

- The system is intentionally file-based so ideas remain portable and inspectable.
- The idea folder uses repo-setup planning conventions to keep ideation and planning structurally aligned.
- Sync includes the supporting component itself so idea logging behavior remains consistent across repos.
