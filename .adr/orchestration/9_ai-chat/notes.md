# Notes — 9_ai-chat

## Decisions
- D1: Own session — high complexity (streaming, sessions, tool actions, error handling)
- D2: Use Vercel AI SDK useChat hook for streaming integration
- D3: Tool action display shows AI's file-modifying operations with confirm/deny UI

## Design Fidelity
- Mode: FAITHFUL
- Message bubble styling must match pass-1 exactly (colors, borders, avatar positions)
- Chat input must use IBM Plex Mono matching pass-1
