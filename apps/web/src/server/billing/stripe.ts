import Stripe from "stripe";

/**
 * Stripe client singleton.
 * Reads STRIPE_SECRET_KEY from environment.
 * Throws at import time if the key is missing in production.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Lazy initialization: don't throw at module evaluation during `next build`.
// The error will surface at runtime when stripe is actually used without a key.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!stripeSecretKey) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("STRIPE_SECRET_KEY is required in production");
      }
      // Use placeholder in development / build
      _stripe = new Stripe("sk_test_placeholder");
    } else {
      _stripe = new Stripe(stripeSecretKey);
    }
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Stripe price IDs from environment.
 */
export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRICE_PRO ?? "",
  TEAM: process.env.STRIPE_PRICE_TEAM ?? "",
} as const;

/**
 * Stripe webhook secret for signature verification.
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
