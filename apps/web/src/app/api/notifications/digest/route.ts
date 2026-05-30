import { NextResponse } from "next/server";
import { runDigestCycle } from "@/server/notifications/digest";

/**
 * POST /api/notifications/digest?frequency=DAILY|WEEKLY
 * Cron-triggered digest send. Protected by CRON_SECRET bearer token.
 * Email sending is currently stubbed (logged) — wire a provider when keys exist.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const frequency = (url.searchParams.get("frequency") || "DAILY").toUpperCase();
  if (frequency !== "DAILY" && frequency !== "WEEKLY") {
    return NextResponse.json({ ok: false, error: "invalid_frequency" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const sent = await runDigestCycle(frequency, baseUrl);

  return NextResponse.json({ ok: true, frequency, sentCount: sent.length, recipients: sent });
}
