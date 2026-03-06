import { NextResponse } from "next/server";
import {
  requireAuth,
  isErrorResponse,
  type AuthenticatedUser,
} from "../auth/admin";
import { checkEntitlement, type Feature } from "./entitlements";

/**
 * Require that the authenticated user has an active entitlement for the given feature.
 * Returns the user if entitled, or a 401/403 error response.
 *
 * Usage in API routes:
 * ```ts
 * const result = await requireEntitlement(req, FEATURES.AI_CHAT);
 * if (isErrorResponse(result)) return result;
 * const user = result;
 * ```
 */
export async function requireEntitlement(
  req: Request,
  feature: Feature
): Promise<AuthenticatedUser | NextResponse> {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;

  const user = authResult;

  const hasAccess = await checkEntitlement(user.id, feature, user.role);
  if (!hasAccess) {
    return NextResponse.json(
      {
        ok: false,
        error: "entitlement_required",
        feature,
        message: `This feature requires an active subscription with the "${feature}" entitlement.`,
      },
      { status: 403 }
    );
  }

  return user;
}
