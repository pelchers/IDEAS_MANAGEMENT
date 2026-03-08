import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { stripe } from "@/server/billing/stripe";
import { prisma } from "@/server/db";
import { z } from "zod";

const PortalSchema = z.object({
  returnUrl: z.string().url(),
});

/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session for the authenticated user.
 * Returns { ok: true, url: string } with the portal URL.
 */
export async function POST(req: Request) {
  // Pre-flight: check if Stripe is configured
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_..." || stripeKey.length < 20) {
    return NextResponse.json(
      { ok: false, error: "billing_not_configured", message: "Stripe is not configured. Set STRIPE_SECRET_KEY in environment." },
      { status: 503 }
    );
  }

  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;

  const user = authResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const parsed = PortalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { returnUrl } = parsed.data;

  // Find the user's Stripe customer ID
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { ok: false, error: "no_subscription" },
      { status: 404 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Stripe portal session creation failed:", err);
    return NextResponse.json(
      { ok: false, error: "stripe_error" },
      { status: 500 }
    );
  }
}
