# Browser Session Management

## Named Sessions

```bash
playwright-cli -s=auth open https://app.example.com/login
playwright-cli -s=public open https://example.com
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=public snapshot
```

## Session Commands

```bash
playwright-cli list
playwright-cli close
playwright-cli -s=mysession close
playwright-cli close-all
playwright-cli kill-all
playwright-cli delete-data
playwright-cli -s=mysession delete-data
```

## Persistent Profiles

```bash
playwright-cli open https://example.com --persistent
playwright-cli open https://example.com --profile=/path/to/profile
```

## Environment Variable

```bash
export PLAYWRIGHT_CLI_SESSION="mysession"
playwright-cli open example.com
```

## Best Practices

- Name sessions semantically (e.g. `-s=github-auth`)
- Always clean up with `close-all` when done
- Use `kill-all` for zombie processes
- Delete stale data with `delete-data`
