import Stripe from "stripe";

/**
 * Stripe client singleton.
 * Reads STRIPE_SECRET_KEY from environment.
 * Throws at import time if the key is missing in production.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is required in production");
}

export const stripe = new Stripe(stripeSecretKey ?? "sk_test_placeholder");

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
