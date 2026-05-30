import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/server/auth/admin";
import { prisma } from "@/server/db";
import { checkProjectAccess } from "@/server/projects/helpers";
import { validateBody, isValidationError } from "@/server/api-validation";
import { logProjectActivity } from "@/server/projects/activity";
import { createNotification } from "@/server/notifications/service";
import { enforceUserRateLimit } from "@/server/rate-limit";

const CreateCommentSchema = z.object({
  targetType: z.string().min(1).max(50),
  targetId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/comments?targetType=...&targetId=...
 * List comments for a specific target within the project.
 */
export async function GET(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const targetType = url.searchParams.get("targetType") || "";
  const targetId = url.searchParams.get("targetId") || "";

  const where: Record<string, unknown> = { projectId };
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;

  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      targetType: true,
      targetId: true,
      content: true,
      mentions: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ ok: true, comments });
}

/**
 * POST /api/projects/[id]/comments
 * Add a comment to a target within the project.
 */
export async function POST(req: Request, { params }: RouteParams) {
  const authResult = await requireAuth(req);
  if (isErrorResponse(authResult)) return authResult;
  const user = authResult;
  const { id: projectId } = await params;

  const limited = enforceUserRateLimit(user.id, "comment_create");
  if (limited) return limited;

  const access = await checkProjectAccess(projectId, user);
  if (!access) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const parsed = await validateBody(req, CreateCommentSchema);
  if (isValidationError(parsed)) return parsed;

  // Extract @mentions from content
  // Pattern: @[displayName](userId)
  const mentions: string[] = [];
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mentionRegex.exec(parsed.content)) !== null) {
    mentions.push(m[2]);
  }

  const comment = await prisma.comment.create({
    data: {
      projectId,
      userId: user.id,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      content: parsed.content,
      mentions,
    },
    select: {
      id: true,
      targetType: true,
      targetId: true,
      content: true,
      mentions: true,
      createdAt: true,
      user: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
    },
  });

  await logProjectActivity({
    projectId,
    actorId: user.id,
    action: "comment.added",
    targetType: parsed.targetType,
    targetId: parsed.targetId,
    metadata: { commentId: comment.id },
  });

  // Notify mentioned users (excluding self)
  for (const mentionedId of comment.mentions) {
    if (mentionedId === user.id) continue;
    await createNotification({
      userId: mentionedId,
      type: "comment.mention",
      title: `${user.displayName || user.email} mentioned you in a comment`,
      body: parsed.content.slice(0, 140),
      sourceType: "Comment",
      sourceId: comment.id,
      linkPath: `/projects/${projectId}`,
    });
  }

  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
