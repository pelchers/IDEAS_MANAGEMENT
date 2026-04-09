import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Parse JSON request body and validate with a Zod schema.
 * Returns the validated data or a NextResponse error (400 invalid_json / 400 validation_failed).
 *
 * Usage:
 *   const parsed = await validateBody(req, MySchema);
 *   if (parsed instanceof NextResponse) return parsed;
 *   // use parsed.data
 */
export async function validateBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T> | NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_failed",
        message: "Request body did not match the expected schema.",
        details: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
      { status: 400 },
    );
  }

  return result.data;
}

/**
 * Validate URL search params with a Zod schema.
 */
export function validateQuery<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): z.infer<T> | NextResponse {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_failed",
        details: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400 },
    );
  }

  return result.data;
}

/**
 * Type guard to check if a value is a NextResponse (error from validation helpers).
 */
export function isValidationError(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
