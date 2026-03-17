# Video Recording

Capture browser sessions as WebM video.

## Basic Recording

```bash
playwright-cli video-start
playwright-cli open https://example.com
playwright-cli snapshot
playwright-cli click e1
playwright-cli fill e2 "test input"
playwright-cli video-stop demo.webm
```

## Best Practices

- Use descriptive filenames: `recordings/login-flow-2024-01-15.webm`
- Video is best for demos and documentation
- Tracing is better for debugging (has DOM + network data)
- Large recordings consume significant disk space
