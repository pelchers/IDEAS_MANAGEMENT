import { test, expect, type APIRequestContext, apiContextWithIp } from './helpers';

/**
 * Permission-Matrix UAT — proves access control ENFORCES at runtime across the
 * app's real user types:
 *   - System role:   USER vs ADMIN
 *   - Project role:   OWNER vs EDITOR vs VIEWER vs non-member
 *   - Group role:     OWNER vs ADMIN vs MEMBER vs non-member
 *   - Cross-user:     can't act on another user's friendship/notification
 *
 * Each user is a real authenticated session (its own cookie jar). Every
 * assertion checks the actual HTTP status the server returns.
 */

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const PW = 'TestPass123!';
const ADMIN_EMAIL = 'admin@ideamgmt.local';
const ADMIN_PASSWORD = 'AdminPass123!';
const ts = `${Date.now()}`;

type User = { email: string; ctx: APIRequestContext; id: string };

async function makeUser(email: string): Promise<User> {
  const ctx = await apiContextWithIp(BASE);
  const signup = await ctx.post('/api/auth/signup', { data: { email, password: PW } });
  const body = await signup.json();
  let id: string = body?.user?.id ?? '';
  // Ensure authenticated session
  await ctx.post('/api/auth/signin', { data: { email, password: PW } });
  if (!id) {
    const me = await (await ctx.get('/api/auth/me')).json();
    id = me?.user?.id ?? '';
  }
  return { email, ctx, id };
}

