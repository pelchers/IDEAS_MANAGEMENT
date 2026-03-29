---
name: create-component
description: Full pipeline — create agent + skill + hook + command + system docs
invocable: true
---

# Create Component (/create-component)

Create a complete component with all required pieces: agent, skill, hook, command, system docs, codex mirror, and repo sync.

## Usage
```
/create-component "validation agent that runs Playwright tests"
/create-component --complete chain-agent    # fill gaps for existing
/create-component --audit                   # audit all for gaps
```

## What It Creates
1. Agent AGENT.md (if needed)
2. Skill SKILL.md (if needed)
3. Hook script + registration (if auto-triggering needed)
4. Slash command with $ARGUMENTS (if user-invocable)
5. System docs (README + USAGE_GUIDE minimum, + ARCHITECTURE + SYSTEM_OVERVIEW for multi-component)
6. .codex/ mirror
7. Sync to SYNC-REPOS.md repos

$ARGUMENTS
