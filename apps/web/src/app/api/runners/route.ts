import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { createRunner, listRunners } from "@/server/runners/runners";

/** GET /api/runners — the caller's runners (with live online status). */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const runners = await listRunners(auth.id);
  return NextResponse.json({ ok: true, runners });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  workingDir: z.string().max(1000).optional(),
});

/** POST /api/runners — create a runner; returns the one-time token. */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const parsed = await validateBody(req, CreateSchema);
  if (isValidationError(parsed)) return parsed;

  const { runner, token } = await createRunner(auth.id, parsed.name, parsed.workingDir);
  return NextResponse.json({ ok: true, runner: { id: runner.id, name: runner.name }, token }, { status: 201 });
}
