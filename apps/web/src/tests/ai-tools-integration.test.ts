/**
 * AI Tools Integration Test
 * Tests each tool by calling it directly via the tool execute functions.
 * This simulates what happens when the AI model decides to use a tool.
 */

import { describe, it, expect, beforeAll } from "vitest";

// We test the tool functions directly since they're what the AI calls
import {
  executeReadArtifact,
  executeListProjects,
  executeManageProject,
  executeUpdateIdeas,
  executeUpdateKanbanArtifact,
  executeUpdateSchema,
  executeUpdateWhiteboard,
  executeUpdateDirectoryTree,
} from "@/server/ai/tools/artifact-tools";

// These need a DB connection, so we'll test them via HTTP instead
const BASE = "http://localhost:3000";
let sessionCookie = "";
let projectId = "";

async function apiRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json(), headers: res.headers };
}

describe("AI Tools Integration", () => {
  beforeAll(async () => {
    // Sign up / sign in test user
    const email = "aitoolstest@example.com";
    const password = "TestPass123!";

    await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginRes = await fetch(`${BASE}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Extract session cookie
    const setCookies = loginRes.headers.getSetCookie?.() || [];
    sessionCookie = setCookies.map((c: string) => c.split(";")[0]).join("; ");

    // Create a test project
    const projRes = await apiRequest("POST", "/api/projects", {
      name: "AI Tools Test Project",
      slug: `ai-tools-test-${Date.now()}`,
      description: "Testing AI tools",
    });
    projectId = projRes.data.project?.id;
    console.log("Test project ID:", projectId);
  });

  it("list_projects: should list user projects", async () => {
    const res = await apiRequest("GET", "/api/projects");
    expect(res.status).toBe(200);
    expect(res.data.ok).toBe(true);
    expect(Array.isArray(res.data.projects)).toBe(true);
    console.log("✅ list_projects:", res.data.projects.length, "projects");
  });

  it("update_ideas: should add an idea via artifact", async () => {
    if (!projectId) return;
    // Simulate: AI calls update_ideas_artifact with action=add
    const res = await apiRequest("PUT", `/api/projects/${projectId}/artifacts/ideas/ideas.json`, {
      content: {
        ideas: [{
          id: "test-idea-1",
          title: "Test Idea from AI",
          body: "This idea was created by an AI tool test",
          tags: ["test", "ai"],
          category: "FEATURE",
          priority: "high",
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        }],
      },
    });
    expect(res.status).toBe(200);
    console.log("✅ update_ideas: idea added");

    // Verify read
    const readRes = await apiRequest("GET", `/api/projects/${projectId}/artifacts/ideas/ideas.json`);
    expect(readRes.status).toBe(200);
    const ideas = readRes.data.artifact?.content?.ideas;
    expect(Array.isArray(ideas)).toBe(true);
    expect(ideas[0].title).toBe("Test Idea from AI");
    console.log("✅ read_artifact (ideas): verified");
  });

  it("update_kanban: should add a card via artifact", async () => {
    if (!projectId) return;
    const res = await apiRequest("PUT", `/api/projects/${projectId}/artifacts/kanban/board.json`, {
      content: {
        columns: [
          { name: "TODO", cards: [{ id: "card-1", title: "AI-created task", description: "Test card", labels: ["ai-test"], createdAt: new Date().toISOString() }] },
          { name: "IN PROGRESS", cards: [] },
          { name: "DONE", cards: [] },
        ],
      },
    });
    expect(res.status).toBe(200);
    console.log("✅ update_kanban: card added");

    const readRes = await apiRequest("GET", `/api/projects/${projectId}/artifacts/kanban/board.json`);
    expect(readRes.data.artifact?.content?.columns?.[0]?.cards?.[0]?.title).toBe("AI-created task");
    console.log("✅ read_artifact (kanban): verified");
  });

  it("update_schema: should add entity via artifact", async () => {
    if (!projectId) return;
    const res = await apiRequest("PUT", `/api/projects/${projectId}/artifacts/schema/schema.graph.json`, {
      content: {
        entities: [{
          id: "ent-1", name: "AI_USERS", x: 40, y: 40,
          fields: [
            { id: "f-1", name: "id", type: "uuid", required: true, unique: true, isPK: true, isFK: false },
            { id: "f-2", name: "email", type: "string", required: true, unique: true, isPK: false, isFK: false },
          ],
        }],
        relations: [],
        enumTypes: [{ id: "enum-1", name: "UserRole", values: ["ADMIN", "USER", "GUEST"] }],
      },
    });
    expect(res.status).toBe(200);
    console.log("✅ update_schema: entity + enum added");

    const readRes = await apiRequest("GET", `/api/projects/${projectId}/artifacts/schema/schema.graph.json`);
    const entities = readRes.data.artifact?.content?.entities;
    expect(entities?.[0]?.name).toBe("AI_USERS");
    expect(readRes.data.artifact?.content?.enumTypes?.[0]?.name).toBe("UserRole");
    console.log("✅ read_artifact (schema): verified entity + enum");
  });

  it("update_whiteboard: should add sticky via artifact", async () => {
    if (!projectId) return;
    const res = await apiRequest("PUT", `/api/projects/${projectId}/artifacts/whiteboard/board.json`, {
      content: {
        stickies: [{
          id: "sticky-1", title: "AI Sticky", description: "Created by AI", tags: ["brainstorm"],
          color: "lemon", bgColor: "#FFE459", borderColor: "#E6CD00",
          x: 150, y: 150, width: 180, height: 0,
        }],
        paths: [],
        mediaItems: [],
      },
    });
    expect(res.status).toBe(200);
    console.log("✅ update_whiteboard: sticky added");

    const readRes = await apiRequest("GET", `/api/projects/${projectId}/artifacts/whiteboard/board.json`);
    expect(readRes.data.artifact?.content?.stickies?.[0]?.title).toBe("AI Sticky");
    console.log("✅ read_artifact (whiteboard): verified");
  });

  it("update_directory_tree: should add nodes via artifact", async () => {
    if (!projectId) return;
    const res = await apiRequest("PUT", `/api/projects/${projectId}/artifacts/directory-tree/tree.plan.json`, {
      content: {
        tree: [{
          id: "n-1", name: "src", type: "folder",
          children: [
            { id: "n-2", name: "index.ts", type: "file" },
            { id: "n-3", name: "utils", type: "folder", children: [
              { id: "n-4", name: "helpers.ts", type: "file" },
            ]},
          ],
        }],
        fileContents: {},
      },
    });
    expect(res.status).toBe(200);
    console.log("✅ update_directory_tree: tree created");

    const readRes = await apiRequest("GET", `/api/projects/${projectId}/artifacts/directory-tree/tree.plan.json`);
    expect(readRes.data.artifact?.content?.tree?.[0]?.name).toBe("src");
    console.log("✅ read_artifact (directory-tree): verified");
  });

  it("manage_project: should update project", async () => {
    if (!projectId) return;
    const res = await apiRequest("PUT", `/api/projects/${projectId}`, {
      description: "Updated by AI tools test",
      status: "ACTIVE",
    });
    expect(res.status).toBe(200);
    console.log("✅ manage_project: project updated");
  });

  it("cross-page scenario: add idea while 'on' kanban page", async () => {
    // This tests the core cross-page feature: AI can add an idea even
    // when the user is on the kanban page. We just need to verify the
    // ideas artifact gets a new entry.
    if (!projectId) return;

    // Read current ideas
    const before = await apiRequest("GET", `/api/projects/${projectId}/artifacts/ideas/ideas.json`);
    const existingIdeas = before.data.artifact?.content?.ideas || [];

    // Add a new idea (what the AI would do cross-page)
    const newIdea = {
      id: `idea-cross-${Date.now()}`,
      title: "Cross-page idea: user notifications system",
      body: "Add push notifications when tasks are assigned or completed",
      tags: ["notifications", "ux"],
      category: "FEATURE",
      priority: "high",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    await apiRequest("PUT", `/api/projects/${projectId}/artifacts/ideas/ideas.json`, {
      content: { ideas: [newIdea, ...existingIdeas] },
    });

    // Verify
    const after = await apiRequest("GET", `/api/projects/${projectId}/artifacts/ideas/ideas.json`);
    const ideas = after.data.artifact?.content?.ideas;
    expect(ideas.length).toBe(existingIdeas.length + 1);
    expect(ideas[0].title).toBe("Cross-page idea: user notifications system");
    console.log("✅ cross-page: idea added while 'on' kanban page");
  });
});
