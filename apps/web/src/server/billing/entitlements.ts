import { prisma } from "../db";
import type { SubscriptionPlan } from "@/generated/prisma";

/**
 * Features that can be gated by entitlements.
 * Add new features here as the product grows.
 */
export const FEATURES = {
  /** Access to pro-tier features (unlimited projects, advanced AI, etc.) */
  PRO_ACCESS: "pro_access",
  /** Access to team-tier features (collaboration, shared workspaces, etc.) */
  TEAM_ACCESS: "team_access",
  /** Access to the whiteboard module */
  WHITEBOARD: "whiteboard",
  /** Access to the schema planner module */
  SCHEMA_PLANNER: "schema_planner",
  /** Access to AI chat features */
  AI_CHAT: "ai_chat",
} as const;

export type Feature = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Map subscription plans to the features they grant.
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, Feature[]> = {
  FREE: [],
  PRO: [
    FEATURES.PRO_ACCESS,
    FEATURES.WHITEBOARD,
    FEATURES.SCHEMA_PLANNER,
    FEATURES.AI_CHAT,
  ],
  TEAM: [
    FEATURES.PRO_ACCESS,
    FEATURES.TEAM_ACCESS,
    FEATURES.WHITEBOARD,
    FEATURES.SCHEMA_PLANNER,
    FEATURES.AI_CHAT,
  ],
};

/**
 * Check if a user has an active entitlement for a given feature.
 *
 * Checks in order:
 * 1. Admin role bypasses all entitlement checks.
 * 2. Explicit entitlement records (from subscription sync, admin grant, or trial).
 * 3. Active subscription with a plan that includes the feature.
 *
 * @returns true if the user is entitled to the feature.
 */
export async function checkEntitlement(
  userId: string,
  feature: Feature,
  userRole?: "USER" | "ADMIN"
): Promise<boolean> {
  // Admin bypass
  if (userRole === "ADMIN") return true;

  // Check explicit entitlement records
  const entitlement = await prisma.entitlement.findUnique({
    where: { userId_feature: { userId, feature } },
  });

  if (entitlement) {
    // Check if entitlement has expired
    if (entitlement.expiresAt && entitlement.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  // Check active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (subscription) {
    const planFeatures = PLAN_FEATURES[subscription.plan];
    return planFeatures.includes(feature);
  }

  return false;
}

/**
 * Get all active entitlements for a user.
 * Returns both explicit entitlement records and subscription-derived features.
 */
export async function getUserEntitlements(
  userId: string,
  userRole?: "USER" | "ADMIN"
): Promise<{
  plan: SubscriptionPlan;
  features: Feature[];
  isAdmin: boolean;
}> {
  const isAdmin = userRole === "ADMIN";

  // Get active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    orderBy: { createdAt: "desc" },
  });

  const plan: SubscriptionPlan = subscription?.plan ?? "FREE";

  // Start with plan-derived features
  const features = new Set<Feature>(PLAN_FEATURES[plan]);

  // Add explicit entitlements
  const explicitEntitlements = await prisma.entitlement.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  for (const ent of explicitEntitlements) {
    features.add(ent.feature as Feature);
  }

  // Admins get all features
  if (isAdmin) {
    for (const f of Object.values(FEATURES)) {
      features.add(f);
    }
  }

  return {
    plan,
    features: Array.from(features),
    isAdmin,
  };
}

/**
 * Sync entitlements for a user based on their current subscription plan.
 * Called after subscription changes (webhook processing).
 */
export async function syncEntitlementsForPlan(
  userId: string,
  plan: SubscriptionPlan
): Promise<void> {
  const features = PLAN_FEATURES[plan];
  const now = new Date();

  // Upsert entitlements for the current plan
  for (const feature of features) {
    await prisma.entitlement.upsert({
      where: { userId_feature: { userId, feature } },
      create: {
        userId,
        feature,
        grantedAt: now,
        source: "SUBSCRIPTION",
      },
      update: {
        expiresAt: null, // Clear any expiry
        source: "SUBSCRIPTION",
      },
    });
  }

  // Remove subscription-sourced entitlements that are NOT in the new plan
  await prisma.entitlement.deleteMany({
    where: {
      userId,
      source: "SUBSCRIPTION",
      feature: { notIn: features },
    },
  });
}

/**
 * Revoke all subscription-sourced entitlements for a user.
 * Called when a subscription is fully canceled.
 */
export async function revokeSubscriptionEntitlements(
  userId: string
): Promise<void> {
  await prisma.entitlement.deleteMany({
    where: {
      userId,
      source: "SUBSCRIPTION",
    },
  });
}
