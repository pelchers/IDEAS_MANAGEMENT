# Do-Over System

## Overview
Maintains the do-over-files directory as a clean reference copy of configuration files. Used to restore, verify, or sync the pristine configuration state when the primary copies get corrupted or diverge.

## Components
| Component | Path |
|---|---|
| **Agent** | `.claude/agents/do-over-agent/AGENT.md` |

## How to Use
```
"restore the do-over files"
"verify do-over-files are in sync"
"sync pristine config from do-over-files"
```

## Integration
- **trinary_sync**: do-over-files is one of the three sync targets
- **maintaining-trinary-sync**: uses do-over-files as the pristine reference
