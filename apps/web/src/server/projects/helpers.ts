import { prisma } from "../db";
import type { AuthenticatedUser } from "../auth/admin";

/**
 * Generate a URL-friendly slug from a project name.
 * Appends a short random suffix for uniqueness.
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Check if a user is a member of a project. Returns the membership record or null.
 */
export async function getProjectMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

/**
 * Verify that a user has at least the required role on a project.
 * Admin users bypass membership checks.
 * Returns the membership role or null if no access.
 */
export async function checkProjectAccess(
  projectId: string,
  user: AuthenticatedUser,
  requiredRole?: "OWNER" | "EDITOR" | "VIEWER"
): Promise<{ role: string } | null> {
  // Admin bypass
  if (user.role === "ADMIN") {
    return { role: "ADMIN" };
  }

  const membership = await getProjectMembership(projectId, user.id);
  if (!membership) return null;

  if (!requiredRole) return { role: membership.role };

  const roleHierarchy: Record<string, number> = {
    OWNER: 3,
    EDITOR: 2,
    VIEWER: 1,
  };

  const userLevel = roleHierarchy[membership.role] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;

  if (userLevel >= requiredLevel) {
    return { role: membership.role };
  }

  return null;
}

/**
 * Default artifacts bootstrapped when creating a new project.
 */
export const DEFAULT_ARTIFACTS: Array<{ path: string; content: unknown }> = [
  {
    path: "project.json",
    content: {
      name: "",
      description: "",
      status: "planning",
      tags: [],
      goals: [],
      techStack: [],
      links: {},
    },
  },
  {
    path: "kanban/board.json",
    content: {
      columns: [
        { id: "backlog", title: "Backlog", cards: [] },
        { id: "todo", title: "To Do", cards: [] },
        { id: "in-progress", title: "In Progress", cards: [] },
        { id: "done", title: "Done", cards: [] },
      ],
    },
  },
  {
    path: "whiteboard/board.json",
    content: {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  {
    path: "schema/schema.graph.json",
    content: {
      entities: [],
      relationships: [],
    },
  },
  {
    path: "directory-tree/tree.plan.json",
    content: {
      root: { name: "/", type: "directory", children: [] },
    },
  },
  {
    path: "ideas/ideas.json",
    content: {
      ideas: [],
    },
  },
  {
    path: "ai/chats/default.ndjson",
    content: {
      messages: [],
    },
  },
];

/**
 * Bootstrap default artifacts for a newly created project.
 */
export async function bootstrapProjectArtifacts(
  projectId: string,
  projectName: string
): Promise<void> {
  const artifacts = DEFAULT_ARTIFACTS.map((a) => {
    const content =
      a.path === "project.json"
        ? { ...a.content as Record<string, unknown>, name: projectName }
        : a.content;
    return {
      projectId,
      artifactPath: a.path,
      content: content as any,
      revision: 1,
    };
  });

  await prisma.projectArtifact.createMany({ data: artifacts });
}
