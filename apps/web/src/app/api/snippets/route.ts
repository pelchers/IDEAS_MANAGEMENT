import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { prisma } from "@/server/db";

/** GET /api/snippets — the caller's saved command snippets. */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const snippets = await prisma.commandSnippet.findMany({ where: { userId: auth.id }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ ok: true, snippets });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  command: z.string().min(1).max(8000),
  description: z.string().max(1000).optional(),
});

/** POST /api/snippets — create a snippet. */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const parsed = await validateBody(req, CreateSchema);
  if (isValidationError(parsed)) return parsed;
  const snippet = await prisma.commandSnippet.create({
    data: { userId: auth.id, name: parsed.name, command: parsed.command, description: parsed.description || null },
  });
  return NextResponse.json({ ok: true, snippet }, { status: 201 });
}
