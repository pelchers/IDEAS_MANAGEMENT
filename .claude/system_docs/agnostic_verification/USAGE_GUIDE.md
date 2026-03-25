# Usage Guide: Agnostic Verification

## Quick Start

```bash
# Script scan
node .claude/skills/verifying-agnosticism/scripts/scan-hardcoded-paths.js

# Manual grep check (zero matches = fully agnostic)
grep -rn "C:\coding\|C:/coding\|/home/\|/Users/" .claude/ .codex/ .adr/ \
  --include="*.js" --include="*.ps1" --include="*.sh" --include="*.json" --include="*.md"
```

## Detailed Usage

### Full Scan via Agent

```
/agent agnostic-verifier "Scan and fix all hardcoded paths in .claude/ and .codex/"
```

The agent: scans → categorizes by severity → auto-fixes blocking issues → reports portability/cosmetic issues.

### Scan a Specific Directory

```bash
node .claude/skills/verifying-agnosticism/scripts/scan-hardcoded-paths.js --dir .claude/hooks
```

### Fix Patterns Reference

| File Type | Bad Pattern | Good Pattern |
|-----------|-------------|--------------|
| `.ps1` | `$dir = "C:\coding\..."` | `$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path` |
| `.js` | `const BASE = 'C:\coding\'` | `path.resolve(__dirname, '..', '..', '..', '..')` |
| `.sh` | `ROOT="C:/coding/..."` | `ROOT="$(git rev-parse --show-toplevel)"` |
| `.json` | `"workdir": "C:\..."` | `"workdir": ""` |
| `.md` | `C:\coding\apps\myproject` | `<PROJECT_ROOT>` |

## Troubleshooting

**False positives in example code blocks**
Cosmetic severity — document them in the report but don't auto-fix. Example blocks are acceptable if clearly labeled.

**Script not found**
Ensure you're running from repo root. The script path is relative: `.claude/skills/verifying-agnosticism/scripts/scan-hardcoded-paths.js`.

**Fixes break functionality**
Blocking fixes use dynamic resolution patterns. If a script stops working after a fix, verify the `__dirname`/`$PSScriptRoot` depth calculation matches the actual directory depth.
