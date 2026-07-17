import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { prisma } from "@/server/db";

/** GET /api/automations — the caller's automation rules. */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const rules = await prisma.automationRule.findMany({ where: { userId: auth.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, rules });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  trigger: z.enum(["TASK_STATUS_CHANGED", "TASK_CREATED"]),
  condition: z.object({ status: z.string().optional(), projectId: z.string().optional() }).default({}),
  runnerId: z.string().min(1),
  command: z.string().min(1).max(8000),
  enabled: z.boolean().optional(),
});

/** POST /api/automations — create a rule. */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const parsed = await validateBody(req, CreateSchema);
  if (isValidationError(parsed)) return parsed;

  // Ensure the runner belongs to the caller.
  const runner = await prisma.runner.findFirst({ where: { id: parsed.runnerId, userId: auth.id }, select: { id: true } });
  if (!runner) return NextResponse.json({ ok: false, error: "runner_not_found" }, { status: 400 });

  const rule = await prisma.automationRule.create({
    data: {
      userId: auth.id,
      name: parsed.name,
      trigger: parsed.trigger,
      conditionJson: parsed.condition as never,
      runnerId: parsed.runnerId,
      command: parsed.command,
      enabled: parsed.enabled ?? true,
    },
  });
  return NextResponse.json({ ok: true, rule }, { status: 201 });
}
