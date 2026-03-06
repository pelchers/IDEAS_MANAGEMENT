import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

/**
 * Unit tests for the webhook handler.
 * Uses mocked Prisma client and mocked entitlement functions.
 */

// Mock prisma
vi.mock("../db", () => ({
  prisma: {
    billingEvent: {
      create: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock entitlements
vi.mock("./entitlements", () => ({
  syncEntitlementsForPlan: vi.fn(),
  revokeSubscriptionEntitlements: vi.fn(),
}));

import { prisma } from "../db";
import { processWebhookEvent } from "./webhook-handler";
import {
  syncEntitlementsForPlan,
  revokeSubscriptionEntitlements,
} from "./entitlements";

const mockPrisma = prisma as unknown as {
  billingEvent: {
    create: ReturnType<typeof vi.fn>;
  };
  subscription: {
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

function makeStripeEvent(
  type: string,
  object: unknown,
  id = "evt_test_123"
): Stripe.Event {
  return {
    id,
    type,
    object: "event",
    api_version: "2025-04-30.basil",
    created: Math.floor(Date.now() / 1000),
    data: { object },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

describe("processWebhookEvent", () => {
  describe("idempotency", () => {
    it("returns false for duplicate events", async () => {
      // Simulate unique constraint violation (P2002)
      mockPrisma.billingEvent.create.mockRejectedValue({
        code: "P2002",
      });

      const event = makeStripeEvent("checkout.session.completed", {});
      const result = await processWebhookEvent(event);
      expect(result).toBe(false);
    });

    it("processes new events and logs them", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      // For unhandled event types, just logging is enough
      const event = makeStripeEvent("some.unknown.event", {});
      const result = await processWebhookEvent(event);
      expect(result).toBe(true);
      expect(mockPrisma.billingEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stripeEventId: "evt_test_123",
            eventType: "some.unknown.event",
          }),
        })
      );
    });
  });

  describe("checkout.session.completed", () => {
    it("creates subscription and syncs entitlements", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
      mockPrisma.subscription.upsert.mockResolvedValue({});

      const session = {
        customer: "cus_123",
        subscription: "sub_456",
        metadata: { userId: "user-1", plan: "PRO" },
      };

      const event = makeStripeEvent(
        "checkout.session.completed",
        session,
        "evt_checkout_1"
      );
      const result = await processWebhookEvent(event);

      expect(result).toBe(true);
      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: "sub_456" },
          create: expect.objectContaining({
            userId: "user-1",
            stripeCustomerId: "cus_123",
            stripeSubscriptionId: "sub_456",
            status: "ACTIVE",
            plan: "PRO",
          }),
        })
      );
      expect(syncEntitlementsForPlan).toHaveBeenCalledWith("user-1", "PRO");
    });

    it("handles missing userId in metadata gracefully", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});

      const session = {
        customer: "cus_123",
        subscription: "sub_456",
        metadata: {}, // no userId
      };

      const event = makeStripeEvent("checkout.session.completed", session);
      const result = await processWebhookEvent(event);

      // Event was logged but subscription not created
      expect(result).toBe(true);
      expect(mockPrisma.subscription.upsert).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.updated", () => {
    it("updates subscription status and syncs entitlements for ACTIVE", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: "sub-db-1",
        userId: "user-1",
        stripeSubscriptionId: "sub_456",
      });
      mockPrisma.subscription.update.mockResolvedValue({});

      const subscription = {
        id: "sub_456",
        customer: "cus_123",
        status: "active",
        cancel_at_period_end: false,
        items: {
          data: [{
            price: { id: "price_pro_123" },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          }],
        },
      };

      // Set the env var for price matching
      const originalEnv = process.env.STRIPE_PRICE_PRO;
      process.env.STRIPE_PRICE_PRO = "price_pro_123";

      const event = makeStripeEvent(
        "customer.subscription.updated",
        subscription,
        "evt_sub_upd_1"
      );
      const result = await processWebhookEvent(event);

      expect(result).toBe(true);
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: "sub_456" },
          data: expect.objectContaining({
            status: "ACTIVE",
            plan: "PRO",
          }),
        })
      );
      expect(syncEntitlementsForPlan).toHaveBeenCalledWith("user-1", "PRO");

      process.env.STRIPE_PRICE_PRO = originalEnv;
    });

    it("revokes entitlements when subscription is canceled", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: "sub-db-1",
        userId: "user-1",
        stripeSubscriptionId: "sub_456",
      });
      mockPrisma.subscription.update.mockResolvedValue({});

      const subscription = {
        id: "sub_456",
        customer: "cus_123",
        status: "canceled",
        cancel_at_period_end: false,
        items: {
          data: [{
            price: { id: "price_pro_123" },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000),
          }],
        },
      };

      const event = makeStripeEvent(
        "customer.subscription.updated",
        subscription,
        "evt_sub_cancel_1"
      );
      const result = await processWebhookEvent(event);

      expect(result).toBe(true);
      expect(revokeSubscriptionEntitlements).toHaveBeenCalledWith("user-1");
    });
  });

  describe("customer.subscription.deleted", () => {
    it("marks subscription as canceled and revokes entitlements", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: "sub-db-1",
        userId: "user-1",
        stripeSubscriptionId: "sub_789",
      });
      mockPrisma.subscription.update.mockResolvedValue({});

      const subscription = {
        id: "sub_789",
        customer: "cus_123",
      };

      const event = makeStripeEvent(
        "customer.subscription.deleted",
        subscription,
        "evt_sub_del_1"
      );
      const result = await processWebhookEvent(event);

      expect(result).toBe(true);
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_789" },
        data: { status: "CANCELED" },
      });
      expect(revokeSubscriptionEntitlements).toHaveBeenCalledWith("user-1");
    });

    it("handles missing subscription gracefully", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const subscription = {
        id: "sub_unknown",
        customer: "cus_123",
      };

      const event = makeStripeEvent(
        "customer.subscription.deleted",
        subscription,
        "evt_sub_del_2"
      );
      const result = await processWebhookEvent(event);

      expect(result).toBe(true);
      expect(mockPrisma.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe("invoice.payment_failed", () => {
    it("updates subscription status to PAST_DUE", async () => {
      mockPrisma.billingEvent.create.mockResolvedValue({});
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: "sub-db-1",
        userId: "user-1",
        stripeSubscriptionId: "sub_456",
      });
      mockPrisma.subscription.update.mockResolvedValue({});

      const invoice = {
        customer: "cus_123",
        parent: {
          subscription_details: {
            subscription: "sub_456",
          },
        },
      };

      const event = makeStripeEvent(
        "invoice.payment_failed",
        invoice,
        "evt_inv_fail_1"
      );
      const result = await processWebhookEvent(event);

      expect(result).toBe(true);
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_456" },
        data: { status: "PAST_DUE" },
      });
    });
  });
});
