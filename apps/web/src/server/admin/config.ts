import { prisma } from "../db";

const ALLOWED_KEYS = [
  "free_tier_ai_enabled",
  "default_ai_model",
] as const;

export type AdminConfigKey = typeof ALLOWED_KEYS[number];

/**
 * Get an admin config value.
 * Checks env var override first, then DB, then returns null.
 */
export async function getAdminConfig(key: AdminConfigKey): Promise<string | null> {
  // Env var override (uppercase, dots→underscores)
  const envKey = key.toUpperCase();
  const envVal = process.env[envKey];
  if (envVal !== undefined) return envVal;

  try {
    const record = await prisma.adminConfig.findUnique({ where: { key } });
    return record?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Set an admin config value in the database.
 */
export async function setAdminConfig(key: AdminConfigKey, value: string): Promise<void> {
  if (!ALLOWED_KEYS.includes(key)) {
    throw new Error(`Invalid admin config key: ${key}`);
  }

  await prisma.adminConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/**
 * Get all admin config values.
 */
export async function getAllAdminConfig(): Promise<Record<string, string>> {
  const records = await prisma.adminConfig.findMany();
  const result: Record<string, string> = {};
  for (const r of records) {
    result[r.key] = r.value;
  }

  // Apply env var overrides
  for (const key of ALLOWED_KEYS) {
    const envKey = key.toUpperCase();
    if (process.env[envKey] !== undefined) {
      result[key] = process.env[envKey]!;
    }
  }

  return result;
}

/**
 * Get AI usage stats for admin dashboard.
 */
export async function getAiUsageStats(): Promise<{
  totalMessagesThisPeriod: number;
  estimatedCost: number;
  activeSubscribers: { pro: number; team: number };
}> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [usage, proCount, teamCount] = await Promise.all([
    prisma.aiTokenUsage.aggregate({
      where: { periodStart: { gte: periodStart } },
      _sum: { messagesUsed: true, tokensInput: true, tokensOutput: true },
    }),
    prisma.subscription.count({
      where: { status: { in: ["ACTIVE", "TRIALING"] }, plan: "PRO" },
    }),
    prisma.subscription.count({
      where: { status: { in: ["ACTIVE", "TRIALING"] }, plan: "TEAM" },
    }),
  ]);

  const inputTokens = usage._sum.tokensInput || 0;
  const outputTokens = usage._sum.tokensOutput || 0;
  const estimatedCost = (inputTokens * 0.15 / 1_000_000) + (outputTokens * 0.60 / 1_000_000);

  return {
    totalMessagesThisPeriod: usage._sum.messagesUsed || 0,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    activeSubscribers: { pro: proCount, team: teamCount },
  };
}
