import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { stripe, STRIPE_PRICES } from "@/server/billing/stripe";
import { prisma } from "@/server/db";
import { z } from "zod";

const CheckoutSchema = z.object({
  plan: z.enum(["PRO", "TEAM"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout session for the authenticated user.
 * Returns { ok: true, url: string } with the checkout URL.
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

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { plan, successUrl, cancelUrl } = parsed.data;

  // Get price ID for the plan
  const priceId = STRIPE_PRICES[plan];
  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: "price_not_configured" },
      { status: 500 }
    );
  }

  // Check if user already has a Stripe customer ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const customerOptions: Record<string, unknown> = {};
  if (existingSubscription?.stripeCustomerId) {
    customerOptions.customer = existingSubscription.stripeCustomerId;
  } else {
    customerOptions.customer_email = user.email;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...customerOptions,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json(
      { ok: false, error: "stripe_error" },
      { status: 500 }
    );
  }
}
