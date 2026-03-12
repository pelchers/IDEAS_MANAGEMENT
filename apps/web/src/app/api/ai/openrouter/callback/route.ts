import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { encrypt } from "@/server/ai/crypto";
import { auditLog } from "@/server/audit";
import { readSessionCookie } from "@/server/auth/cookies";
import { validateSession } from "@/server/auth/session";

/**
 * GET /api/ai/openrouter/callback
 * OAuth PKCE callback from OpenRouter.
 * Exchanges authorization code for access token and stores it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    const errorDesc = url.searchParams.get("error_description") || "Unknown error";
    return NextResponse.redirect(
      new URL(`/settings?ai_error=${encodeURIComponent(errorDesc)}`, url.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?ai_error=missing_code", url.origin)
    );
  }

  // Validate the user's session
  const sessionToken = readSessionCookie(req);
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/signin", url.origin));
  }

  const session = await validateSession(sessionToken);
  if (!session) {
    return NextResponse.redirect(new URL("/signin", url.origin));
  }

  // Exchange authorization code for access token
  const clientId = process.env.OPENROUTER_CLIENT_ID;
  const clientSecret = process.env.OPENROUTER_CLIENT_SECRET;

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/settings?ai_error=openrouter_not_configured", url.origin)
    );
  }

  try {
    const tokenResponse = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("[OpenRouter OAuth] Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/settings?ai_error=token_exchange_failed", url.origin)
      );
    }

    const tokenData = await tokenResponse.json();
    const apiKey = tokenData.key;

    if (!apiKey) {
      return NextResponse.redirect(
        new URL("/settings?ai_error=no_key_returned", url.origin)
      );
    }

    // Encrypt and store the API key
    const encryptedKey = encrypt(apiKey);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        aiProvider: "OPENROUTER_OAUTH",
        aiApiKeyEncrypted: encryptedKey,
      },
    });

    await auditLog({
      actorUserId: session.userId,
      action: "ai.openrouter_connected",
      targetType: "User",
      targetId: session.userId,
    });

    return NextResponse.redirect(
      new URL("/settings?ai_connected=true", url.origin)
    );
  } catch (err) {
    console.error("[OpenRouter OAuth] Error:", err);
    return NextResponse.redirect(
      new URL("/settings?ai_error=connection_failed", url.origin)
    );
  }
}
