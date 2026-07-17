import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { validateBody, isValidationError } from "@/server/api-validation";
import { dispatchCommand } from "@/server/runners/runners";

type RouteParams = { params: Promise<{ id: string }> };

const DispatchSchema = z.object({
  command: z.string().min(1).max(8000),
  cwd: z.string().max(1000).nullish(),
  taskId: z.string().nullish(),
  source: z.string().max(40).optional(),
});

/** POST /api/runners/:id/dispatch — queue a command for the runner. */
export async function POST(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const parsed = await validateBody(req, DispatchSchema);
  if (isValidationError(parsed)) return parsed;

  const cmd = await dispatchCommand(auth.id, { runnerId: id, ...parsed });
  if (!cmd) return NextResponse.json({ ok: false, error: "runner_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, command: cmd }, { status: 201 });
}
