import { NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/server/billing/stripe";
import { processWebhookEvent } from "@/server/billing/webhook-handler";

/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events.
 * Verifies the signature using the raw body, then processes the event.
 */
export async function POST(req: Request) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { ok: false, error: "webhook_not_configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "missing_signature" },
      { status: 400 }
    );
  }

  // Read the raw body for signature verification
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  // Verify the webhook signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 400 }
    );
  }

  // Process the event
  try {
    const processed = await processWebhookEvent(event);
    return NextResponse.json({
      ok: true,
      processed,
      eventId: event.id,
    });
  } catch (err) {
    console.error("Webhook event processing failed:", err);
    return NextResponse.json(
      { ok: false, error: "processing_error" },
      { status: 500 }
    );
  }
}
