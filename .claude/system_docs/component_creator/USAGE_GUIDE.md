# Component Creator — Usage Guide

## Quick Start
```
/create-component "data ingestion agent with CLI scripts"
```
Creates: agent + skill + hook (if needed) + command + system docs + codex mirror + repo sync.

## Fill Gaps
```
/create-component --complete chain-agent
```
Checks what's missing for an existing component and creates it.

## Audit All
```
/create-component --audit
```
Scans all agents/skills and reports gaps (similar to /system-docs-audit but broader).
