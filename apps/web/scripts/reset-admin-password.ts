import { prisma } from "../src/server/db";
import { hashPassword } from "../src/server/auth/password";

async function main() {
  const email = "admin@idea.management";
  const newPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";

  console.log(`Resetting password for ${email}...`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("Admin user not found!");
    process.exit(1);
  }

  const hash = await hashPassword(newPassword);
  await prisma.credential.updateMany({
    where: { userId: user.id },
    data: { passwordHash: hash },
  });

  console.log("Password updated successfully.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
