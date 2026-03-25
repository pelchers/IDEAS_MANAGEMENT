# Repo Setup — Usage Guide

## Quick Start

### Bootstrap a New Project
```
User: "set up a new project"
User: "bootstrap this repo"
User: "initialize project docs"
```
The repo-setup skill launches an interactive discovery conversation to understand your project, then populates planning docs and AI understanding docs.

## What It Creates

### Planning Docs
- `.docs/planning/` — project plan, feature list, user stories
- `.adr/` — full ADR folder structure (orchestration, current, history)
- `.adr/orchestration/primary_task_list.md` — master phase checklist

### AI Understanding Docs
- `CLAUDE.md` — project guide for Claude Code
- `.claude/` directory structure — agents, skills, hooks, commands

### Project Config (if needed)
- `package.json` scaffolding
- `.env.example` with required variables
- Basic monorepo structure

## The Discovery Conversation

The skill asks questions to scope the project:
1. **What are you building?** — app type, target users, core functionality
2. **What's the tech stack?** — framework, language, database, hosting
3. **What's the design direction?** — style family, existing mockups, brand guidelines
4. **What are the key features?** — prioritized feature list
5. **What's the timeline/scope?** — complexity assessment for session planning

Answers feed directly into the ADR session structure — high-complexity features get their own sessions, related features get grouped.

## Components

| Component | Path |
|---|---|
| Skill | `.claude/skills/repo-setup-session/SKILL.md` |
| ADR Setup Skill | `.claude/skills/adr-setup/SKILL.md` (called during setup) |
