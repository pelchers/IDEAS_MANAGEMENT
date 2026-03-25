# CLI Command Reference

This reference is based on the official `mermaid-cli` README and the locally installed `mmdc --help` output.

## Install

Global install:

```bash
npm install -g @mermaid-js/mermaid-cli
```

Local install:

```bash
npm install @mermaid-js/mermaid-cli
./node_modules/.bin/mmdc -h
```

Transient execution with `npx`:

```bash
npx -p @mermaid-js/mermaid-cli mmdc -h
```

Container install options are documented in the official README. Prefer the npm install when you control the workstation.

## Core Commands

Render a Mermaid source file:

```bash
mmdc -i input.mmd -o output.svg
```

Render PNG with theme and transparent background:

```bash
mmdc -i input.mmd -o output.png -t dark -b transparent
```

Render PDF and scale to fit:

```bash
mmdc -i input.mmd -o output.pdf -f
```

Read from stdin:

```bash
cat diagram.mmd | mmdc -i - -o output.svg
```

Transform Markdown containing Mermaid fences:

```bash
mmdc -i notes.md -o notes.rendered.md
```

## Important CLI Options

- `-i, --input`: input Mermaid file or Markdown file; `-` reads from stdin
- `-o, --output`: output file or `-` for stdout
- `-e, --outputFormat`: explicit output format when the filename does not make it obvious
- `-t, --theme`: `default`, `forest`, `dark`, or `neutral`
- `-b, --backgroundColor`: background for SVG and PNG; `transparent` is often useful
- `-c, --configFile`: Mermaid config JSON
- `-C, --cssFile`: CSS injected into the rendered page
- `-p, --puppeteerConfigFile`: Puppeteer config JSON
- `-w, --width`: page width
- `-H, --height`: page height
- `-s, --scale`: browser scale factor
- `-I, --svgId`: set a stable SVG `id`
- `-f, --pdfFit`: scale PDF output to fit the chart
- `-q, --quiet`: suppress log output
- `--iconPacks`: load Iconify NPM packs
- `--iconPacksNamesAndUrls`: load icon packs from named remote JSON files
- `-a, --artefacts`: artefact directory when transforming Markdown

## Markdown Transformation Rules

The CLI treats files ending in `.md` as Markdown and extracts Mermaid blocks from:

- fenced code blocks such as ```` ```mermaid ````
- Mermaid container blocks such as `:::mermaid`

The transformed Markdown points at the generated image assets. This is useful when a Markdown host does not execute Mermaid inline or when you want static artefacts for docs, LMS systems, PDFs, or publishing pipelines.

## Config Strategy

Prefer this order:

1. Mermaid config JSON for diagram behavior and theme configuration
2. Puppeteer config JSON for browser execution details
3. CSS overrides only when the output asset needs page-level styling or animation

Use the templates in `../templates/config/`.

## Icon Packs

Two official CLI paths exist:

- `--iconPacks` for Iconify NPM packages
- `--iconPacksNamesAndUrls` for named URL-backed icon JSON definitions

When icon rendering is inconsistent, verify:

- the icon pack name or prefix
- network reachability for remote packs
- whether the final host allows the assets and CSS you expect

## Output Policy

Prefer:

- `svg` for docs, source control, and crisp scalable output
- `png` for LMS systems, slide decks, or hosts with limited SVG support
- `pdf` for printable deliverables
- rendered Markdown plus SVG files when raw Mermaid fences are not supported by the final host
