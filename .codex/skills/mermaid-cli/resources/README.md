# Mermaid CLI Resources

This skill bundles practical references, starter files, and scripts for Mermaid diagram work.

## References

- [official-links.md](./references/official-links.md): primary official URLs
- [cli-command-reference.md](./references/cli-command-reference.md): CLI install, render, export, Markdown transform, stdin, config, CSS, icon packs, and container usage
- [diagram-catalog.md](./references/diagram-catalog.md): current Mermaid diagram catalog with official doc URLs and local starter templates
- [configuration-and-theming.md](./references/configuration-and-theming.md): config JSON, theme selection, CSS, layout, icons, and renderer notes
- [markdown-viewers-and-troubleshooting.md](./references/markdown-viewers-and-troubleshooting.md): Markdown preview behavior, viewer drift, and debugging checklist

## Templates

- [templates/diagrams](./templates/diagrams): starter `.mmd` files for the Mermaid diagram families
- [templates/config](./templates/config): starter Mermaid config, Puppeteer config, and CSS overrides
- [templates/markdown](./templates/markdown): starter Markdown file with fenced Mermaid blocks

## Scripts

- [scripts/render-mermaid.ps1](./scripts/render-mermaid.ps1): render one Mermaid source file
- [scripts/render-markdown.ps1](./scripts/render-markdown.ps1): transform Markdown with Mermaid fences
- [scripts/render-diagram-directory.ps1](./scripts/render-diagram-directory.ps1): batch-render a directory of `.mmd` files
- [scripts/render-markdown-directory.ps1](./scripts/render-markdown-directory.ps1): batch-render Markdown files with Mermaid fences
- [scripts/copy-template.ps1](./scripts/copy-template.ps1): create a new diagram file from the bundled template catalog
- [scripts/validate-template-suite.ps1](./scripts/validate-template-suite.ps1): render the bundled diagram template suite
