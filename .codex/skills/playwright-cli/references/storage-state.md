# Storage Management

## Save/Restore State

```bash
playwright-cli state-save
playwright-cli state-save my-auth-state.json
playwright-cli state-load my-auth-state.json
```

## Cookies

```bash
playwright-cli cookie-list
playwright-cli cookie-list --domain=example.com
playwright-cli cookie-get session_id
playwright-cli cookie-set session_id abc123
playwright-cli cookie-set session_id abc123 --domain=example.com --httpOnly --secure --sameSite=Lax
playwright-cli cookie-delete session_id
playwright-cli cookie-clear
```

## LocalStorage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-delete theme
playwright-cli localstorage-clear
```

## SessionStorage

```bash
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get step
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```

## Auth Pattern

```bash
playwright-cli open https://app.example.com/login
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
playwright-cli state-save auth.json
# Later:
playwright-cli state-load auth.json
playwright-cli open https://app.example.com/dashboard
```

## Security

- Never commit storage state files with auth tokens
- Add `*.auth-state.json` to `.gitignore`
- Delete state files after automation
