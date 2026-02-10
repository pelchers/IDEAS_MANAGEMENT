import { prisma } from "../db";
import { authConfig } from "./config";
import { newToken, sha256Hex } from "./tokens";

export async function issueSession(userId: string) {
  const sessionToken = newToken(32);
  const refreshToken = newToken(32);

  const now = Date.now();
  const sessionExpiresAt = new Date(now + authConfig.sessionTtlSeconds * 1000);
  const refreshExpiresAt = new Date(now + authConfig.refreshTtlSeconds * 1000);

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash: sha256Hex(sessionToken),
      expiresAt: sessionExpiresAt
    }
  });

  const refreshRow = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256Hex(refreshToken),
      expiresAt: refreshExpiresAt
    }
  });

  return { sessionToken, refreshToken, refreshId: refreshRow.id };
}

export async function revokeSessionByToken(token: string) {
  await prisma.session.updateMany({
    where: { sessionTokenHash: sha256Hex(token), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function revokeRefreshByToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256Hex(token), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function rotateRefreshToken(oldToken: string) {
  const oldHash = sha256Hex(oldToken);
  const old = await prisma.refreshToken.findUnique({ where: { tokenHash: oldHash } });
  if (!old) return null;
  if (old.revokedAt) return null;
  if (old.expiresAt.getTime() < Date.now()) return null;

  const newRefresh = newToken(32);
  const newHash = sha256Hex(newRefresh);

  const created = await prisma.refreshToken.create({
    data: {
      userId: old.userId,
      tokenHash: newHash,
      expiresAt: old.expiresAt
    }
  });

  await prisma.refreshToken.update({
    where: { id: old.id },
    data: { revokedAt: new Date(), replacedById: created.id }
  });

  // Also issue a fresh session token on refresh.
  const sessionToken = newToken(32);
  const sessionExpiresAt = new Date(Date.now() + authConfig.sessionTtlSeconds * 1000);
  await prisma.session.create({
    data: {
      userId: old.userId,
      sessionTokenHash: sha256Hex(sessionToken),
      expiresAt: sessionExpiresAt
    }
  });

  return { userId: old.userId, sessionToken, refreshToken: newRefresh };
}

