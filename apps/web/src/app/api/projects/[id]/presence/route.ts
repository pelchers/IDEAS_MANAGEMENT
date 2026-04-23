import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { checkProjectAccess } from "@/server/projects/helpers";
import { setPresence, removePresence, getPresence } from "@/server/projects/presence";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/presence
 * SSE stream of presence data. Sends current presence every 10s.
 * User is registered as present while connected.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401 });
  }
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return new Response(JSON.stringify({ ok: false, error: "forbidden" }), { status: 403 });
  }

  // Register presence
  setPresence(projectId, user.id, user.displayName, user.avatarUrl);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial presence
      const data = JSON.stringify(getPresence(projectId));
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // Heartbeat interval — refresh presence + send updates
      const interval = setInterval(() => {
        try {
          setPresence(projectId, user.id, user.displayName, user.avatarUrl);
          const current = JSON.stringify(getPresence(projectId));
          controller.enqueue(encoder.encode(`data: ${current}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 10_000);

      // Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        removePresence(projectId, user.id);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
