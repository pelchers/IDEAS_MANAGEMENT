import { prisma } from "@/server/db";
import { encrypt, decrypt } from "@/server/ai/crypto";
import type { IntegrationProvider, IntegrationStatus } from "@/generated/prisma";

/** Read a user's connection for a provider (or null). */
export async function getIntegration(userId: string, provider: IntegrationProvider) {
  return prisma.integration.findUnique({ where: { userId_provider: { userId, provider } } });
}

/** All of a user's integration rows. */
export async function listIntegrations(userId: string) {
  return prisma.integration.findMany({ where: { userId } });
}

/** Decrypt a stored config blob, or {} if none/undecryptable. */
export function readConfig(configEncrypted: string | null): Record<string, unknown> {
  if (!configEncrypted) return {};
  try {
    return JSON.parse(decrypt(configEncrypted)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

interface ConnectInput {
  userId: string;
  provider: IntegrationProvider;
  config?: Record<string, unknown>;
  scopes?: string[];
  accountLabel?: string | null;
  status?: IntegrationStatus;
}

/** Create/refresh a connection, encrypting config at rest. */
export async function upsertIntegration(input: ConnectInput) {
  const configEncrypted =
    input.config && Object.keys(input.config).length > 0 ? encrypt(JSON.stringify(input.config)) : undefined;
  const status = input.status ?? "CONNECTED";
  return prisma.integration.upsert({
    where: { userId_provider: { userId: input.userId, provider: input.provider } },
    create: {
      userId: input.userId,
      provider: input.provider,
      status,
      configEncrypted: configEncrypted ?? null,
      scopes: input.scopes ?? [],
      accountLabel: input.accountLabel ?? null,
      connectedAt: status === "CONNECTED" ? new Date() : null,
    },
    update: {
      status,
      ...(configEncrypted !== undefined ? { configEncrypted } : {}),
      ...(input.scopes ? { scopes: input.scopes } : {}),
      ...(input.accountLabel !== undefined ? { accountLabel: input.accountLabel } : {}),
      connectedAt: status === "CONNECTED" ? new Date() : null,
    },
  });
}

/** Mark a connection disconnected and wipe its stored secrets. */
export async function disconnectIntegration(userId: string, provider: IntegrationProvider) {
  const existing = await getIntegration(userId, provider);
  if (!existing) return;
  await prisma.integration.update({
    where: { userId_provider: { userId, provider } },
    data: { status: "DISCONNECTED", configEncrypted: null, scopes: [], accountLabel: null, connectedAt: null },
  });
}
