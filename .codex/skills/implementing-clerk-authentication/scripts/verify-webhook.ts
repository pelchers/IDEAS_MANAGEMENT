#!/usr/bin/env tsx

/**
 * Test Clerk webhook signature verification locally
 * Usage: tsx verify-webhook.ts
 */

import { Webhook } from 'svix';

// Example webhook payload from Clerk
const payload = {
  data: {
    id: 'user_2abc123',
    email_addresses: [{ email_address: 'test@example.com' }],
    first_name: 'Test',
    last_name: 'User',
  },
  object: 'event',
  type: 'user.created',
};

// Your webhook secret from Clerk Dashboard
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || 'whsec_test';

// Example headers from Clerk
const svixHeaders = {
  'svix-id': 'msg_test123',
  'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
  'svix-signature': '', // Will be generated
};

try {
  const wh = new Webhook(WEBHOOK_SECRET);
  const body = JSON.stringify(payload);

  // In real webhook, verify like this:
  const verified = wh.verify(body, svixHeaders);

  console.log('✓ Webhook verified successfully');
  console.log('Event type:', verified.type);
  console.log('User ID:', verified.data.id);
} catch (err) {
  console.error('✗ Webhook verification failed:', err);
  process.exit(1);
}