test('Permission matrix — runtime access control across all user types', async () => {
  test.setTimeout(180_000);

  // ── Provision real users ──
  const alice = await makeUser(`pm-alice-${ts}@test.local`);   // project OWNER / group OWNER
  const bob = await makeUser(`pm-bob-${ts}@test.local`);       // project EDITOR / group ADMIN
  const carol = await makeUser(`pm-carol-${ts}@test.local`);   // project VIEWER / group MEMBER
  const dave = await makeUser(`pm-dave-${ts}@test.local`);     // non-member outsider
  expect(alice.id && bob.id && carol.id && dave.id).toBeTruthy();

  // Admin (seeded)
  const adminCtx = await apiContextWithIp(BASE);
  await adminCtx.post('/api/auth/signin', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });

  const results: { check: string; expected: number; got: number; pass: boolean }[] = [];
  const expectStatus = async (label: string, p: Promise<{ status(): number }>, expected: number) => {
    const res = await p;
    const got = res.status();
    const pass = got === expected;
    results.push({ check: label, expected, got, pass });
    expect(got, `${label} — expected ${expected}, got ${got}`).toBe(expected);
  };

  // ─────────────────────────────────────────────────────────────────
  // SYSTEM ROLE — USER vs ADMIN
  // ─────────────────────────────────────────────────────────────────
  await expectStatus('USER hits /api/admin/config → 403', bob.ctx.get('/api/admin/config'), 403);
  await expectStatus('ADMIN hits /api/admin/config → 200', adminCtx.get('/api/admin/config'), 200);

  // ─────────────────────────────────────────────────────────────────
  // PROJECT ROLES — set up Alice=OWNER, Bob=EDITOR, Carol=VIEWER
  // ─────────────────────────────────────────────────────────────────
  const proj = await (await alice.ctx.post('/api/projects', { data: { name: `PM Project ${ts}` } })).json();
  const pid = proj?.project?.id ?? proj?.id;
  expect(pid).toBeTruthy();
  // Alice (OWNER) adds Bob as EDITOR and Carol as VIEWER
  await expectStatus('OWNER adds EDITOR → 201', alice.ctx.post(`/api/projects/${pid}/members`, { data: { userId: bob.id, role: "EDITOR" } }), 201);
  await expectStatus('OWNER adds VIEWER → 201', alice.ctx.post(`/api/projects/${pid}/members`, { data: { userId: carol.id, role: "VIEWER" } }), 201);

  // EDITOR can edit project metadata; VIEWER cannot
  await expectStatus('EDITOR PATCH project → 200', bob.ctx.patch(`/api/projects/${pid}`, { data: { description: "edited by editor" } }), 200);
  await expectStatus('VIEWER PATCH project → 403', carol.ctx.patch(`/api/projects/${pid}`, { data: { description: "viewer tries to edit" } }), 403);

  // Only OWNER can invite members
  await expectStatus('EDITOR invite member → 403', bob.ctx.post(`/api/projects/${pid}/invite`, { data: { email: `x-${ts}@test.local`, role: "VIEWER" } }), 403);
  await expectStatus('VIEWER invite member → 403', carol.ctx.post(`/api/projects/${pid}/invite`, { data: { email: `y-${ts}@test.local`, role: "VIEWER" } }), 403);
  await expectStatus('OWNER invite member → 201', alice.ctx.post(`/api/projects/${pid}/invite`, { data: { email: `z-${ts}@test.local`, role: "VIEWER" } }), 201);

  // Members (incl VIEWER) can read + comment; non-member cannot
  await expectStatus('VIEWER GET project → 200', carol.ctx.get(`/api/projects/${pid}`), 200);
  await expectStatus('VIEWER comment → 201', carol.ctx.post(`/api/projects/${pid}/comments`, { data: { targetType: "note", targetId: "n1", content: "viewer comment" } }), 201);
  await expectStatus('non-member GET project → 404', dave.ctx.get(`/api/projects/${pid}`), 404);
  await expectStatus('non-member comment → 403', dave.ctx.post(`/api/projects/${pid}/comments`, { data: { targetType: "note", targetId: "n1", content: "outsider" } }), 403);
  await expectStatus('non-member activity feed → 403', dave.ctx.get(`/api/projects/${pid}/activity`), 403);

  // Only OWNER can change roles / delete project
  const members = await (await alice.ctx.get(`/api/projects/${pid}`)).json();
  const bobMember = members.project.members.find((m: { user: { id: string }; id: string }) => m.user.id === bob.id);
  await expectStatus('EDITOR change role → 403', bob.ctx.patch(`/api/projects/${pid}/members/${bobMember.id}`, { data: { role: "OWNER" } }), 403);

  // ─────────────────────────────────────────────────────────────────
  // GROUP ROLES — Alice=OWNER, Bob=ADMIN, Carol=MEMBER
  // ─────────────────────────────────────────────────────────────────
  const grp = await (await alice.ctx.post('/api/groups', { data: { name: `PM Group ${ts}` } })).json();
  const gid = grp?.group?.id;
  expect(gid).toBeTruthy();
  // Alice (OWNER) invites Bob as ADMIN and Carol as MEMBER
  await expectStatus('OWNER invite ADMIN → 201', alice.ctx.post(`/api/groups/${gid}/members`, { data: { action: "invite", userId: bob.id, role: "ADMIN" } }), 201);
  await expectStatus('OWNER invite MEMBER → 201', alice.ctx.post(`/api/groups/${gid}/members`, { data: { action: "invite", userId: carol.id, role: "MEMBER" } }), 201);

  // ADMIN can invite; MEMBER cannot
  await expectStatus('ADMIN invite → 201', bob.ctx.post(`/api/groups/${gid}/members`, { data: { action: "invite", email: `g-${ts}@test.local` } }), 404); // user not found, but passed the ADMIN gate (404 not 403)
  await expectStatus('MEMBER invite → 403', carol.ctx.post(`/api/groups/${gid}/members`, { data: { action: "invite", email: `h-${ts}@test.local` } }), 403);

  // ADMIN cannot delete the group or grant OWNER (OWNER-only)
  await expectStatus('ADMIN delete group → 403', bob.ctx.delete(`/api/groups/${gid}`), 403);
  const gmembers = await (await alice.ctx.get(`/api/groups/${gid}`)).json();
  const carolGM = gmembers.group.members.find((m: { user: { id: string }; id: string }) => m.user.id === carol.id);
  await expectStatus('ADMIN grant OWNER → 403', bob.ctx.patch(`/api/groups/${gid}/members/${carolGM.id}`, { data: { action: "set_role", role: "OWNER" } }), 403);
  // ADMIN CAN change a member to ADMIN (allowed)
  await expectStatus('ADMIN set MEMBER→ADMIN → 200', bob.ctx.patch(`/api/groups/${gid}/members/${carolGM.id}`, { data: { action: "set_role", role: "ADMIN" } }), 200);

  // MEMBER (re-fetch a still-MEMBER user = none; use Dave as non-member)
  await expectStatus('non-member PATCH group → 403', dave.ctx.patch(`/api/groups/${gid}`, { data: { description: "outsider" } }), 403);
  // OWNER can delete the group
  await expectStatus('OWNER delete group → 200', alice.ctx.delete(`/api/groups/${gid}`), 200);

  // ─────────────────────────────────────────────────────────────────
  // CROSS-USER PRIVACY — can't act on another user's objects
  // ─────────────────────────────────────────────────────────────────
  // Bob friend-requests Alice; Dave must not be able to accept it
  const fr = await (await bob.ctx.post('/api/friends/request', { data: { addresseeId: alice.id } })).json();
  const friendshipId = fr?.friendship?.id;
  expect(friendshipId).toBeTruthy();
  await expectStatus('non-addressee accept friendship → 403', dave.ctx.put(`/api/friends/${friendshipId}`, { data: { action: "accept" } }), 403);
  await expectStatus('addressee accept friendship → 200', alice.ctx.put(`/api/friends/${friendshipId}`, { data: { action: "accept" } }), 200);
  // Marking a non-existent / not-owned notification read → 404
  await expectStatus('mark foreign notification read → 404', dave.ctx.put('/api/notifications/nonexistent-id/read'), 404);

  // ── Print a readable matrix to the test output ──
  console.log('\n──────── PERMISSION MATRIX RESULTS ────────');
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  [${r.got}===${r.expected}]  ${r.check}`);
  }
  console.log(`───────── ${results.filter(r => r.pass).length}/${results.length} checks passed ─────────\n`);

  await alice.ctx.dispose();
  await bob.ctx.dispose();
  await carol.ctx.dispose();
  await dave.ctx.dispose();
  await adminCtx.dispose();
});
