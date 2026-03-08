import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  let database: "connected" | "disconnected" = "disconnected";
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    database = "connected";
  } catch (err) {
    console.error("[Health] Database connectivity check failed:", err instanceof Error ? err.message : err);
  }

  const status = database === "connected" ? "ok" : "degraded";
  const httpStatus = database === "connected" ? 200 : 503;

  return NextResponse.json(
    {
      ok: database === "connected",
      status,
      database,
      service: "idea-management-web",
      version: process.env.npm_package_version ?? "0.1.0",
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus }
  );
}

