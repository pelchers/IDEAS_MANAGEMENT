import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks for the email-digest path.
vi.mock("@/server/db", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));
vi.mock("@/server/email/send", () => ({
  emailConfigured: vi.fn(),
  sendEmail: vi.fn(),
  appBaseUrl: () => "https://app.test",
}));
vi.mock("@/server/tasks/tasks", () => ({
  getToday: vi.fn(),
}));

import {
  buildGoogleAuthUrl,
  tokensToConfig,
  ensureAccessToken,
} from "./google";
import { gmailSend } from "./providers/gmail";
import { readConfig } from "./store";
import { encrypt } from "@/server/ai/crypto";
import { sendTodayDigest } from "./providers/email";
import { prisma } from "@/server/db";
import { emailConfigured, sendEmail } from "@/server/email/send";
import { getToday } from "@/server/tasks/tasks";

describe("google oauth helpers", () => {
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = "cid.test";
    process.env.GOOGLE_CLIENT_SECRET = "secret.test";
  });

  it("builds a consent URL with scopes, state and offline access", () => {
    const url = new URL(buildGoogleAuthUrl(["scope.a", "scope.b"], "https://app.test/cb", "st8"));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("cid.test");
    expect(url.searchParams.get("redirect_uri")).toBe("https://app.test/cb");
    expect(url.searchParams.get("scope")).toBe("scope.a scope.b");
    expect(url.searchParams.get("state")).toBe("st8");
    expect(url.searchParams.get("access_type")).toBe("offline");
  });

  it("tokensToConfig stamps an absolute expiry", () => {
    const cfg = tokensToConfig({ access_token: "at", refresh_token: "rt", expires_in: 100 });
    expect(cfg.accessToken).toBe("at");
    expect(cfg.refreshToken).toBe("rt");
    expect(typeof cfg.expiresAt).toBe("number");
    expect(cfg.expiresAt as number).toBeGreaterThan(Date.now());
  });

  it("ensureAccessToken reuses a still-valid token without a network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const cfg = { accessToken: "valid", refreshToken: "rt", expiresAt: Date.now() + 5 * 60_000 };
    const { accessToken } = await ensureAccessToken(cfg);
    expect(accessToken).toBe("valid");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("ensureAccessToken refreshes an expired token", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "fresh", expires_in: 3600 }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    const cfg = { accessToken: "old", refreshToken: "rt", expiresAt: Date.now() - 1000 };
    const { accessToken, config } = await ensureAccessToken(cfg);
    expect(accessToken).toBe("fresh");
    expect(config.accessToken).toBe("fresh");
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  afterEach(() => vi.unstubAllGlobals());
});

describe("gmail send", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts a base64url RFC-2822 message with a bearer token", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchSpy);
    const cfg = { accessToken: "tok", refreshToken: "rt", expiresAt: Date.now() + 10 * 60_000 };
    const { ok } = await gmailSend(cfg, { to: "a@b.com", subject: "Hi", body: "Body" });
    expect(ok).toBe(true);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/messages/send");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    const raw = JSON.parse(init.body as string).raw as string;
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    expect(decoded).toContain("To: a@b.com");
    expect(decoded).toContain("Subject: Hi");
    expect(decoded).toContain("Body");
  });
});

describe("integration config crypto", () => {
  it("readConfig round-trips an encrypted blob", () => {
    const blob = encrypt(JSON.stringify({ accessToken: "secret", n: 1 }));
    expect(readConfig(blob)).toEqual({ accessToken: "secret", n: 1 });
  });
  it("readConfig returns {} for null or garbage", () => {
    expect(readConfig(null)).toEqual({});
    expect(readConfig("not-base64-cipher")).toEqual({});
  });
});

describe("email today digest", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns not_configured when no email provider is set", async () => {
    (emailConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await sendTodayDigest("u1", new Date());
    expect(res).toEqual({ ok: false, reason: "not_configured" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends a digest when configured", async () => {
    (emailConfigured as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ email: "me@test.com", displayName: "Me" });
    (getToday as ReturnType<typeof vi.fn>).mockResolvedValue({
      overdue: [{ title: "Late", projectName: null }],
      today: [{ title: "Now", projectName: "Proj" }],
      upcoming: [],
      someday: [],
      counts: { overdue: 1, today: 1, upcoming: 0, someday: 0 },
    });
    (sendEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, delivered: true, provider: "resend" });

    const res = await sendTodayDigest("u1", new Date());
    expect(res.ok).toBe(true);
    const msg = (sendEmail as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(msg.to).toBe("me@test.com");
    expect(msg.html).toContain("Late");
    expect(msg.html).toContain("Now");
    expect(msg.text).toContain("Late");
  });
});
