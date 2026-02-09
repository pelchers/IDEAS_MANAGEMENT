# Codex Documentation Index

## Purpose
This folder documents the Codex tooling, agents, skills, hooks, and conventions used in this repo.

## Table of Contents

### Appendix
- `appendix/TOC.md` — master index and file purpose list

### Guides
- `guides/longrunning-system.md` — user + implementation guide for the orchestration loop

### Systems
- `systems/agents.md` — agent catalog and responsibilities
- `systems/skills.md` — skill catalog and usage rules
- `systems/hooks.md` — hook inventory and behavior
- `systems/commands.md` — custom command list and usage
- `systems/conventions.md` — repo conventions and ADR workflow

## Quick Pointers
- Orchestration queue: `.codex/orchestration/queue/next_phase.template.json`
- Orchestration hook: `.codex/hooks/scripts/orchestrator-poke.ps1`
- Primary task lists: `.codex/adr/orchestration/*/primary_task_list.md`
- Phase plans: `.codex/adr/current/<SESSION>/phase_N.md`
- Phase reviews: `.codex/adr/history/<SESSION>/phase_N_review.md`
