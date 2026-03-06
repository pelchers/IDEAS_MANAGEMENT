# Runbook: Billing Webhook Failure

## Symptoms
- Users upgrade to PRO/TEAM but features remain locked
- Entitlements not updating after subscription changes
- Stripe dashboard shows failed webhook deliveries
- `BillingEvent` table not receiving new records

## Diagnosis Steps

1. **Check Stripe Dashboard:**
   - Navigate to Developers > Webhooks
   - Look for failed events (red status indicators)
   - Note the error codes and response status

2. **Verify webhook endpoint is reachable:**
   ```bash
   curl -X POST https://yourdomain.com/api/billing/webhook \
     -H "Content-Type: application/json" \
     -d '{}'
   # Should return 400 (missing signature), NOT 404 or 500
   ```

3. **Check recent billing events in DB:**
   ```sql
   SELECT "stripeEventId", "eventType", "processedAt", "createdAt"
   FROM "BillingEvent"
   ORDER BY "createdAt" DESC
   LIMIT 10;
   ```

4. **Check environment variables:**
   - `STRIPE_SECRET_KEY` is set
   - `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint in Stripe dashboard
   - `STRIPE_PRICE_PRO` and `STRIPE_PRICE_TEAM` match Stripe price IDs

## Resolution Steps

1. **Webhook secret mismatch:**
   - Get the correct signing secret from Stripe Dashboard > Developers > Webhooks > [endpoint] > Signing secret
   - Update `STRIPE_WEBHOOK_SECRET` in environment
   - Redeploy the application

2. **Manual event replay:**
   - In Stripe Dashboard: Developers > Webhooks > [endpoint]
   - Click on the failed event
   - Click "Resend" to replay the event
   - Verify it processes successfully in application logs

3. **Manual entitlement fix:**
   If a user paid but entitlements were not synced:
   ```sql
   -- Find the user's subscription
   SELECT * FROM "Subscription" WHERE "userId" = '<user-id>';

   -- If subscription shows ACTIVE but entitlements missing:
   -- The application will need to call syncEntitlementsForPlan()
   -- Trigger by replaying the webhook event from Stripe dashboard
   ```

4. **Verify webhook signature configuration:**
   - The webhook route verifies signatures using `stripe.webhooks.constructEvent()`
   - Invalid signatures return HTTP 400
   - Ensure the raw body is not modified by middleware before signature verification

## Verify Idempotency

The system uses `stripeEventId` as a unique key in `BillingEvent` table. Duplicate events are safely rejected (P2002 unique constraint). Replaying events from Stripe is safe.
