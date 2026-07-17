import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { deleteRunner } from "@/server/runners/runners";

type RouteParams = { params: Promise<{ id: string }> };

/** DELETE /api/runners/:id — remove a runner (and its command history). */
export async function DELETE(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const ok = await deleteRunner(auth.id, id);
  if (!ok) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
