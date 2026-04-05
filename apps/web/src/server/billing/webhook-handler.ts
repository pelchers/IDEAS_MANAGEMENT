import type Stripe from "stripe";
import { prisma } from "../db";
import {
  syncEntitlementsForPlan,
  revokeSubscriptionEntitlements,
} from "./entitlements";
import type { SubscriptionPlan, SubscriptionStatus, Prisma } from "@/generated/prisma";

/**
 * Map Stripe subscription status strings to our enum values.
 */
function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "trialing":
      return "TRIALING";
    case "unpaid":
      return "UNPAID";
    default:
      return "CANCELED";
  }
}

/**
 * Determine the plan from the Stripe price ID.
 */
function planFromPriceId(priceId: string): SubscriptionPlan {
  const proPriceId = process.env.STRIPE_PRICE_PRO ?? "";
  const teamPriceId = process.env.STRIPE_PRICE_TEAM ?? "";

  if (priceId === teamPriceId) return "TEAM";
  if (priceId === proPriceId) return "PRO";
  return "FREE";
}

/**
 * Extract the customer ID string from a Stripe object's customer field.
 */
function extractCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  return customer.id;
}

/**
 * Log a Stripe event to the BillingEvent table for auditing.
 * Returns false if the event was already processed (idempotency check).
 */
async function logBillingEvent(event: Stripe.Event): Promise<boolean> {
  try {
    const obj = event.data.object;
    const objRecord = obj as unknown as Record<string, unknown>;
    const customerRaw =
      typeof obj === "object" && obj !== null && "customer" in objRecord
        ? objRecord.customer
        : null;
    const stripeCustomerId =
      typeof customerRaw === "string"
        ? customerRaw
        : customerRaw && typeof customerRaw === "object" && "id" in (customerRaw as Record<string, unknown>)
          ? String((customerRaw as Record<string, unknown>).id)
          : null;

    await prisma.billingEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        stripeCustomerId,
        data: JSON.parse(JSON.stringify(event.data)) as Prisma.InputJsonValue,
        processedAt: new Date(),
      },
    });
    return true;
  } catch (err: unknown) {
    // Unique constraint violation = already processed
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return false;
    }
    throw err;
  }
}

/**
 * Find user by Stripe customer ID.
 * Looks up the subscription table to find the associated user.
 */
async function findUserByStripeCustomer(
  customerId: string
): Promise<string | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return subscription?.userId ?? null;
}

/**
 * Handle checkout.session.completed event.
 * Creates a new subscription record and syncs entitlements.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const customerId = extractCustomerId(session.customer);
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) {
    console.error(
      "checkout.session.completed missing customer or subscription ID"
    );
    return;
  }

  // The userId is stored in metadata during checkout session creation
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("checkout.session.completed missing userId in metadata");
    return;
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`checkout.session.completed: user ${userId} not found`);
    return;
  }

  // Determine plan from the line items (stored in metadata for simplicity)
  const plan = (session.metadata?.plan as SubscriptionPlan) ?? "PRO";

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscriptionId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: "ACTIVE",
      plan,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000 // ~30 days, will be corrected by subscription.updated
      ),
      cancelAtPeriodEnd: false,
    },
    update: {
      status: "ACTIVE",
      plan,
      stripeCustomerId: customerId,
    },
  });

  // Sync entitlements
  await syncEntitlementsForPlan(userId, plan);
}

/**
 * Handle customer.subscription.updated event.
 * Updates subscription status, period, and entitlements.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const subscriptionId = subscription.id;
  const customerId = extractCustomerId(subscription.customer);

  if (!customerId) {
    console.error(
      `subscription.updated: missing customer for ${subscriptionId}`
    );
    return;
  }

  // Find existing subscription record
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existing) {
    // Subscription not in our DB yet -- may come before checkout.session.completed
    // Try to find user by customer ID
    const userId = await findUserByStripeCustomer(customerId);
    if (!userId) {
      console.error(
        `subscription.updated: no subscription or user found for ${subscriptionId}`
      );
      return;
    }
  }

  const status = mapStripeStatus(subscription.status);
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id ?? "";
  const plan = planFromPriceId(priceId);

  // Get period from the first subscription item (SDK v20+ moved these fields)
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000)
    : new Date();
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Update subscription
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status,
      plan,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Sync entitlements based on new status
  const userId = existing?.userId;
  if (userId) {
    if (status === "ACTIVE" || status === "TRIALING") {
      await syncEntitlementsForPlan(userId, plan);
    } else if (status === "CANCELED") {
      await revokeSubscriptionEntitlements(userId);
    }
    // PAST_DUE and UNPAID: keep entitlements for now (grace period)
  }
}

/**
 * Handle customer.subscription.deleted event.
 * Marks subscription as canceled and revokes entitlements.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const subscriptionId = subscription.id;

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existing) {
    console.error(
      `subscription.deleted: no subscription found for ${subscriptionId}`
    );
    return;
  }

  // Mark as canceled
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "CANCELED" },
  });

  // Revoke subscription-sourced entitlements
  await revokeSubscriptionEntitlements(existing.userId);
}

/**
 * Handle invoice.payment_failed event.
 * Updates subscription status to PAST_DUE.
 *
 * In Stripe API v2 (SDK v20+), the subscription ID is under
 * `invoice.parent.subscription_details.subscription` rather than
 * a top-level `subscription` field.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Extract subscription ID from the parent structure (SDK v20+)
  let subscriptionId: string | null = null;

  if (invoice.parent?.subscription_details?.subscription) {
    const sub = invoice.parent.subscription_details.subscription;
    subscriptionId = typeof sub === "string" ? sub : sub.id;
  }

  if (!subscriptionId) return;

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existing) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  });
}

/**
 * Process a verified Stripe webhook event.
 * Handles event deduplication, routing, and entitlement sync.
 *
 * @returns true if the event was processed, false if it was a duplicate.
 */
export async function processWebhookEvent(
  event: Stripe.Event
): Promise<boolean> {
  // Idempotency check -- log event first
  const isNew = await logBillingEvent(event);
  if (!isNew) {
    return false; // Already processed
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      );
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      );
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      // Unhandled event type -- logged but not processed
      break;
  }

  return true;
}
