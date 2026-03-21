# Technical Requirements — 9.5 Universal Stateful AI Expansion

## Database Changes

### AiChatSession additions
```prisma
model AiChatSession {
  // Existing fields...
  pinned    Boolean @default(false)
  archived  Boolean @default(false)
}
```

### AiChatMessage — persist tool data
Already has `toolCalls Json?` and `toolResults Json?` fields — just need to use them in `onFinish`.

## API Changes

### PUT /api/ai/sessions/[id] (new)
- Rename session title
- Toggle pinned/archived

### GET /api/ai/sessions?search=query (enhance)
- Full-text search across session titles and message content

### POST /api/ai/chat (enhance)
- `onFinish` persists toolCalls and toolResults in AiChatMessage
- System prompt auto-injects current artifact state when projectId is provided
- Tool call events streamed to client (not just text)

## Frontend Changes

### Chat Message Types
```typescript
interface ChatMessage {
  role: "user" | "ai";
  text: string;
  toolCalls?: { name: string; args: Record<string, unknown>; result?: unknown }[];
}
```

### Stream Parser
Parse additional Vercel AI SDK stream events:
- `9:` — tool call start
- `a:` — tool result
- `e:` — step finish
- `d:` — finish

### Slash Command Parser
Client-side detection and handling:
- `/new` → create new session, clear messages
- `/clear` → clear current session messages
- `/rename <title>` → PUT /api/ai/sessions/[id]
- `/export` → download session as markdown
- `/help` → show available commands

### Floating Helper
- Store session ID per page in localStorage (`ai_helper_session_{pathname}`)
- Load messages when reopening on same page
- "Expand to full chat" button
