import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "idea-management-web",
    timestamp: new Date().toISOString()
  });
}

