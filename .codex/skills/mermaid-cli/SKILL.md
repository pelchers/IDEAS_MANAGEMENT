---
name: mermaid-cli
description: Comprehensive Mermaid diagram authoring, rendering, Markdown transformation, configuration, theming, icon-pack, and troubleshooting guidance using the official Mermaid syntax and the Mermaid CLI (`mmdc`). Use when creating, fixing, validating, styling, exporting, or debugging Mermaid diagrams in `.mmd` or Markdown files, when converting fenced Mermaid blocks into SVG/PNG/PDF assets, when diagnosing viewer-vs-renderer issues, or when working across the full current Mermaid diagram catalog.
---

# Mermaid CLI

Use this skill to work end to end with Mermaid diagrams and `mmdc`.

## Start Here

1. Verify whether the problem is syntax or viewer integration.
2. Render the same source with `mmdc`.
3. If `mmdc` succeeds but the user still cannot see the diagram, treat it as a viewer, extension, Markdown preview, or host-version problem.

Use these commands first:

```bash
mmdc --version
mmdc --help
mmdc -i path/to/input.mmd -o path/to/output.svg
```

For Markdown files that contain fenced Mermaid code:

```bash
mmdc -i path/to/file.md -o path/to/file.rendered.md
```

## Use The Bundled Resources

- Read [resources/README.md](./resources/README.md) for the resource map.
- Read [resources/references/cli-command-reference.md](./resources/references/cli-command-reference.md) for supported CLI flows and options.
- Read [resources/references/diagram-catalog.md](./resources/references/diagram-catalog.md) for the supported diagram list and official doc links.
- Read [resources/references/configuration-and-theming.md](./resources/references/configuration-and-theming.md) for config, themes, CSS, and icons.
- Read [resources/references/markdown-viewers-and-troubleshooting.md](./resources/references/markdown-viewers-and-troubleshooting.md) for preview and rendering failures.
- Start from [resources/templates/diagrams](./resources/templates/diagrams) when authoring a new diagram.
- Start from [resources/templates/markdown/mermaid-doc-template.md](./resources/templates/markdown/mermaid-doc-template.md) when embedding diagrams in Markdown.
- Use [resources/scripts/render-mermaid.ps1](./resources/scripts/render-mermaid.ps1) to render a single Mermaid source file.
- Use [resources/scripts/render-markdown.ps1](./resources/scripts/render-markdown.ps1) to transform Markdown with Mermaid fences into rendered Markdown plus image artefacts.
- Use [resources/scripts/render-diagram-directory.ps1](./resources/scripts/render-diagram-directory.ps1) to batch-render a directory of `.mmd` files.
- Use [resources/scripts/render-markdown-directory.ps1](./resources/scripts/render-markdown-directory.ps1) to batch-transform Markdown files that contain Mermaid blocks.
- Use [resources/scripts/copy-template.ps1](./resources/scripts/copy-template.ps1) to create a new diagram source from the bundled starter set.
- Use [resources/scripts/validate-template-suite.ps1](./resources/scripts/validate-template-suite.ps1) to render the bundled diagram templates and catch syntax breakage.

## Preferred Workflow

### Author A Diagram

1. Pick the nearest starter file from `resources/templates/diagrams/`.
2. Keep the diagram source small and readable before adding styling.
3. Render with `mmdc` to a deterministic output file.
4. Only then add theme overrides, CSS, width, scale, icon packs, or Markdown embedding.

### Render A Single Diagram

```bash
mmdc -i diagram.mmd -o diagram.svg
```

Optional variants:

```bash
mmdc -i diagram.mmd -o diagram.png -t dark -b transparent
mmdc -i diagram.mmd -o diagram.pdf -f
mmdc -i diagram.mmd -o diagram.svg -c mermaid-config.json -C theme-overrides.css
```

### Transform Markdown With Mermaid Fences

```bash
mmdc -i notes.md -o notes.rendered.md
```

This extracts Mermaid blocks from Markdown, renders each chart to a separate artefact, and rewrites the Markdown to image links.

### Use Config Before Ad Hoc CSS

Prefer:

- a Mermaid config JSON for theme, layout, diagram settings, and `themeCSS`
- a Puppeteer config JSON for browser/render environment settings
- a CSS file only when the output asset actually needs inline CSS

Use the bundled config templates before inventing a new file from scratch.

## Troubleshooting Rules

- If `mmdc` fails: fix the Mermaid source, config, or CLI invocation.
- If `mmdc` succeeds and the viewer fails: inspect the viewer version, Markdown host, Mermaid integration, or feature support.
- If the diagram type is new or beta: verify the installed Mermaid version and prefer conservative syntax.
- If Markdown fences do not render inline in a host: render them to static SVG/PNG and link/embed those artefacts instead.
- If custom icons or CSS do not appear: inspect host CSP rules and whether the renderer permits external resources.

## Scope Notes

- `mmdc` is installed globally in this environment and exposed as `mmdc`.
- The Mermaid CLI docs page on `mermaid.js.org` redirects readers to the `mermaid-cli` repository documentation.
- Newer Mermaid diagram families can evolve across Mermaid versions. Validate against the local `mmdc` before changing project docs.
