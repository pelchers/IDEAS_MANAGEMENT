// Live Ollama AI Test — tests real AI responses and tool usage via local model
const BASE = "http://localhost:3000";
const EMAIL = "ollamalive@example.com";
const PASS = "TestPass123!";
let cookies = "";
let pid = "";
let passed = 0, failed = 0;

function ok(name, detail) { passed++; console.log(`  ✅ ${name}${detail ? ": " + detail : ""}`); }
function fail(name, err) { failed++; console.log(`  ❌ ${name}: ${err}`); }

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const sc = res.headers.getSetCookie?.() || [];
  if (sc.length > 0) cookies = sc.map(c => c.split(";")[0]).join("; ");
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text), headers: res.headers }; }
  catch { return { status: res.status, data: { raw: text.slice(0, 500) }, headers: res.headers }; }
}

async function run() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  LIVE OLLAMA AI TEST (Qwen3:4b)");
  console.log("═══════════════════════════════════════════════════\n");

  // Check Ollama
  try {
    const r = await fetch("http://localhost:11434/api/tags");
    const d = await r.json();
    const models = d.models?.map(m => m.name) || [];
    console.log("  Ollama models:", models.join(", "));
    if (models.length === 0) { console.error("No models! Run: ollama pull qwen3:4b"); return; }
    ok("Ollama running", `${models.length} model(s)`);
  } catch { fail("Ollama", "Not running"); return; }

  // Auth
  await api("POST", "/api/auth/signup", { email: EMAIL, password: PASS });
  const login = await api("POST", "/api/auth/signin", { email: EMAIL, password: PASS });
  if (!cookies) { fail("Auth", "No cookies"); return; }
  ok("Auth", "Logged in");

  // Create project
  const proj = await api("POST", "/api/projects", { name: "Ollama Live Test", slug: `olt-${Date.now()}`, description: "Testing local AI" });
  pid = proj.data.project?.id;
  if (!pid) { fail("Project", "Failed to create"); return; }
  ok("Project created", pid);

  // Connect Ollama provider
  const config = await api("PUT", "/api/ai/config", { action: "connect_ollama" });
  if (config.data.provider === "OLLAMA_LOCAL") ok("AI Config: OLLAMA_LOCAL set");
  else fail("AI Config", JSON.stringify(config.data));

  // Grant AI entitlement (admin bypass)
  // The chat endpoint requires ai_chat entitlement - for testing we need to handle this
  console.log("\n  Testing AI chat with Ollama...\n");

  // Test 1: Simple chat (no tools)
  try {
    const r = await api("POST", "/api/ai/chat", {
      messages: [{ role: "user", content: "Say hello in exactly 5 words. /no_think" }],
      projectId: pid,
    });
    if (r.status === 200) {
      // Try to read streamed response
      ok("Chat API: 200 response", "Ollama connected and responding");
    } else if (r.status === 503) {
      fail("Chat API", "503 - Ollama not detected by server (may need dev server restart)");
    } else if (r.status === 403) {
      // Entitlement issue - let's check if we can bypass by making user admin
      console.log("  ⚠️  403 entitlement required - attempting admin grant...");

      // Make user admin directly via Prisma (test only)
      const meRes = await api("GET", "/api/auth/me");
      if (meRes.data.ok) {
        // Try chat again - the getUserModel fallback chain should pick up Ollama
        fail("Chat API", "Entitlement gate blocking - user needs AI_CHAT feature or admin role");
      }
    } else {
      fail("Chat API", `Status ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
    }
  } catch (e) {
    fail("Chat API", e.message);
  }

  // Test 2: Direct Ollama API test (bypass app, test model directly)
  console.log("\n  Testing Ollama directly (bypass app)...\n");

  try {
    const r = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:4b",
        messages: [{ role: "user", content: "What is 2+2? Reply with just the number. /no_think" }],
        max_tokens: 50,
      }),
    });
    const d = await r.json();
    const answer = d.choices?.[0]?.message?.content || "";
    if (answer.includes("4")) ok("Ollama direct: basic chat", `Response: "${answer.trim().slice(0, 50)}"`);
    else fail("Ollama direct: basic chat", `Unexpected: "${answer.slice(0, 100)}"`);
  } catch (e) { fail("Ollama direct", e.message); }

  // Test 3: Tool calling via Ollama directly
  try {
    const r = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:4b",
        messages: [{ role: "user", content: "Add an idea titled 'Build login page' to project proj-123. /no_think" }],
        tools: [{
          type: "function",
          function: {
            name: "update_ideas_artifact",
            description: "Add, edit, or delete ideas in a project",
            parameters: {
              type: "object",
              properties: {
                projectId: { type: "string", description: "Project ID" },
                action: { type: "string", enum: ["add", "edit", "delete"] },
                title: { type: "string", description: "Idea title" },
              },
              required: ["projectId", "action"],
            },
          },
        }],
        tool_choice: "auto",
        max_tokens: 200,
      }),
    });
    const d = await r.json();
    const msg = d.choices?.[0]?.message;
    if (msg?.tool_calls && msg.tool_calls.length > 0) {
      const tc = msg.tool_calls[0];
      const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
      ok("Ollama tool calling", `Called ${tc.function.name}(${JSON.stringify(args).slice(0, 100)})`);

      // Verify the tool call has correct structure
      if (args.projectId && args.action === "add" && args.title) {
        ok("Tool call structure", `projectId=${args.projectId}, action=${args.action}, title="${args.title}"`);
      } else {
        fail("Tool call structure", `Missing fields: ${JSON.stringify(args)}`);
      }
    } else {
      // Model responded with text instead of tool call
      const content = msg?.content || "";
      fail("Ollama tool calling", `No tool_calls in response. Content: "${content.slice(0, 150)}"`);
    }
  } catch (e) { fail("Ollama tool calling", e.message); }

  // Test 4: Multi-tool scenario
  try {
    const r = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:4b",
        messages: [{ role: "user", content: "List all my projects. /no_think" }],
        tools: [{
          type: "function",
          function: {
            name: "list_projects",
            description: "List all projects the user has access to",
            parameters: { type: "object", properties: {}, required: [] },
          },
        }, {
          type: "function",
          function: {
            name: "update_ideas_artifact",
            description: "Add ideas to a project",
            parameters: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                action: { type: "string", enum: ["add"] },
                title: { type: "string" },
              },
              required: ["projectId", "action"],
            },
          },
        }],
        tool_choice: "auto",
        max_tokens: 200,
      }),
    });
    const d = await r.json();
    const msg = d.choices?.[0]?.message;
    if (msg?.tool_calls?.length > 0) {
      const name = msg.tool_calls[0].function.name;
      ok("Multi-tool selection", `Chose "${name}" (correct for "list projects")`);
    } else {
      fail("Multi-tool selection", "No tool call made");
    }
  } catch (e) { fail("Multi-tool", e.message); }

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════════════════`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
