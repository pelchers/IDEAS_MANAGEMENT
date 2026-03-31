---
name: frontend-fix
description: Search or add to the frontend fixes cross-reference library
invocable: true
---

# Frontend Fix (/frontend-fix)

Search the frontend fixes cross-reference library for known solutions, or add a new fix entry.

## Usage
```
/frontend-fix search <keyword>     # Search for a known fix
/frontend-fix add <name>           # Add a new fix entry
/frontend-fix list                 # List all entries
```

## Workflow

### Search
1. Read `references/index.json` from the `frontend-fixes-crossref` skill
2. Match by category or keyword
3. Display matching fix summaries
4. If $ARGUMENTS contains a keyword, search for it automatically

### Add
1. Create subfolder in `references/` with kebab-case name
2. Generate README.md, fix code file, and explainer.md
3. Update index.json
4. Commit

### List
1. Read index.json and display all entries in a table

If $ARGUMENTS is provided, treat it as a search query first. If no match, ask if user wants to add a new entry.
