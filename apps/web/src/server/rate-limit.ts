/**
 * In-memory rate limiter with sliding window per IP/key.
 * For production, swap to Redis-backed (Upstash) for multi-instance consistency.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

// Periodic cleanup of expired buckets
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 min

function cleanup(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > windowMs * 2) buckets.delete(key);
  }
  lastCleanup = now;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // ms since epoch
  retryAfter: number; // seconds
}

/**
 * Check if a request is allowed under the rate limit.
 * @param key Unique identifier (IP, IP+route, user ID, etc.)
 * @param limit Maximum requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanup(now, windowMs);

  // Evict oldest if we hit the bucket cap
  if (buckets.size >= MAX_BUCKETS) {
    const firstKey = buckets.keys().next().value;
    if (firstKey) buckets.delete(firstKey);
  }

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    // New window
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs, retryAfter: 0 };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const resetAt = bucket.windowStart + windowMs;
  const retryAfter = Math.ceil((resetAt - now) / 1000);

  return {
    allowed: bucket.count <= limit,
    remaining,
    resetAt,
    retryAfter,
  };
}

/**
 * Extract client IP from a Next.js Request.
 * Checks X-Forwarded-For, X-Real-IP, then falls back to "unknown".
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Pre-configured rate limit presets.
 */
export const PRESETS = {
  // Strict: for auth attempts
  authStrict: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  // Moderate: for password reset requests
  passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  // Lenient: for general API
  apiGeneral: { limit: 60, windowMs: 60 * 1000 }, // 60 per minute
  // AI chat (per user)
  aiChat: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
};

/**
 * Build a standard 429 response.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "rate_limit_exceeded",
      message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    }
  );
}
