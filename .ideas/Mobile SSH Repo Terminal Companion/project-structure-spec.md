# Project Structure Spec

## Suggested Structure

```text
mobile-ssh-repo-terminal-companion/
  app/
    (tabs)/
    host/
    repo/
    terminal/
    files/
  components/
  features/
    connection/
    terminal/
    repo-discovery/
    filesystem/
  services/
    ssh/
    repo-index/
    filesystem/
    session-cache/
  state/
  hooks/
  types/
  assets/
```

## Module Boundaries

- `features/connection/` owns host pairing and auth UX
- `features/terminal/` owns terminal rendering and interaction
- `features/repo-discovery/` owns repository scanning and presentation
- `features/filesystem/` owns remote browsing and file metadata
- `services/ssh/` owns connection transport and command execution

This keeps transport, UI, and discovery logic isolated enough to evolve independently.
