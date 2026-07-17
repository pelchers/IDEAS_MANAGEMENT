-- CreateEnum
CREATE TYPE "RunnerStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR');

-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('QUEUED', 'RUNNING', 'DONE', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('TASK_STATUS_CHANGED', 'TASK_CREATED');

-- CreateTable
CREATE TABLE "Runner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "RunnerStatus" NOT NULL DEFAULT 'OFFLINE',
    "workingDir" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunnerCommand" (
    "id" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "command" TEXT NOT NULL,
    "cwd" TEXT,
    "status" "CommandStatus" NOT NULL DEFAULT 'QUEUED',
    "exitCode" INTEGER,
    "output" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunnerCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandSnippet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommandSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "trigger" "AutomationTrigger" NOT NULL,
    "conditionJson" JSONB NOT NULL,
    "runnerId" TEXT,
    "command" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Runner_tokenHash_key" ON "Runner"("tokenHash");

-- CreateIndex
CREATE INDEX "Runner_userId_idx" ON "Runner"("userId");

-- CreateIndex
CREATE INDEX "RunnerCommand_runnerId_status_idx" ON "RunnerCommand"("runnerId", "status");

-- CreateIndex
CREATE INDEX "RunnerCommand_userId_idx" ON "RunnerCommand"("userId");

-- CreateIndex
CREATE INDEX "RunnerCommand_taskId_idx" ON "RunnerCommand"("taskId");

-- CreateIndex
CREATE INDEX "CommandSnippet_userId_idx" ON "CommandSnippet"("userId");

-- CreateIndex
CREATE INDEX "AutomationRule_userId_idx" ON "AutomationRule"("userId");

-- AddForeignKey
ALTER TABLE "Runner" ADD CONSTRAINT "Runner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunnerCommand" ADD CONSTRAINT "RunnerCommand_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunnerCommand" ADD CONSTRAINT "RunnerCommand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandSnippet" ADD CONSTRAINT "CommandSnippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
