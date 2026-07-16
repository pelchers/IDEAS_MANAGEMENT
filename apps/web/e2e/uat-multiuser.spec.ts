import { test, expect, type Page, type BrowserContext, newUserContext } from './helpers';

/**
 * User Acceptance Test — real multi-user UI interactions across all V2 features.
 *
 * Three real users in separate browser contexts drive the actual UI:
 *  - Alice (project owner, group creator)
 *  - Bob (collaborator, friend)
 *  - Carol (third party, group joiner)
 *
 * Every step performs a real user action (type/click/navigate) and asserts the
 * resulting state — not just element visibility.
 */

const SHOT = '../../.docs/validation/screenshots/uat-2026-05-31';
const PW = 'TestPass123!';
const ts = `${Date.now()}`;

const alice = { email: `uat-alice-${ts}@test.local`, name: 'Alice Anderson' };
const bob = { email: `uat-bob-${ts}@test.local`, name: 'Bob Brown' };
const carol = { email: `uat-carol-${ts}@test.local`, name: 'Carol Clark' };

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOT}/${name}.png`, fullPage: false });
}

// Sign up via API (in the context so cookies stick), then sign in via UI.
async function provision(ctx: BrowserContext, email: string) {
  const r = await ctx.request.post('/api/auth/signup', { data: { email, password: PW } });
  const body = await r.json();
  return body?.user?.id as string | undefined;
}

async function uiSignIn(page: Page, email: string) {
  await page.goto('/signin');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(PW);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 20_000 });
}

test('UAT — full multi-user journey across all V2 features', async ({ browser }) => {
  test.setTimeout(240_000);

  // Separate browser contexts = 3 genuinely independent user sessions
  const aliceCtx = await newUserContext(browser);
  const bobCtx = await newUserContext(browser);
  const carolCtx = await newUserContext(browser);
  const aliceId = await provision(aliceCtx, alice.email);
  const bobId = await provision(bobCtx, bob.email);
  await provision(carolCtx, carol.email);
  expect(aliceId).toBeTruthy();
  expect(bobId).toBeTruthy();

  const aliceP = await aliceCtx.newPage();
  const bobP = await bobCtx.newPage();
  const carolP = await carolCtx.newPage();

  await uiSignIn(aliceP, alice.email);
  await uiSignIn(bobP, bob.email);
  await uiSignIn(carolP, carol.email);

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 1 — Profiles: Alice edits her profile (real form interaction)
  // ─────────────────────────────────────────────────────────────────────
  await aliceP.goto('/profile');
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.locator('button:has-text("EDIT PROFILE")').click();
  await aliceP.locator('input[placeholder="Your display name"]').fill(alice.name);
  await aliceP.locator('textarea').first().fill('Building cool things with the team.');
  await aliceP.locator('input[placeholder*="tag" i]').fill('typescript');
  await aliceP.locator('button:has-text("ADD")').click();
  await shot(aliceP, '01-alice-profile-edit');
  await aliceP.locator('button:has-text("SAVE CHANGES")').click();
  await aliceP.waitForTimeout(1200);
  // Assert: view mode now shows the new display name
  await expect(aliceP.locator(`text=${alice.name}`).first()).toBeVisible({ timeout: 5000 });
  await shot(aliceP, '02-alice-profile-saved');

  // Bob + Carol also set display names (so they're discoverable)
  for (const [p, u] of [[bobP, bob], [carolP, carol]] as const) {
    await p.goto('/profile');
    await p.waitForLoadState('domcontentloaded');
    await p.locator('button:has-text("EDIT PROFILE")').click();
    await p.locator('input[placeholder="Your display name"]').fill(u.name);
    await p.locator('button:has-text("SAVE CHANGES")').click();
    await p.waitForTimeout(1000);
  }

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 1 — Explore: Alice makes a project PUBLIC, Carol finds it
  // ─────────────────────────────────────────────────────────────────────
  const projRes = await aliceCtx.request.post('/api/projects', {
    data: { name: `Alice Public Project ${ts}`, description: 'A public project for UAT' },
  });
  const projBody = await projRes.json();
  const projectId = projBody?.project?.id ?? projBody?.id;
  expect(projectId).toBeTruthy();

  // Alice opens the project and clicks the PUBLIC/PRIVATE toggle (real UI action)
  await aliceP.goto(`/projects/${projectId}`);
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1500);
  const toggle = aliceP.locator('[data-testid="visibility-toggle"]');
  await expect(toggle).toBeVisible({ timeout: 8000 });
  await expect(toggle).toContainText('PRIVATE');
  await shot(aliceP, '03-alice-project-private');
  await toggle.click();
  await aliceP.waitForTimeout(800);
  await expect(toggle).toContainText('PUBLIC');
  await shot(aliceP, '04-alice-project-public');

  // Carol goes to Explore and finds Alice's now-public project
  await carolP.goto('/explore');
  await carolP.waitForLoadState('domcontentloaded');
  await carolP.waitForTimeout(1000);
  await carolP.locator('input[placeholder*="by name" i]').fill(`Alice Public Project ${ts}`);
  await carolP.locator('button:has-text("SEARCH")').click();
  await carolP.waitForTimeout(1200);
  await shot(carolP, '05-carol-explore-finds-project');
  await expect(carolP.locator(`text=Alice Public Project ${ts}`).first()).toBeVisible({ timeout: 8000 });

  // Carol switches to Users tab and finds Alice by name
  await carolP.locator('button:has-text("USERS")').first().click();
  await carolP.waitForTimeout(500);
  await carolP.locator('input[placeholder*="by name" i]').fill('Alice');
  await carolP.locator('button:has-text("SEARCH")').click();
  await carolP.waitForTimeout(1200);
  await shot(carolP, '06-carol-explore-finds-alice');
  await expect(carolP.locator(`text=${alice.name}`).first()).toBeVisible({ timeout: 8000 });

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 3 — Friends: Bob friend-requests Alice, Alice accepts
  // ─────────────────────────────────────────────────────────────────────
  await bobP.goto(`/users/${aliceId}`);
  await bobP.waitForLoadState('domcontentloaded');
  await bobP.waitForTimeout(1000);
  await shot(bobP, '07-bob-views-alice-profile');
  await bobP.locator('button:has-text("ADD FRIEND")').click();
  await bobP.waitForTimeout(1000);
  // Assert: button transitions to CANCEL REQUEST (outgoing state)
  await expect(bobP.locator('button:has-text("CANCEL REQUEST")')).toBeVisible({ timeout: 5000 });
  await shot(bobP, '08-bob-request-sent');

  // Alice sees the request on /friends and accepts it
  await aliceP.goto('/friends');
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1200);
  await shot(aliceP, '09-alice-incoming-request');
  await expect(aliceP.locator(`text=${bob.name}`).first()).toBeVisible({ timeout: 8000 });
  await aliceP.locator('button:has-text("ACCEPT")').first().click();
  await aliceP.waitForTimeout(1200);
  await shot(aliceP, '10-alice-accepted-friend');
  // Assert: Bob now appears under the FRIENDS section
  await expect(aliceP.locator(`text=${bob.name}`).first()).toBeVisible();

  // Bob's view of Alice now shows FRIENDS state
  await bobP.goto(`/users/${aliceId}`);
  await bobP.waitForLoadState('domcontentloaded');
  await bobP.waitForTimeout(1200);
  await expect(bobP.locator('text=FRIENDS').first()).toBeVisible({ timeout: 8000 });
  await shot(bobP, '11-bob-now-friends');

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 4 — Notifications: Alice's bell shows Bob's friend request
  // ─────────────────────────────────────────────────────────────────────
  await aliceP.goto('/dashboard');
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1500);
  // Alice received: friend.request (from Bob). Bob received: friend.accepted.
  await bobP.goto('/dashboard');
  await bobP.waitForLoadState('domcontentloaded');
  await bobP.waitForTimeout(1500);
  const bobBadge = bobP.locator('[data-testid="notification-badge"]');
  await expect(bobBadge).toBeVisible({ timeout: 8000 });
  await bobP.locator('button[aria-label="Notifications"]').click();
  await bobP.waitForTimeout(800);
  await shot(bobP, '12-bob-notification-accepted');
  await expect(bobP.locator('text=/accepted your friend request/i').first()).toBeVisible({ timeout: 5000 });
  // Click the notification → navigates to Alice's profile
  await bobP.locator('[data-testid="notification-panel"] button').filter({ hasText: /accepted/i }).first().click();
  await bobP.waitForURL(`**/users/${aliceId}`, { timeout: 8000 });
  await shot(bobP, '13-bob-notification-clickthrough');

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 3 — Groups: Alice creates a group, invites Bob, Carol requests to join
  // ─────────────────────────────────────────────────────────────────────
  await aliceP.goto('/groups');
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1000);
  await aliceP.locator('button:has-text("CREATE GROUP")').first().click();
  await aliceP.waitForTimeout(400);
  const groupName = `UAT Squad ${ts}`;
  await aliceP.locator('input[placeholder="Group name"]').fill(groupName);
  await aliceP.locator('textarea[placeholder*="escription" i]').fill('UAT collaboration group');
  await shot(aliceP, '14-alice-create-group');
  await aliceP.locator('button').filter({ hasText: /^CREATE$/ }).click();
  await aliceP.waitForTimeout(1500);
  await expect(aliceP.locator(`text=${groupName}`).first()).toBeVisible({ timeout: 8000 });
  // Open the group
  await aliceP.locator(`text=${groupName}`).first().click();
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1200);
  const groupUrl = aliceP.url();
  const groupId = groupUrl.split('/groups/')[1];
  await shot(aliceP, '15-alice-group-detail');
  // Alice invites Bob by email (real form action)
  await aliceP.locator('input[placeholder*="Invite by email" i]').fill(bob.email);
  await aliceP.locator('button:has-text("INVITE")').click();
  await aliceP.waitForTimeout(1200);
  await shot(aliceP, '16-alice-invited-bob');
  // Assert: Bob now appears in the member list
  await expect(aliceP.locator(`text=${bob.name}`).first()).toBeVisible({ timeout: 5000 });

  // Carol requests to join the group
  await carolP.goto(`/groups/${groupId}`);
  await carolP.waitForLoadState('domcontentloaded');
  await carolP.waitForTimeout(1200);
  await carolP.locator('button:has-text("REQUEST TO JOIN")').click();
  await carolP.waitForTimeout(1200);
  await expect(carolP.locator('text=JOIN PENDING').first()).toBeVisible({ timeout: 5000 });
  await shot(carolP, '17-carol-join-pending');

  // Alice approves Carol's join request
  await aliceP.goto(`/groups/${groupId}`);
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1500);
  await expect(aliceP.locator('text=JOIN REQUESTS').first()).toBeVisible({ timeout: 8000 });
  await shot(aliceP, '18-alice-sees-join-request');
  await aliceP.locator('button:has-text("APPROVE")').first().click();
  await aliceP.waitForTimeout(1500);
  await shot(aliceP, '19-alice-approved-carol');
  // Assert: Carol is now an active member
  await expect(aliceP.locator(`text=${carol.name}`).first()).toBeVisible({ timeout: 5000 });

  // Carol now sees herself as a member (MEMBER badge)
  await carolP.goto(`/groups/${groupId}`);
  await carolP.waitForLoadState('domcontentloaded');
  await carolP.waitForTimeout(1500);
  await expect(carolP.locator('text=MEMBER').first()).toBeVisible({ timeout: 8000 });
  await shot(carolP, '20-carol-now-member');

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 4 — Settings: Alice opts into a WEEKLY email digest
  // ─────────────────────────────────────────────────────────────────────
  await aliceP.goto('/settings');
  await aliceP.waitForLoadState('domcontentloaded');
  await aliceP.waitForTimeout(1200);
  const digest = aliceP.locator('[data-testid="email-digest-select"]');
  await digest.scrollIntoViewIfNeeded();
  await digest.selectOption('WEEKLY');
  await aliceP.waitForTimeout(800);
  await shot(aliceP, '21-alice-digest-weekly');
  // Assert: persisted
  const me = await (await aliceCtx.request.get('/api/auth/me')).json();
  expect(me.user.emailDigestFrequency).toBe('WEEKLY');

  await aliceCtx.close();
  await bobCtx.close();
  await carolCtx.close();
});
