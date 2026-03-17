# Tracing

## Basic Usage

```bash
playwright-cli tracing-start
playwright-cli open https://example.com
playwright-cli click e1
playwright-cli fill e2 "test"
playwright-cli tracing-stop
```

## Trace captures

| Category | Details |
|----------|---------|
| Actions | Clicks, fills, hovers, keyboard, navigations |
| DOM | Full snapshot before/after each action |
| Screenshots | Visual state at each step |
| Network | All requests, responses, headers, bodies, timing |
| Console | All console.log, warn, error messages |
| Timing | Precise timing for each operation |

## Output Files

- `trace-{timestamp}.trace` — Main trace file with actions, DOM snapshots, screenshots
- `trace-{timestamp}.network` — Complete network activity log
- `resources/` — Cached resources for page reconstruction

## Trace vs Video vs Screenshot

| Feature | Trace | Video | Screenshot |
|---------|-------|-------|------------|
| DOM inspection | Yes | No | No |
| Network details | Yes | No | No |
| Step-by-step | Yes | Continuous | Single frame |
| File size | Medium | Large | Small |
| Best for | Debugging | Demos | Quick capture |
