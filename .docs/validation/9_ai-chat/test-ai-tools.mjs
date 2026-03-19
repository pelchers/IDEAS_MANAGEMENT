// AI Tools Integration Test — validates each tool works via artifact API
// Uses raw HTTP with cookie auth (no browser needed)

const BASE = "http://localhost:3000";
const EMAIL = "aitooltest2@example.com";
const PASS = "TestPass123!";
let cookies = "";
let pid = "";
let passed = 0, failed = 0;

function ok(name) { passed++; console.log(`  ✅ ${name}`); }
function fail(name, err) { failed++; console.log(`  ❌ ${name}: ${err}`); }

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookies },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  // Capture set-cookie headers
  const sc = res.headers.getSetCookie?.() || [];
  if (sc.length > 0) {
    const newCookies = sc.map(c => c.split(";")[0]);
    cookies = newCookies.join("; ");
  }
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: { raw: text.slice(0, 200) } }; }
}

async function run() {
  // ── Auth ──
  console.log("1. Authenticating...");
  await api("POST", "/api/auth/signup", { email: EMAIL, password: PASS });
  const login = await api("POST", "/api/auth/signin", { email: EMAIL, password: PASS });
  if (!cookies) { console.error("No cookies set — auth failed:", login.data); return; }
  console.log("   Logged in, cookies captured\n");

  // Verify auth works
  const me = await api("GET", "/api/auth/me");
  if (!me.data.ok) { console.error("Auth check failed:", me.data); return; }
  console.log(`   User: ${me.data.user.email}\n`);

  // ── Create project ──
  console.log("2. Creating test project...");
  const proj = await api("POST", "/api/projects", { name: "AI Tools Test", slug: `ait-${Date.now()}`, description: "test" });
  pid = proj.data.project?.id;
  if (!pid) { console.error("Project creation failed:", proj.data); return; }
  console.log(`   Project: ${pid}\n`);

  // ── Test each artifact tool ──
  console.log("3. Testing artifact tools...\n");

  // Ideas
  try {
    const w = await api("PUT", `/api/projects/${pid}/artifacts/ideas/ideas.json`, { content: { ideas: [{ id: "t1", title: "AI Test Idea", body: "Works!", tags: ["test"], category: "FEATURE", priority: "high" }] } });
    if (w.status !== 200) throw new Error(`Write: ${w.status} ${JSON.stringify(w.data)}`);
    const r = await api("GET", `/api/projects/${pid}/artifacts/ideas/ideas.json`);
    if (r.data.artifact?.content?.ideas?.[0]?.title === "AI Test Idea") ok("Ideas: write + read");
    else throw new Error(`Read mismatch: ${JSON.stringify(r.data.artifact?.content?.ideas?.[0])}`);
  } catch (e) { fail("Ideas", e.message); }

  // Kanban
  try {
    await api("PUT", `/api/projects/${pid}/artifacts/kanban/board.json`, { content: { columns: [{ name: "TODO", cards: [{ id: "c1", title: "AI Card" }] }, { name: "DONE", cards: [] }] } });
    const r = await api("GET", `/api/projects/${pid}/artifacts/kanban/board.json`);
    if (r.data.artifact?.content?.columns?.[0]?.cards?.[0]?.title === "AI Card") ok("Kanban: write + read");
    else throw new Error("Card mismatch");
  } catch (e) { fail("Kanban", e.message); }

  // Schema
  try {
    await api("PUT", `/api/projects/${pid}/artifacts/schema/schema.graph.json`, { content: { entities: [{ id: "e1", name: "USERS", fields: [{ id: "f1", name: "id", type: "uuid", required: true, unique: true, isPK: true, isFK: false }], x: 40, y: 40 }], relations: [], enumTypes: [{ id: "en1", name: "Status", values: ["ACTIVE", "INACTIVE"] }] } });
    const r = await api("GET", `/api/projects/${pid}/artifacts/schema/schema.graph.json`);
    if (r.data.artifact?.content?.entities?.[0]?.name === "USERS" && r.data.artifact?.content?.enumTypes?.[0]?.values?.length === 2) ok("Schema: entity + enum");
    else throw new Error("Schema mismatch");
  } catch (e) { fail("Schema", e.message); }

  // Whiteboard
  try {
    await api("PUT", `/api/projects/${pid}/artifacts/whiteboard/board.json`, { content: { stickies: [{ id: "s1", title: "AI Sticky", description: "test", tags: [], color: "lemon", bgColor: "#FFE459", borderColor: "#E6CD00", x: 100, y: 100, width: 180, height: 0 }], paths: [], mediaItems: [] } });
    const r = await api("GET", `/api/projects/${pid}/artifacts/whiteboard/board.json`);
    if (r.data.artifact?.content?.stickies?.[0]?.title === "AI Sticky") ok("Whiteboard: sticky");
    else throw new Error("Sticky mismatch");
  } catch (e) { fail("Whiteboard", e.message); }

  // Directory Tree
  try {
    await api("PUT", `/api/projects/${pid}/artifacts/directory-tree/tree.plan.json`, { content: { tree: [{ id: "n1", name: "src", type: "folder", children: [{ id: "n2", name: "index.ts", type: "file" }] }], fileContents: {} } });
    const r = await api("GET", `/api/projects/${pid}/artifacts/directory-tree/tree.plan.json`);
    if (r.data.artifact?.content?.tree?.[0]?.children?.[0]?.name === "index.ts") ok("Directory Tree: write + read");
    else throw new Error("Tree mismatch");
  } catch (e) { fail("Directory Tree", e.message); }

  // Project update
  try {
    const r = await api("PATCH", `/api/projects/${pid}`, { description: "Updated by AI test", status: "ACTIVE" });
    if (r.status === 200 && r.data.ok) ok("Project: update");
    else throw new Error(`Status ${r.status}`);
  } catch (e) { fail("Project update", e.message); }

  // Cross-page: add idea to existing list (merge, not overwrite)
  try {
    const r1 = await api("GET", `/api/projects/${pid}/artifacts/ideas/ideas.json`);
    const existing = r1.data.artifact?.content?.ideas || [];
    existing.unshift({ id: "cross-1", title: "Cross-page: notifications", body: "Added from kanban context", tags: ["cross"], category: "FEATURE", priority: "medium" });
    await api("PUT", `/api/projects/${pid}/artifacts/ideas/ideas.json`, { content: { ideas: existing } });
    const r2 = await api("GET", `/api/projects/${pid}/artifacts/ideas/ideas.json`);
    if (r2.data.artifact?.content?.ideas?.length === 2 && r2.data.artifact.content.ideas[0].title === "Cross-page: notifications") ok("Cross-page: merge idea into existing list");
    else throw new Error(`Expected 2 ideas, got ${r2.data.artifact?.content?.ideas?.length}`);
  } catch (e) { fail("Cross-page merge", e.message); }

  // Revision tracking
  try {
    const r1 = await api("GET", `/api/projects/${pid}/artifacts/ideas/ideas.json`);
    const rev1 = r1.data.artifact?.revision;
    await api("PUT", `/api/projects/${pid}/artifacts/ideas/ideas.json`, { content: r1.data.artifact?.content });
    const r2 = await api("GET", `/api/projects/${pid}/artifacts/ideas/ideas.json`);
    const rev2 = r2.data.artifact?.revision;
    if (rev2 > rev1) ok(`Revision increment: ${rev1} → ${rev2}`);
    else throw new Error(`No increment: ${rev1} → ${rev2}`);
  } catch (e) { fail("Revision", e.message); }

  console.log(`\n${"═".repeat(45)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`${"═".repeat(45)}`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
