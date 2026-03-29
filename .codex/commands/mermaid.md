---
name: mermaid
description: Work with Mermaid diagrams — suggest, validate, render, add templates
invocable: true
---

# Mermaid (/mermaid)

Work with Mermaid diagrams in markdown files.

## Usage
```
/mermaid                          # check recent files for diagram opportunities
/mermaid validate                 # validate all Mermaid blocks in recent files
/mermaid render input.mmd         # render .mmd file to SVG via mmdc
/mermaid add flowchart            # add a flowchart template
/mermaid add sequence             # add a sequence diagram template
/mermaid add state                # add a state diagram template
```

## When to Use
- After writing architecture or system docs without diagrams
- To validate Mermaid syntax before committing
- To render .mmd files to static SVG/PNG assets

Uses the `mermaid-cli` skill for syntax, templates, and rendering.

$ARGUMENTS
