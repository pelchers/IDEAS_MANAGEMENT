import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { prisma } from "@/server/db";

type RouteParams = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  command: z.string().min(1).max(8000).optional(),
  description: z.string().max(1000).nullish(),
});

export async function PATCH(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const owned = await prisma.commandSnippet.findFirst({ where: { id, userId: auth.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const parsed = await validateBody(req, UpdateSchema);
  if (isValidationError(parsed)) return parsed;
  const snippet = await prisma.commandSnippet.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.command !== undefined ? { command: parsed.command } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description || null } : {}),
    },
  });
  return NextResponse.json({ ok: true, snippet });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const owned = await prisma.commandSnippet.findFirst({ where: { id, userId: auth.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  await prisma.commandSnippet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
