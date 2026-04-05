import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { getUserEntitlements } from "@/server/billing/entitlements";
import { getOrCreatePeriod } from "@/server/ai/token-tracking";

const TOKEN_PACKS = {
  small: { tokens: 5_000_000, price: 250, label: "5M tokens (~2,000 msgs)" },
  medium: { tokens: 10_000_000, price: 500, label: "10M tokens (~4,000 msgs)" },
  large: { tokens: 25_000_000, price: 1200, label: "25M tokens (~10,000 msgs)" },
} as const;

type PackSize = keyof typeof TOKEN_PACKS;

/**
 * POST /api/billing/token-pack
 * Purchase a token pack. Pro/Team subscribers only.
 * When Stripe is configured: creates checkout session.
 * When Stripe not configured: credits immediately (dev mode).
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { packSize: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const packSize = body.packSize as PackSize;
  if (!TOKEN_PACKS[packSize]) {
    return NextResponse.json({ ok: false, error: "Invalid pack size. Use: small, medium, large" }, { status: 400 });
  }

  // Only Pro/Team can buy packs
  const entitlements = await getUserEntitlements(user.id, user.role);
  if (entitlements.plan === "FREE" && user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Token packs require a Pro or Team subscription." },
      { status: 403 },
    );
  }

  const pack = TOKEN_PACKS[packSize];

  // Check if Stripe is configured
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_...") {
    // TODO: Create Stripe checkout session for one-time payment
    // For now, return the pack info so the UI can show it
    return NextResponse.json({
      ok: false,
      error: "stripe_not_ready",
      message: "Stripe checkout for token packs is not yet configured. Pack will be credited in dev mode.",
      pack: { size: packSize, ...pack },
    }, { status: 501 });
  }

  // Dev mode: credit immediately without Stripe
  const period = await getOrCreatePeriod(user.id);
  await prisma.aiTokenUsage.update({
    where: { id: period.id },
    data: { tokenPackBalance: { increment: pack.tokens } },
  });

  return NextResponse.json({
    ok: true,
    credited: pack.tokens,
    packSize,
    newBalance: period.tokenPackBalance + pack.tokens,
    message: `${pack.label} credited to your account.`,
  });
}

/**
 * GET /api/billing/token-pack
 * Returns available token packs and current balance.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const period = await getOrCreatePeriod(user.id);
  const entitlements = await getUserEntitlements(user.id, user.role);

  return NextResponse.json({
    ok: true,
    packs: Object.entries(TOKEN_PACKS).map(([size, pack]) => ({
      size,
      tokens: pack.tokens,
      priceInCents: pack.price,
      priceDisplay: `$${(pack.price / 100).toFixed(2)}`,
      label: pack.label,
    })),
    currentBalance: period.tokenPackBalance,
    canPurchase: entitlements.plan !== "FREE" || user.role === "ADMIN",
  });
}
