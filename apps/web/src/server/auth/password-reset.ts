import { prisma } from "../db";
import { newToken, sha256Hex } from "./tokens";
import { hashPassword } from "./password";

const PASSWORD_RESET_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Issue a password reset token for a user.
 * In production this would trigger an email; here we return the raw token.
 */
export async function issuePasswordResetToken(userId: string) {
  const token = newToken(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000);

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt }
  });

  return { token, expiresAt };
}

/**
 * Consume a password reset token and update the user's password.
 * Returns the user id on success, null on failure.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<string | null> {
  const tokenHash = sha256Hex(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!row) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  const newHash = await hashPassword(newPassword);

  // Mark token as used and update password in a transaction
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() }
    }),
    prisma.credential.update({
      where: { userId: row.userId },
      data: { passwordHash: newHash }
    })
  ]);

  return row.userId;
}
