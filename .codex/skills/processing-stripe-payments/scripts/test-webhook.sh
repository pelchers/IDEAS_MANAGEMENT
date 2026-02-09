#!/bin/bash

# Test Stripe webhook locally
# Usage: ./test-webhook.sh

echo "Starting Stripe webhook testing..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "Error: Stripe CLI not found. Install with: brew install stripe/stripe-cli/stripe"
    exit 1
fi

# Forward webhooks to local server
echo "Forwarding webhooks to http://localhost:3000/api/webhooks/stripe"
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events:
# stripe trigger checkout.session.completed
# stripe trigger customer.subscription.created
# stripe trigger invoice.payment_succeeded

