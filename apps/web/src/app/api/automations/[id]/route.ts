import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { prisma } from "@/server/db";

type RouteParams = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  trigger: z.enum(["TASK_STATUS_CHANGED", "TASK_CREATED"]).optional(),
  condition: z.object({ status: z.string().optional(), projectId: z.string().optional() }).optional(),
  runnerId: z.string().optional(),
  command: z.string().min(1).max(8000).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const owned = await prisma.automationRule.findFirst({ where: { id, userId: auth.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const parsed = await validateBody(req, UpdateSchema);
  if (isValidationError(parsed)) return parsed;

  const rule = await prisma.automationRule.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.trigger !== undefined ? { trigger: parsed.trigger } : {}),
      ...(parsed.condition !== undefined ? { conditionJson: parsed.condition as never } : {}),
      ...(parsed.runnerId !== undefined ? { runnerId: parsed.runnerId } : {}),
      ...(parsed.command !== undefined ? { command: parsed.command } : {}),
      ...(parsed.enabled !== undefined ? { enabled: parsed.enabled } : {}),
    },
  });
  return NextResponse.json({ ok: true, rule });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const owned = await prisma.automationRule.findFirst({ where: { id, userId: auth.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  await prisma.automationRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
