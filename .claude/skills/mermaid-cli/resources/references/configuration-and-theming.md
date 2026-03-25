# Configuration And Theming

Use Mermaid configuration and theming deliberately. Most rendering problems come from mixing source syntax, viewer capabilities, and render-time overrides.

## Choose The Right Control Surface

- Use a Mermaid config JSON for diagram settings, theme variables, renderer choice, and `themeCSS`.
- Use a Puppeteer config JSON for browser launch behavior.
- Use `--cssFile` only when you need additional inline CSS in the rendered page.

## Theme Controls

CLI theme choices:

- `default`
- `forest`
- `dark`
- `neutral`

Example:

```bash
mmdc -i diagram.mmd -o diagram.svg -t forest
```

For deeper customization, prefer a Mermaid config file over ad hoc CSS. The official CLI README specifically recommends using `themeCSS` in the Mermaid config when overriding Mermaid theme output.

## Layout And Renderer Notes

Some diagram families expose layout settings through Mermaid config. For example, Mermaid documents alternate renderers such as `elk` for some flowchart workloads. Use config files rather than hard-coding layout assumptions into the diagram source unless the docs for that diagram family explicitly call for it.

## CSS Overrides

Use `--cssFile` for:

- animations in generated SVG
- page-level styling that is not convenient in Mermaid config
- host-controlled visual overrides when you own the output asset

Be careful:

- browser CSP can block or limit inline CSS behavior in some hosts
- CSS that looks correct in a standalone SVG can fail when embedded elsewhere

## Icon Packs

Mermaid supports icon registration in the docs, and Mermaid CLI supports icon packs via:

- `--iconPacks`
- `--iconPacksNamesAndUrls`

Use icon packs when diagrams need recognizable vendor or service glyphs. Keep fallbacks in mind because some hosts or teams want diagrams that render without network access.

## Config File Templates

Start from:

- `../templates/config/mermaid-config.json`
- `../templates/config/puppeteer-config.json`
- `../templates/config/theme-overrides.css`

Validate with:

```bash
mmdc -i diagram.mmd -o diagram.svg -c mermaid-config.json -p puppeteer-config.json -C theme-overrides.css
```
