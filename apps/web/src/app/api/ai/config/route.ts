import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { encrypt, decrypt } from "@/server/ai/crypto";
import { auditLog } from "@/server/audit";

/**
 * GET /api/ai/config
 * Returns the user's current AI configuration (provider, masked key).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      aiProvider: true,
      aiApiKeyEncrypted: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  // Mask the key for display (show last 6 chars)
  let maskedKey: string | null = null;
  if (dbUser.aiApiKeyEncrypted) {
    try {
      const key = decrypt(dbUser.aiApiKeyEncrypted);
      maskedKey = key.length > 6
        ? "•".repeat(key.length - 6) + key.slice(-6)
        : "•".repeat(key.length);
    } catch {
      maskedKey = null;
    }
  }

  return NextResponse.json({
    ok: true,
    provider: dbUser.aiProvider,
    maskedKey,
  });
}

/**
 * PUT /api/ai/config
 * Save a BYOK API key for OpenRouter (or any compatible provider).
 */
export async function PUT(req: Request) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;

  let body: { apiKey?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Handle disconnect action
  if (body.action === "disconnect") {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiProvider: "NONE",
        aiApiKeyEncrypted: null,
        openrouterRefreshToken: null,
      },
    });

    await auditLog({
      actorUserId: user.id,
      action: "ai.disconnected",
      targetType: "User",
      targetId: user.id,
    });

    return NextResponse.json({ ok: true, provider: "NONE" });
  }

  // Save BYOK key
  if (!body.apiKey || typeof body.apiKey !== "string" || body.apiKey.trim().length < 10) {
    return NextResponse.json(
      { ok: false, error: "invalid_api_key", message: "API key must be at least 10 characters." },
      { status: 400 }
    );
  }

  const encryptedKey = encrypt(body.apiKey.trim());

  await prisma.user.update({
    where: { id: user.id },
    data: {
      aiProvider: "OPENROUTER_BYOK",
      aiApiKeyEncrypted: encryptedKey,
      openrouterRefreshToken: null,
    },
  });

  await auditLog({
    actorUserId: user.id,
    action: "ai.byok_configured",
    targetType: "User",
    targetId: user.id,
  });

  return NextResponse.json({ ok: true, provider: "OPENROUTER_BYOK" });
}
