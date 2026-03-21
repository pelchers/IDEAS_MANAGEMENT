# Notes — 9.5 Universal Stateful AI Expansion

## Decisions
- D1: Remove mock mode entirely — Ollama auto-detect is the fallback, not canned responses
- D2: Tool calls shown inline as collapsible action cards (not separate messages)
- D3: Session context sent as full message history (not summarized) — models handle context windows
- D4: Slash commands are client-side only (no API changes needed)
- D5: Helper widget sessions are per-page, stored in localStorage with session IDs
- D6: Context injection reads at most 3 artifacts (ideas, kanban, schema) to avoid token bloat
- D7: Qwen3:4b is the default local model (verified tool calling works)

## Architecture
- The Vercel AI SDK's `streamText` already supports multi-step tool orchestration via `stopWhen: stepCountIs(5)` — it calls tools and feeds results back automatically
- The gap is on the frontend: we only parse text chunks, ignoring tool call stream events
- The `onFinish` callback receives `toolCalls` and `toolResults` — we just need to persist them
- Session continuity is just "load all messages from DB and send them as the messages array"

## Risk
- Context injection could send too much data for small models — cap at ~2000 tokens of artifact summary
- Qwen3:4b thinking mode returns empty `content` for tool calls — the AI SDK handles this correctly but our text-only parser shows nothing. Need to parse tool call events.
