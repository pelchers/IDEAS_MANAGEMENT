-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiFallbackSetting" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "preferredAiProvider" TEXT NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "AiTokenUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "messagesUsed" INTEGER NOT NULL DEFAULT 0,
    "tokensInput" INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "tokenPackBalance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiTokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminConfig_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "AiTokenUsage_userId_idx" ON "AiTokenUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AiTokenUsage_userId_periodStart_key" ON "AiTokenUsage"("userId", "periodStart");

-- AddForeignKey
ALTER TABLE "AiTokenUsage" ADD CONSTRAINT "AiTokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
