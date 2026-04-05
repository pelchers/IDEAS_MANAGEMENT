import { PrismaClient } from "@/generated/prisma";

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
  prismaVersion?: number;
};

// Version stamp — bump to invalidate stale globalThis.prisma cache.
// Bumped after Plan #4 schema changes (aiTokenUsage, adminConfig).
const PRISMA_CACHE_VERSION = 2;

const globalForPrisma = globalThis as GlobalWithPrisma;

// Invalidate if the cached version doesn't match or is missing new models.
const cachedIsStale =
  !globalForPrisma.prisma ||
  globalForPrisma.prismaVersion !== PRISMA_CACHE_VERSION ||
  !("aiTokenUsage" in globalForPrisma.prisma) ||
  !("adminConfig" in globalForPrisma.prisma);

if (cachedIsStale) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });
  globalForPrisma.prismaVersion = PRISMA_CACHE_VERSION;
}

export const prisma = globalForPrisma.prisma!;
