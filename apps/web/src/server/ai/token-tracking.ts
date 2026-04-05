import { prisma } from "../db";
import type { SubscriptionPlan } from "@/generated/prisma";

/**
 * AI message limits per subscription plan.
 * FREE limit is dynamic — controlled by admin toggle (isFreeTierEnabled).
 */
const STATIC_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 25,
  PRO: 5_000,
  TEAM: 15_000,
};

/**
 * Get the message limit for a plan, respecting the free tier toggle.
 */
export async function getMessageLimit(plan: SubscriptionPlan): Promise<number> {
  if (plan === "FREE") {
    const enabled = await isFreeTierEnabled();
    return enabled ? STATIC_LIMITS.FREE : 0;
  }
  return STATIC_LIMITS[plan];
}

/**
 * Check if the free tier AI promotion is enabled.
 * Resolution: env var > DB AdminConfig > default false
 */
export async function isFreeTierEnabled(): Promise<boolean> {
  // Env var override takes precedence
  const envVal = process.env.FREE_TIER_AI_ENABLED;
  if (envVal !== undefined) return envVal === "true";

  // Check DB
  try {
    const config = await prisma.adminConfig.findUnique({
      where: { key: "free_tier_ai_enabled" },
    });
    if (config) return config.value === "true";
  } catch { /* DB not available — use default */ }

  return false; // Default: disabled
}

/**
 * Get or create the usage record for the current billing period.
 */
export async function getOrCreatePeriod(userId: string): Promise<{
  id: string;
  messagesUsed: number;
  tokensInput: number;
  tokensOutput: number;
  tokenPackBalance: number;
  periodStart: Date;
  periodEnd: Date;
}> {
  const now = new Date();

  // Check for existing current period
  const existing = await prisma.aiTokenUsage.findFirst({
    where: {
      userId,
      periodStart: { lte: now },
      periodEnd: { gt: now },
    },
  });

  if (existing) return existing;

  // Create new period (calendar month)
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Try to align with Stripe billing cycle if user has active subscription
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
      orderBy: { createdAt: "desc" },
    });
    if (subscription && subscription.currentPeriodStart && subscription.currentPeriodEnd) {
      // Use Stripe period if it covers now
      if (subscription.currentPeriodStart <= now && subscription.currentPeriodEnd > now) {
        return prisma.aiTokenUsage.upsert({
          where: { userId_periodStart: { userId, periodStart: subscription.currentPeriodStart } },
          create: {
            userId,
            periodStart: subscription.currentPeriodStart,
            periodEnd: subscription.currentPeriodEnd,
          },
          update: {},
        });
      }
    }
  } catch { /* Fall through to calendar month */ }

  return prisma.aiTokenUsage.upsert({
    where: { userId_periodStart: { userId, periodStart } },
    create: { userId, periodStart, periodEnd },
    update: {},
  });
}

/**
 * Increment usage counters after a successful AI message.
 */
export async function incrementUsage(
  userId: string,
  messages: number = 1,
  inputTokens: number = 0,
  outputTokens: number = 0,
): Promise<void> {
  const period = await getOrCreatePeriod(userId);

  await prisma.aiTokenUsage.update({
    where: { id: period.id },
    data: {
      messagesUsed: { increment: messages },
      tokensInput: { increment: inputTokens },
      tokensOutput: { increment: outputTokens },
    },
  });
}

/**
 * Check if a user is within their message limit.
 */
export async function checkLimit(
  userId: string,
  plan: SubscriptionPlan,
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  packBalance: number;
  periodEnd: Date;
}> {
  const [period, limit] = await Promise.all([
    getOrCreatePeriod(userId),
    getMessageLimit(plan),
  ]);

  const used = period.messagesUsed;
  const subRemaining = Math.max(0, limit - used);

  if (subRemaining > 0) {
    return { allowed: true, used, limit, remaining: subRemaining, packBalance: period.tokenPackBalance, periodEnd: period.periodEnd };
  }

  // Sub limit reached — check token pack balance
  if (period.tokenPackBalance > 0) {
    return { allowed: true, used, limit, remaining: 0, packBalance: period.tokenPackBalance, periodEnd: period.periodEnd };
  }

  return { allowed: false, used, limit, remaining: 0, packBalance: 0, periodEnd: period.periodEnd };
}

/**
 * Consume from token pack balance (called when sub limit is exhausted).
 * Returns true if pack tokens were available and consumed.
 */
export async function consumePackTokens(
  userId: string,
  tokensUsed: number = 2500, // ~1 message worth
): Promise<boolean> {
  const period = await getOrCreatePeriod(userId);
  if (period.tokenPackBalance < tokensUsed) return false;

  await prisma.aiTokenUsage.update({
    where: { id: period.id },
    data: { tokenPackBalance: { decrement: tokensUsed } },
  });
  return true;
}

/**
 * Get usage stats for display in UI.
 */
export async function getUsage(userId: string, plan: SubscriptionPlan): Promise<{
  used: number;
  limit: number;
  remaining: number;
  packBalance: number;
  periodEnd: Date;
  plan: SubscriptionPlan;
  percentage: number;
}> {
  const [period, limit] = await Promise.all([
    getOrCreatePeriod(userId),
    getMessageLimit(plan),
  ]);

  const used = period.messagesUsed;
  const remaining = Math.max(0, limit - used);
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return {
    used,
    limit,
    remaining,
    packBalance: period.tokenPackBalance,
    periodEnd: period.periodEnd,
    plan,
    percentage,
  };
}
