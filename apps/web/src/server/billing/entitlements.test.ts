import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for entitlement logic.
 * Uses mocked Prisma client to avoid database dependency.
 */

// Mock prisma
vi.mock("../db", () => ({
  prisma: {
    entitlement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "../db";
import {
  checkEntitlement,
  getUserEntitlements,
  syncEntitlementsForPlan,
  revokeSubscriptionEntitlements,
  FEATURES,
  PLAN_FEATURES,
} from "./entitlements";

const mockPrisma = prisma as unknown as {
  entitlement: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  subscription: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkEntitlement", () => {
  it("grants access to admin users regardless of subscriptions", async () => {
    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "ADMIN");
    expect(result).toBe(true);
    // Should not query the database
    expect(mockPrisma.entitlement.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it("grants access when explicit entitlement exists and is not expired", async () => {
    mockPrisma.entitlement.findUnique.mockResolvedValue({
      id: "ent-1",
      userId: "user-1",
      feature: FEATURES.AI_CHAT,
      grantedAt: new Date(),
      expiresAt: null,
      source: "SUBSCRIPTION",
    });

    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "USER");
    expect(result).toBe(true);
  });

  it("denies access when explicit entitlement is expired", async () => {
    mockPrisma.entitlement.findUnique.mockResolvedValue({
      id: "ent-1",
      userId: "user-1",
      feature: FEATURES.AI_CHAT,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() - 86400000), // expired yesterday
      source: "TRIAL",
    });

    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "USER");
    expect(result).toBe(false);
  });

  it("grants access when active subscription includes the feature", async () => {
    mockPrisma.entitlement.findUnique.mockResolvedValue(null);
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      plan: "PRO",
      status: "ACTIVE",
    });

    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "USER");
    expect(result).toBe(true);
  });

  it("denies access when no subscription and no entitlement", async () => {
    mockPrisma.entitlement.findUnique.mockResolvedValue(null);
    mockPrisma.subscription.findFirst.mockResolvedValue(null);

    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "USER");
    expect(result).toBe(false);
  });

  it("denies access when subscription plan does not include the feature", async () => {
    mockPrisma.entitlement.findUnique.mockResolvedValue(null);
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      plan: "FREE",
      status: "ACTIVE",
    });

    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "USER");
    expect(result).toBe(false);
  });

  it("grants access when subscription is TRIALING", async () => {
    mockPrisma.entitlement.findUnique.mockResolvedValue(null);
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      plan: "PRO",
      status: "TRIALING",
    });

    const result = await checkEntitlement("user-1", FEATURES.AI_CHAT, "USER");
    expect(result).toBe(true);
  });
});

describe("getUserEntitlements", () => {
  it("returns all features for admin users", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.entitlement.findMany.mockResolvedValue([]);

    const result = await getUserEntitlements("user-1", "ADMIN");
    expect(result.isAdmin).toBe(true);
    expect(result.features).toContain(FEATURES.PRO_ACCESS);
    expect(result.features).toContain(FEATURES.TEAM_ACCESS);
    expect(result.features).toContain(FEATURES.AI_CHAT);
  });

  it("returns FREE plan with no features for users without subscriptions", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.entitlement.findMany.mockResolvedValue([]);

    const result = await getUserEntitlements("user-1", "USER");
    expect(result.plan).toBe("FREE");
    expect(result.features).toEqual([]);
    expect(result.isAdmin).toBe(false);
  });

  it("returns PRO features for users with PRO subscription", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-1",
      plan: "PRO",
      status: "ACTIVE",
    });
    mockPrisma.entitlement.findMany.mockResolvedValue([]);

    const result = await getUserEntitlements("user-1", "USER");
    expect(result.plan).toBe("PRO");
    expect(result.features).toContain(FEATURES.PRO_ACCESS);
    expect(result.features).toContain(FEATURES.AI_CHAT);
    expect(result.features).not.toContain(FEATURES.TEAM_ACCESS);
  });

  it("merges explicit entitlements with subscription features", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-1",
      plan: "PRO",
      status: "ACTIVE",
    });
    mockPrisma.entitlement.findMany.mockResolvedValue([
      {
        id: "ent-1",
        feature: FEATURES.TEAM_ACCESS,
        source: "ADMIN_GRANT",
        expiresAt: null,
      },
    ]);

    const result = await getUserEntitlements("user-1", "USER");
    expect(result.features).toContain(FEATURES.PRO_ACCESS);
    expect(result.features).toContain(FEATURES.TEAM_ACCESS); // Admin-granted
  });
});

describe("PLAN_FEATURES", () => {
  it("FREE plan has no features", () => {
    expect(PLAN_FEATURES.FREE).toEqual([]);
  });

  it("PRO plan includes core premium features but not team", () => {
    expect(PLAN_FEATURES.PRO).toContain(FEATURES.PRO_ACCESS);
    expect(PLAN_FEATURES.PRO).toContain(FEATURES.AI_CHAT);
    expect(PLAN_FEATURES.PRO).not.toContain(FEATURES.TEAM_ACCESS);
  });

  it("TEAM plan includes all PRO features plus team access", () => {
    expect(PLAN_FEATURES.TEAM).toContain(FEATURES.PRO_ACCESS);
    expect(PLAN_FEATURES.TEAM).toContain(FEATURES.TEAM_ACCESS);
    expect(PLAN_FEATURES.TEAM).toContain(FEATURES.AI_CHAT);
  });
});

describe("syncEntitlementsForPlan", () => {
  it("upserts entitlements for plan features", async () => {
    mockPrisma.entitlement.upsert.mockResolvedValue({});
    mockPrisma.entitlement.deleteMany.mockResolvedValue({ count: 0 });

    await syncEntitlementsForPlan("user-1", "PRO");

    // Should upsert one entitlement per PRO feature
    expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(
      PLAN_FEATURES.PRO.length
    );
    // Should delete non-PRO subscription entitlements
    expect(mockPrisma.entitlement.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        source: "SUBSCRIPTION",
        feature: { notIn: PLAN_FEATURES.PRO },
      },
    });
  });
});

describe("revokeSubscriptionEntitlements", () => {
  it("deletes all subscription-sourced entitlements", async () => {
    mockPrisma.entitlement.deleteMany.mockResolvedValue({ count: 3 });

    await revokeSubscriptionEntitlements("user-1");

    expect(mockPrisma.entitlement.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        source: "SUBSCRIPTION",
      },
    });
  });
});
