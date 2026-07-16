import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { getProvider } from "@/server/integrations/registry";
import { getIntegration, readConfig, upsertIntegration } from "@/server/integrations/store";
import { sendTodayDigest } from "@/server/integrations/providers/email";
import { gmailListRecent, gmailSend } from "@/server/integrations/providers/gmail";
import { calendarUpsertEventForTask } from "@/server/integrations/providers/google-calendar";

type RouteParams = { params: Promise<{ provider: string }> };

/**
 * POST /api/integrations/:provider/action  { action, params? }
 * Dispatches provider actions. OAuth providers use the caller's stored (encrypted)
 * config and persist any rotated token back.
 */
export async function POST(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { provider: providerId } = await params;

  const provider = getProvider(providerId);
  if (!provider) return NextResponse.json({ ok: false, error: "unknown_provider" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; params?: Record<string, unknown> };
  const action = body.action ?? "";
  const p = body.params ?? {};

  // EMAIL — send the Today digest to the user.
  if (provider.id === "EMAIL" && action === "digest") {
    const result = await sendTodayDigest(auth.id, new Date());
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: result.reason === "not_configured" ? 400 : 502 });
    }
    return NextResponse.json({ ok: true, counts: result.counts });
  }

  // OAuth providers require an active connection with stored config.
  const row = await getIntegration(auth.id, provider.id);
  if (!row || row.status !== "CONNECTED") {
    return NextResponse.json({ ok: false, error: "not_connected" }, { status: 400 });
  }
  const config = readConfig(row.configEncrypted);

  try {
    if (provider.id === "GMAIL" && action === "list") {
      const { messages, config: next } = await gmailListRecent(config, Number(p.max ?? 10));
      await persistConfig(auth.id, "GMAIL", next, config);
      return NextResponse.json({ ok: true, messages });
    }
    if (provider.id === "GMAIL" && action === "send") {
      const { ok, config: next } = await gmailSend(config, {
        to: String(p.to ?? ""),
        subject: String(p.subject ?? ""),
        body: String(p.body ?? ""),
      });
      await persistConfig(auth.id, "GMAIL", next, config);
      return NextResponse.json({ ok });
    }
    if (provider.id === "GOOGLE_CALENDAR" && action === "sync-task") {
      const taskId = String(p.taskId ?? "");
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task || task.createdById !== auth.id || !task.dueDate) {
        return NextResponse.json({ ok: false, error: "task_not_syncable" }, { status: 400 });
      }
      const existing = (task.externalRefs as { calendarEventId?: string } | null)?.calendarEventId ?? null;
      const { ok, eventId, config: next } = await calendarUpsertEventForTask(config, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate.toISOString(),
        eventId: existing,
      });
      await persistConfig(auth.id, "GOOGLE_CALENDAR", next, config);
      if (ok && eventId) {
        await prisma.task.update({
          where: { id: taskId },
          data: { externalRefs: { ...(task.externalRefs as object ?? {}), calendarEventId: eventId } },
        });
      }
      return NextResponse.json({ ok, eventId });
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: "action_failed", detail: String(err) }, { status: 502 });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}

/** Persist a rotated OAuth config only when it actually changed. */
async function persistConfig(
  userId: string,
  provider: "GMAIL" | "GOOGLE_CALENDAR",
  next: Record<string, unknown>,
  prev: Record<string, unknown>
) {
  if (JSON.stringify(next) !== JSON.stringify(prev)) {
    await upsertIntegration({ userId, provider, config: next, status: "CONNECTED" });
  }
}
