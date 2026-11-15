---
name: commit-and-push
description: Create atomic commit and push to remote
invocable: true
---

# Commit and Push

Create an atomic commit following project conventions and push to remote.

## Instructions for Claude

When this command is invoked:

1. **Check git status**:
   ```bash
   git status
   ```

2. **Review changes**:
   - Show git diff for all modified files
   - List all untracked files
   - Identify what was changed and why

3. **Create atomic commit**:
   - Stage relevant files: `git add [files]`
   - Write descriptive commit message following conventions:
     ```
     <type>: <subject>

     <body>

     🤖 Generated with Claude Code
     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```

   **Commit Types:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `refactor:` Code restructuring
   - `docs:` Documentation changes
   - `test:` Test additions/changes
   - `chore:` Build/tooling changes

4. **Push to remote**:
   ```bash
   git push origin [branch-name]
   ```

5. **Verify**:
   - Confirm push succeeded
   - Show final git status
   - Display commit hash

## Example Usage

```
User: /commit-and-push
Claude: Let me check the current git status...
```

## Notes

- Never commit sensitive files (.env, secrets, keys)
- Always run tests before pushing if applicable
- Follow atomic commit principles (one logical change per commit)
- Update logs/development-progress.md if significant work was done

## Remote Push Safety — Collectible Classics (Required)

- **Default push target is our working repo `https://github.com/pelchers/CC-Local.git`.**
- **NEVER push to the upstream `fmchisti/collectibleclassics` remote** — not `CC/`'s `origin`, not any
  branch — **unless the user explicitly directs it in that same message.** If a push would target
  `fmchisti/collectibleclassics`, STOP and confirm first. The app clone under `CC/` is pull-only from
  upstream. See the `remote-push-safety` convention block in `CLAUDE.md` / `.codex/CODEX.md`.


$ARGUMENTS
