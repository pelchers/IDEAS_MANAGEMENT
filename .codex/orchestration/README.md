# Orchestration Queue

Copy `next_phase.template.json` to `next_phase.json` in this directory to trigger a subagent spawn.

The `orchestrator-poke.ps1` hook will read the file and run `codex exec` with the
provided prompt. If `agent` is set, the hook prefixes the prompt with the agent file path.
Completed queue items are moved to `.codex/orchestration/history/`.

Example:
```
{
  "session": "2_SITE_DESIGN_AND_BUILD",
  "phase": "phase_7",
  "agent": "longrunning-agent",
  "workdir": "C:\\coding\\docs\\Hytale",
  "fullAuto": true,
  "autoSpawn": true,
  "dryRun": true,
  "prompt": "Complete phase 7 using longrunning-session workflow."
}
```
