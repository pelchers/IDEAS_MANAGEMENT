import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const requestId = crypto.randomUUID();

  // Minimal request correlation hook for future structured logging.
  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

