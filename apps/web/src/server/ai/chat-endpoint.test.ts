import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the AI chat endpoint auth + entitlement gates and message
 * persistence. Mocks the auth/entitlement/limit layers so we can verify the
 * endpoint's branching without a real DB or AI provider.
 *
 * Route contract (src/app/api/ai/chat/route.ts):
 *   requireAuth → isErrorResponse guard → BYOK/entitlement/limit gate →
 *   parse body → get/create session → persist user message → stream.
 * BYOK users (aiProvider set to a hosted provider key) bypass entitlement + limit.
 */

vi.mock("@/server/auth/admin", () => ({
  getAuthenticatedUser: vi.fn(),
  requireAuth: vi.fn(),
  isErrorResponse: vi.fn(
    (result: unknown) => !!result && typeof result === "object" && "status" in result
  ),
}));

vi.mock("@/server/billing/entitlements", () => ({
  FEATURES: { AI_CHAT: "ai_chat" },
  checkEntitlement: vi.fn(),
  getUserEntitlements: vi.fn(async () => ({ plan: "FREE" })),
}));

vi.mock("@/server/ai/token-tracking", () => ({
  checkLimit: vi.fn(async () => ({ allowed: true, used: 0, limit: 100 })),
  incrementUsage: vi.fn(async () => {}),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    project: { findUnique: vi.fn(async () => null) },
    projectArtifact: { findMany: vi.fn(async () => []) },
    aiChatSession: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), delete: vi.fn() },
    aiChatMessage: { create: vi.fn() },
    aiToolOutput: { create: vi.fn() },
  },
}));

vi.mock("@/server/ai/get-user-model", () => ({
  getUserModel: vi.fn(async () => ({ model: {}, provider: "mock" })),
}));

vi.mock("@/server/audit", () => ({ auditLog: vi.fn() }));

vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toUIMessageStreamResponse: () =>
      new Response("streaming", { headers: new Headers({ "content-type": "text/plain" }) }),
  })),
  tool: vi.fn((def: Record<string, unknown>) => def),
  stepCountIs: vi.fn(() => () => false),
  convertToModelMessages: vi.fn(async () => []),
}));

vi.mock("@ai-sdk/openai", () => ({ openai: vi.fn(() => ({})) }));

import { requireAuth } from "@/server/auth/admin";
import { checkEntitlement } from "@/server/billing/entitlements";
import { prisma } from "@/server/db";

const mockRequireAuth = requireAuth as ReturnType<typeof vi.fn>;
const mockCheckEntitlement = checkEntitlement as ReturnType<typeof vi.fn>;
const mockPrisma = prisma as unknown as {
  aiChatSession: { create: ReturnType<typeof vi.fn> };
  aiChatMessage: { create: ReturnType<typeof vi.fn> };
};

// A BYOK user bypasses entitlement + limit checks (aiProvider is a hosted key).
const byokUser = {
  id: "user-1",
  email: "user@example.com",
  role: "USER" as const,
  emailVerifiedAt: new Date(),
  aiProvider: "OPENAI",
};

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckEntitlement.mockResolvedValue(true);
  mockPrisma.aiChatSession.create.mockResolvedValue({ id: "session-new", userId: "user-1", title: "t" });
  mockPrisma.aiChatMessage.create.mockResolvedValue({ id: "msg-1" });
});

describe("AI Chat Endpoint - Auth & Entitlement Gates", () => {
  it("returns 401 when user is not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      status: 401,
      json: async () => ({ ok: false, error: "unauthorized" }),
    });
    const { POST } = await import("@/app/api/ai/chat/route");
    const response = await POST(makeReq({ messages: [{ role: "user", content: "hello" }] }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when a non-BYOK user lacks AI_CHAT entitlement", async () => {
    mockRequireAuth.mockResolvedValue({ ...byokUser, aiProvider: null });
    mockCheckEntitlement.mockResolvedValue(false);
    const { POST } = await import("@/app/api/ai/chat/route");
    const response = await POST(makeReq({ messages: [{ role: "user", content: "hello" }] }));
    expect(response.status).toBe(403);
  });

  it("returns 400 when messages are missing", async () => {
    mockRequireAuth.mockResolvedValue(byokUser);
    const { POST } = await import("@/app/api/ai/chat/route");
    const response = await POST(makeReq({}));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("messages_required");
  });

  it("returns 400 for empty messages array", async () => {
    mockRequireAuth.mockResolvedValue(byokUser);
    const { POST } = await import("@/app/api/ai/chat/route");
    const response = await POST(makeReq({ messages: [] }));
    expect(response.status).toBe(400);
  });

  it("allows admin users to bypass entitlement check", async () => {
    mockRequireAuth.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      aiProvider: null,
    });
    mockPrisma.aiChatSession.create.mockResolvedValue({ id: "session-1", userId: "admin-1", title: "hello" });
    const { POST } = await import("@/app/api/ai/chat/route");
    const response = await POST(makeReq({ messages: [{ role: "user", content: "hello" }] }));
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    // An admin never triggers the entitlement gate.
    expect(mockCheckEntitlement).not.toHaveBeenCalled();
  });
});

describe("AI Chat Endpoint - Message Persistence", () => {
  it("persists user message to a newly created session", async () => {
    mockRequireAuth.mockResolvedValue(byokUser);
    mockPrisma.aiChatSession.create.mockResolvedValue({ id: "session-new", userId: "user-1", title: "Test message" });

    const { POST } = await import("@/app/api/ai/chat/route");
    await POST(makeReq({ messages: [{ role: "user", content: "Test message" }] }));

    expect(mockPrisma.aiChatSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", title: "Test message" }),
      })
    );
    expect(mockPrisma.aiChatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sessionId: "session-new", role: "USER", content: "Test message" }),
      })
    );
  });

  it("uses the existing session when sessionId is provided", async () => {
    mockRequireAuth.mockResolvedValue(byokUser);
    mockPrisma.aiChatMessage.create.mockResolvedValue({ id: "msg-2" });

    const { POST } = await import("@/app/api/ai/chat/route");
    await POST(makeReq({ messages: [{ role: "user", content: "Follow up" }], sessionId: "existing-session" }));

    expect(mockPrisma.aiChatSession.create).not.toHaveBeenCalled();
    expect(mockPrisma.aiChatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sessionId: "existing-session", role: "USER", content: "Follow up" }),
      })
    );
  });
});
