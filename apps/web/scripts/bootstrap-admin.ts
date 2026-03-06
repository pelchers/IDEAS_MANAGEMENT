import { prisma } from "../src/server/db";
import { hashPassword } from "../src/server/auth/password";
import { auditLog } from "../src/server/audit";

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? null : process.argv[idx + 1] ?? null;
}

async function main() {
  const providedKey = arg("--key");
  const expectedKey = process.env.ADMIN_BOOTSTRAP_KEY;

  if (!expectedKey) {
    throw new Error("Missing ADMIN_BOOTSTRAP_KEY");
  }
  if (!providedKey || providedKey !== expectedKey) {
    throw new Error("Invalid bootstrap key. Provide --key <ADMIN_BOOTSTRAP_KEY>.");
  }

  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${existing.id}`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      role: "ADMIN",
      emailVerifiedAt: new Date(), // Admin email is pre-verified
      credential: {
        create: {
          passwordHash,
          passwordAlgo: "argon2id"
        }
      }
    },
    select: { id: true, email: true, role: true }
  });

  await auditLog({
    actorUserId: user.id,
    action: "admin.bootstrap",
    metadata: { email: user.email, role: user.role }
  });

  console.log(`Created admin user: ${user.id} (${user.email}) role=${user.role}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

