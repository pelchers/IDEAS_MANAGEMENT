# PRD — 9.5 Universal Stateful AI Expansion

## Summary
Transform the AI chat from a basic message-in/text-out interface into a Claude Code-like stateful assistant that maintains full conversation context, shows tool usage visibly, supports session management, and works as the primary interaction model across all pages.

## Problem Statement
Current AI chat has critical gaps:
1. Tool calls are invisible — users see AI text responses but not what actions were performed
2. Switching sessions doesn't preserve context — AI forgets the conversation
3. Mock mode is the default instead of local AI (Ollama)
4. No way to rename, search, or export sessions
5. Floating helper doesn't maintain state between opens
6. Tool results aren't persisted in the database
7. No slash commands for power users
8. No auto-injection of current project state as context

## Goals
- **Stateful sessions**: Full conversation history fed back to AI on every turn, including tool calls and results
- **Visible tool usage**: Show tool calls and results inline in the chat (like Claude Code shows file reads/writes)
- **Session management**: Rename, search, export, pin sessions
- **Local AI first**: Ollama is the default, mock mode removed
- **Persistent helper**: Floating widget maintains session per page
- **Slash commands**: /new, /clear, /rename, /export, /help
- **Context injection**: Auto-read current page's artifact data and inject into system prompt
