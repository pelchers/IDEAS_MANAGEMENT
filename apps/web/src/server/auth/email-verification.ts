import { prisma } from "../db";
import { newToken, sha256Hex } from "./tokens";

const VERIFICATION_TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Issue an email verification token for a user.
 * In a production system this would send an email; here we return the raw token
 * so the caller (API route) can include it in a response or log it.
 */
export async function issueEmailVerificationToken(userId: string) {
  const token = newToken(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_SECONDS * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt }
  });

  return { token, expiresAt };
}

/**
 * Consume an email verification token and mark the user's email as verified.
 * Returns the user id on success, null on failure.
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const tokenHash = sha256Hex(token);
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash }
  });

  if (!row) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  // Mark token as used and mark user as verified in a transaction
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() }
    })
  ]);

  return row.userId;
}
