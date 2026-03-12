-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('NONE', 'OPENROUTER_OAUTH', 'OPENROUTER_BYOK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiApiKeyEncrypted" TEXT,
ADD COLUMN     "aiProvider" "AiProvider" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "openrouterRefreshToken" TEXT;
