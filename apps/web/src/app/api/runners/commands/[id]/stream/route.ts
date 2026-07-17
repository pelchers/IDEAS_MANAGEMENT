import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/runners/commands/:id/stream — SSE live output for a command.
 * Polls the command row and pushes new output chunks + status; closes when the
 * command reaches a terminal status.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;

  const initial = await prisma.runnerCommand.findFirst({ where: { id, userId: auth.id }, select: { id: true } });
  if (!initial) return new Response("not found", { status: 404 });

  const encoder = new TextEncoder();
  let sentLen = 0;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const tick = async () => {
        if (closed) return;
        const cmd = await prisma.runnerCommand.findFirst({
          where: { id, userId: auth.id },
          select: { output: true, status: true, exitCode: true },
        });
        if (!cmd) {
          send("error", { error: "gone" });
          finish();
          return;
        }
        if (cmd.output.length > sentLen) {
          send("output", { chunk: cmd.output.slice(sentLen) });
          sentLen = cmd.output.length;
        }
        if (cmd.status === "DONE" || cmd.status === "FAILED" || cmd.status === "CANCELED") {
          send("done", { status: cmd.status, exitCode: cmd.exitCode });
          finish();
          return;
        }
        timer = setTimeout(tick, 700);
      };

      let timer: ReturnType<typeof setTimeout> | null = null;
      const finish = () => {
        if (closed) return;
        closed = true;
        if (timer) clearTimeout(timer);
        try { controller.close(); } catch { /* already closed */ }
      };

      req.signal.addEventListener("abort", finish);
      send("open", { id });
      void tick();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
