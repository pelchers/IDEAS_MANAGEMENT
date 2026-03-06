import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    status: "healthy",
    service: "idea-management-web",
    version: process.env.npm_package_version ?? "0.1.0",
    timestamp: new Date().toISOString()
  });
}

