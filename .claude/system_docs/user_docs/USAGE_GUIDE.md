# Usage Guide: User Docs

## Quick Start

```
/agent user-dev-docs-agent "Generate user and developer docs for the current app"
```

The agent creates/updates all required files in `.appdocs/user/` and `.appdocs/developer/`.

## Detailed Usage

### Full Doc Generation

```
/agent user-dev-docs-agent "Create complete .appdocs/ with Playwright captures at 1440x900"
```

Agent workflow:
1. Creates ADR phase plan in `3_SITE_VISUAL_DOCS_FOR_USERS`
2. Runs Playwright visual capture (`tests/visual-capture.spec.ts`)
3. Writes user guides (non-technical, step-by-step)
4. Writes developer guides (commands, env vars, operational steps)
5. Creates `index.html` viewers for each doc set
6. Archives phase and commits

### Update Specific Section

```
/agent user-dev-docs-agent "Update the developer run-guide.md with the new Railway deploy steps"
```

### Screenshot Naming Convention

Screenshots must align with the coverage map. Name them descriptively:
- `screenshots/01-landing-desktop.png`
- `screenshots/02-login-form.png`
- `screenshots/03-dashboard-overview.png`

### Adding the Playwright Capture Test

```typescript
// tests/visual-capture.spec.ts
test('capture homepage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: '.appdocs/user/screenshots/01-homepage.png', fullPage: true });
});
```

## Troubleshooting

**index.html viewer shows blank page**
Ensure the HTML viewer loads markdown files via fetch. Check relative paths — screenshots must be in `screenshots/` subdirectory relative to `index.html`.

**Screenshots captured before page loads**
Add `await page.waitForLoadState('networkidle')` before `page.screenshot()`.

**Developer docs too shallow**
The skill requires "expand beyond summaries." Developer docs must include exact commands, environment variable names, and step-by-step operational flows — not just feature descriptions.
