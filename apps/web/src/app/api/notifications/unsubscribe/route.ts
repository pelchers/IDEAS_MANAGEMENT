import { prisma } from "@/server/db";

/**
 * GET /api/notifications/unsubscribe?token=...
 * One-click unsubscribe from digest emails. Sets emailDigestFrequency to OFF.
 * Returns a simple HTML confirmation (linked from emails).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim() || "";

  if (!token) {
    return htmlResponse("Invalid unsubscribe link.", 400);
  }

  const user = await prisma.user.findFirst({ where: { unsubscribeToken: token }, select: { id: true } });
  if (!user) {
    return htmlResponse("This unsubscribe link is no longer valid.", 404);
  }

  await prisma.user.update({ where: { id: user.id }, data: { emailDigestFrequency: "OFF" } });

  return htmlResponse("You have been unsubscribed from digest emails. You can re-enable them anytime in Settings.", 200);
}

function htmlResponse(message: string, status: number) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribe</title></head>
     <body style="font-family:monospace;max-width:600px;margin:48px auto;padding:24px;border:3px solid #282828">
       <h1 style="text-transform:uppercase">Digest Emails</h1>
       <p>${message}</p>
     </body></html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}
