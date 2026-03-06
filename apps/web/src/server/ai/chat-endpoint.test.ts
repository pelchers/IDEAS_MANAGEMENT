import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the AI chat endpoint authentication and entitlement gates.
 * These tests mock the auth/entitlement layer to verify the endpoint
 * correctly rejects unauthorized and unentitled requests.
 */

// Mock modules
vi.mock("@/server/auth/admin", () => ({
  getAuthenticatedUser: vi.fn(),
  requireAuth: vi.fn(),
  isErrorResponse: vi.fn((result: unknown) => {
    return result && typeof result === "object" && "status" in result;
  }),
}));

vi.mock("@/server/billing/require-entitlement", () => ({
  requireEntitlement: vi.fn(),
}));

vi.mock("@/server/billing/entitlements", () => ({
  FEATURES: { AI_CHAT: "ai_chat" },
  checkEntitlement: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    aiChatSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    aiChatMessage: {
      create: vi.fn(),
    },
    aiToolOutput: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/audit", () => ({
  auditLog: vi.fn(),
}));

// Mock the AI SDK to avoid real API calls
vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toUIMessageStreamResponse: () =>
      new Response("streaming", {
        headers: new Headers({ "content-type": "text/plain" }),
      }),
  })),
  tool: vi.fn((def: Record<string, unknown>) => def),
  stepCountIs: vi.fn(() => () => false),
  convertToModelMessages: vi.fn(async () => []),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => ({})),
}));

import { requireEntitlement } from "@/server/billing/require-entitlement";

const mockRequireEntitlement = requireEntitlement as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AI Chat Endpoint - Auth & Entitlement Gates", () => {
  it("returns 401 when user is not authenticated", async () => {
    mockRequireEntitlement.mockResolvedValue({
      status: 401,
      json: async () => ({ ok: false, error: "unauthorized" }),
    });

    // Import the handler dynamically
    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("returns 403 when user lacks AI_CHAT entitlement", async () => {
    mockRequireEntitlement.mockResolvedValue({
      status: 403,
      json: async () => ({
        ok: false,
        error: "entitlement_required",
        feature: "ai_chat",
      }),
    });

    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
  });

  it("returns 400 when messages are missing", async () => {
    mockRequireEntitlement.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: "USER",
      emailVerifiedAt: new Date(),
    });

    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("messages_required");
  });

  it("returns 400 for empty messages array", async () => {
    mockRequireEntitlement.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: "USER",
      emailVerifiedAt: new Date(),
    });

    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("allows admin users to bypass entitlement check", async () => {
    // Admin user passes requireEntitlement (since checkEntitlement returns true for ADMIN)
    const adminUser = {
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    };
    mockRequireEntitlement.mockResolvedValue(adminUser);

    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as unknown as {
      aiChatSession: { create: ReturnType<typeof vi.fn> };
      aiChatMessage: { create: ReturnType<typeof vi.fn> };
    };
    mockPrisma.aiChatSession.create.mockResolvedValue({
      id: "session-1",
      userId: "admin-1",
      title: "hello",
    });
    mockPrisma.aiChatMessage.create.mockResolvedValue({
      id: "msg-1",
    });

    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hello" }],
      }),
    });

    const response = await POST(req);
    // Should get a streaming response (not 401/403)
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});

describe("AI Chat Endpoint - Message Persistence", () => {
  it("persists user message to database", async () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
      role: "USER" as const,
      emailVerifiedAt: new Date(),
    };
    mockRequireEntitlement.mockResolvedValue(user);

    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as unknown as {
      aiChatSession: { create: ReturnType<typeof vi.fn> };
      aiChatMessage: { create: ReturnType<typeof vi.fn> };
    };
    mockPrisma.aiChatSession.create.mockResolvedValue({
      id: "session-new",
      userId: "user-1",
      title: "Test message",
    });
    mockPrisma.aiChatMessage.create.mockResolvedValue({ id: "msg-1" });

    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Test message" }],
      }),
    });

    await POST(req);

    // Verify session was created
    expect(mockPrisma.aiChatSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          title: "Test message",
        }),
      })
    );

    // Verify user message was persisted
    expect(mockPrisma.aiChatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionId: "session-new",
          role: "USER",
          content: "Test message",
        }),
      })
    );
  });

  it("uses existing session when sessionId is provided", async () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
      role: "USER" as const,
      emailVerifiedAt: new Date(),
    };
    mockRequireEntitlement.mockResolvedValue(user);

    const { prisma } = await import("@/server/db");
    const mockPrisma = prisma as unknown as {
      aiChatSession: { create: ReturnType<typeof vi.fn> };
      aiChatMessage: { create: ReturnType<typeof vi.fn> };
    };
    mockPrisma.aiChatMessage.create.mockResolvedValue({ id: "msg-2" });

    const { POST } = await import("@/app/api/ai/chat/route");

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Follow up" }],
        sessionId: "existing-session",
      }),
    });

    await POST(req);

    // Should NOT create a new session
    expect(mockPrisma.aiChatSession.create).not.toHaveBeenCalled();

    // Should persist message with existing session ID
    expect(mockPrisma.aiChatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionId: "existing-session",
          role: "USER",
          content: "Follow up",
        }),
      })
    );
  });
});
