/**
 * Set (or reset) an admin login. Password is taken from args/env — never baked in.
 *   pnpm exec tsx scripts/set-review-admin.ts <email> <password>
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm exec tsx scripts/set-review-admin.ts
 * Intended for local/dev review convenience; login itself no longer enforces a
 * minimum password length (strength is enforced only at signup).
 */
import { prisma } from "../src/server/db";
import { hashPassword } from "../src/server/auth/password";

async function main() {
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("Usage: tsx scripts/set-review-admin.ts <email> <password>");
  }
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      credential: { create: { passwordHash, passwordAlgo: "argon2id" } },
    },
    update: {
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      credential: {
        upsert: {
          create: { passwordHash, passwordAlgo: "argon2id" },
          update: { passwordHash, passwordAlgo: "argon2id" },
        },
      },
    },
    select: { id: true, email: true, role: true },
  });

  console.log(`Admin ready: ${user.email} (${user.role}) id=${user.id}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
