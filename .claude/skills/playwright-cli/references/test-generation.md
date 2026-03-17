# Test Generation

Every action performed with playwright-cli generates corresponding Playwright TypeScript code.

## Workflow

1. Open browser and navigate
2. Take snapshots to identify elements (e1, e2, etc.)
3. Perform actions — CLI outputs corresponding Playwright code
4. Add assertions manually to verify outcomes

## Best Practices

- Use semantic locators (role-based) over CSS selectors
- Take snapshots before recording to understand page structure
- Add your own expectations/assertions after interactions
