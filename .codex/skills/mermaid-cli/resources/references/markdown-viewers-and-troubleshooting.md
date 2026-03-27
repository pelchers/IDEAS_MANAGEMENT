# Markdown Viewers And Troubleshooting

If a Mermaid diagram works in `mmdc` but does not display in your editor, web host, or LMS, the problem is usually not the diagram source.

## First Diagnostic Split

Run:

```bash
mmdc -i path/to/file.md -o path/to/file.rendered.md
```

Interpret the result:

- If the command fails, fix the Mermaid syntax, CLI invocation, or config.
- If the command succeeds, the Markdown viewer or host is the likely failure point.

## Common Viewer Problems

- The viewer does not support Mermaid at all.
- The viewer supports Mermaid, but ships an older Mermaid version than the diagram syntax expects.
- The viewer supports only some diagram families.
- The viewer ignores `:::mermaid` blocks and only supports fenced code blocks.
- The viewer sanitizes or blocks SVG, CSS, icon assets, or scripts.

## Practical Response

When the destination host is unreliable, render to static artefacts and reference those instead of relying on live Mermaid execution.

Recommended path:

```bash
mmdc -i notes.md -o notes.rendered.md
```

This gives you:

- a rewritten Markdown file
- generated SVG files for each Mermaid block

## Checklist For Failures

1. Run `mmdc --version`.
2. Render the exact source with `mmdc`.
3. Remove custom CSS and config until the base diagram renders.
4. Re-add config JSON.
5. Re-add CSS or icon packs.
6. If the diagram is new or beta, verify that the host is on a compatible Mermaid version.

## Syntax Drift And Beta Features

The official Mermaid docs label several newer diagram families as new, experimental, or beta. Treat those as version-sensitive:

- prefer the syntax documented for the installed Mermaid version
- validate locally before committing documentation changes
- avoid assuming that every Markdown host is on the latest Mermaid release

Some families can also emit non-fatal renderer warnings or verbose console output while still producing a valid asset. In this workspace, the validated template suite completed successfully, but some newer families were noisier than the core diagram types. Interpret exit code and output asset generation before assuming failure.

## Current Repo Observation

The existing `SWEDU/git/*.md` diagrams in this workspace render successfully with the installed official CLI. That means the source is valid for the local renderer, and a display issue in VS Code or another host would be a viewer-side problem rather than a Mermaid parse failure.
