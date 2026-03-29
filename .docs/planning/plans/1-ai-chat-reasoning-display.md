# Plan #1 — AI Chat Reasoning Display + Multi-Step Tool Flow

**Date:** 2026-03-28
**Commit:** 9397111
**Status:** Approved
**Author:** Claude + User

---

## Context

**What exists now:**
- AI chat sends messages to Groq/Ollama via Vercel AI SDK
- Tool calls execute but users see blank responses (qwen3 thinking mode returns empty `content`, reasoning in separate field)
- No live feedback during tool execution — user sees nothing until the full response arrives
- No way to see AI's reasoning process
- Stream parser ignores `reasoning` field entirely

**What's the gap:**
- Users think the AI is broken when they see blank responses
- No visibility into what the AI is doing (thinking, calling tools)
- No confirmation before or after tool execution
- qwen3:32b (best local model for tool calling) is unusable because of the display issue

## Plan

### Part 1: Switch Local Model to qwen3:32b
- [ ] Update default Ollama model from `qwen3-coder:30b` to `qwen3:32b`
- [ ] Pull `qwen2.5:14b` as fallback (in case qwen3:32b has issues)

### Part 2: Stream Parser — Capture Reasoning Field
- [ ] Update stream parser in `/ai` page to read `reasoning` field from SSE events
- [ ] Update stream parser in AI helper widget to read `reasoning` field
- [ ] Store reasoning text alongside content in ChatMessage state
- [ ] Update ChatMessage type: add `reasoning?: string` field

### Part 3: Chat UI — Reasoning + Tool Display Area
- [ ] Add gray reasoning area below each AI message bubble
- [ ] Show reasoning text streaming live (italic, gray, smaller font)
- [ ] Show tool calls in same gray area: "▶ Calling: update_ideas_artifact..."
- [ ] Show tool results: "✅ Result: Idea added" or "❌ Error: ..."
- [ ] Area auto-collapses after response completes (show/hide toggle)
- [ ] Brutalist styling: border-dashed, bg-creamy-milk, font-mono

### Part 4: Multi-Step Flow (Text → Tool → Text)
- [ ] Ensure `stopWhen: stepCountIs(3)` is set in chat API
- [ ] Step 1: Model generates initial text ("Let me do that...") + tool call
- [ ] Step 2: Tool executes, result fed back to model
- [ ] Step 3: Model generates confirmation text ("Done! Added your idea...")
- [ ] Test multi-step with qwen3:32b via Ollama
- [ ] Test multi-step with gpt-oss-120b via Groq (when key available)

### Part 5: "Log Reasoning" Toggle
- [ ] Add checkbox/toggle in top-right of /ai chat page header
- [ ] Default: OFF (reasoning shown in gray area only, collapses after)
- [ ] When ON: full reasoning text included in chat message bubbles permanently
- [ ] Persist toggle state in localStorage

### Part 6: Testing & Validation
- [ ] Test qwen3:32b: tool call + reasoning display + text response
- [ ] Test multi-step: initial text → tool → confirmation text
- [ ] Playwright screenshot: reasoning area visible during tool execution
- [ ] Playwright screenshot: "Log Reasoning" toggle on vs off
- [ ] Verify tool results still dispatch artifact-updated events for live reactivity

## Questions
- None — user approved the architecture in chat
