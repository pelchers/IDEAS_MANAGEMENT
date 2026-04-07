/**
 * Plan #6 Validation — Canvas Tools + Whiteboard Upgrade
 *
 * TC-01  Sign in, navigate to a project's whiteboard. Screenshot the toolbar showing all 11 tools.
 * TC-02  Verify hand tool button exists (hand icon).
 * TC-03  Click zoom + button — verify zoom percentage changes.
 * TC-04  Click zoom - button — verify zoom decreases.
 * TC-05  Verify color picker appears when draw tool selected (8 color swatches).
 * TC-06  Verify thickness options appear when draw tool selected (1,2,3,5,8).
 * TC-07  Verify UNDO/REDO buttons exist in toolbar.
 * TC-08  Right-click on empty canvas — screenshot showing context menu.
 * TC-09  Screenshot zoom controls in bottom-left.
 * TC-10  Navigate to schema planner. Right-click on empty canvas — screenshot context menu.
 * TC-11  If entity exists, right-click on entity — screenshot context menu with color swatches.
 * TC-12  Press 'H' key — verify hand tool activates (check tool button state).
 * TC-13  Press 'P' key — verify draw tool activates.
 */

import { test, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = 'C:/Ideas/IDEA-MANAGEMENT/.docs/validation/plan6-canvas-tools/screenshots';
const ADMIN_EMAIL = 'admin@ideamgmt.local';
const ADMIN_PASSWORD = 'AdminPass123!';
const DESKTOP = { width: 1536, height: 960 };

async function ss(page: Page, name: string): Promise<void> {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[screenshot] ${filePath}`);
}

async function signIn(page: Page): Promise<void> {
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

/** Navigate to the first available project's whiteboard. Returns the project ID. */
async function goToWhiteboard(page: Page): Promise<string> {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const projectLinks = page.locator('a[href*="/projects/"]');
  const count = await projectLinks.count();

  if (count > 0) {
    const href = await projectLinks.first().getAttribute('href');
    const projectId = href?.match(/\/projects\/([^/]+)/)?.[1] ?? '1';
    await page.goto(`/projects/${projectId}/whiteboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    return projectId;
  }

  await page.goto('/projects/1/whiteboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  return '1';
}

/** Navigate to the first available project's schema page. Returns the project ID. */
async function goToSchema(page: Page): Promise<string> {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const projectLinks = page.locator('a[href*="/projects/"]');
  const count = await projectLinks.count();

  if (count > 0) {
    const href = await projectLinks.first().getAttribute('href');
    const projectId = href?.match(/\/projects\/([^/]+)/)?.[1] ?? '1';
    await page.goto(`/projects/${projectId}/schema`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    return projectId;
  }

  await page.goto('/projects/1/schema');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  return '1';
}

test.describe('Plan #6 — Canvas Tools + Whiteboard Upgrade', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  /* ─── TC-01: Toolbar screenshot showing all 11 tools ─────────────── */
  test('TC-01: whiteboard toolbar shows all 11 tools', async ({ page }) => {
    await signIn(page);
    const projectId = await goToWhiteboard(page);
    console.log(`[TC-01] Using project: ${projectId}`);

    // The whiteboard page renders TOOLS array of 11 items as buttons with titles
    // Tools: select, hand, draw, line, rect, circle, arrow, dot, eraser, sticky, media
    const toolTitles = [
      'Select',
      'Hand / Pan',
      'Freehand Draw',
      'Straight Line',
      'Rectangle',
      'Circle / Ellipse',
      'Arrow',
      'Place Dot / Pin',
      'Eraser',
      'Add Sticky Note',
      'Attach Media',
    ];

    for (const title of toolTitles) {
      const btn = page.locator(`button[title*="${title}"]`);
      await expect(btn).toBeVisible({ timeout: 8_000 });
    }

    await ss(page, 'TC-01-toolbar-all-11-tools');
    console.log('[TC-01] PASS: all 11 tool buttons visible');
  });

  /* ─── TC-02: Hand tool button exists ────────────────────────────── */
  test('TC-02: hand tool button exists with hand icon', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // Hand tool has title "Hand / Pan (H)"
    const handBtn = page.locator('button[title*="Hand"]');
    await expect(handBtn).toBeVisible();

    // The icon is ✋ (U+270B) — verify the button has content
    const icon = await handBtn.textContent();
    console.log(`[TC-02] Hand tool icon text: ${JSON.stringify(icon)}`);
    expect(icon?.trim().length).toBeGreaterThan(0);

    await ss(page, 'TC-02-hand-tool-button');
    console.log('[TC-02] PASS: hand tool button visible');
  });

  /* ─── TC-03: Zoom + button increases zoom percentage ─────────────── */
  test('TC-03: zoom + button increases zoom percentage', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // Zoom controls are in the canvas bottom-left:
    // <button>-</button><span>{zoom}%</span><button>+</button><button>FIT</button>
    // We need to be specific: get the zoom span showing "%", then click "+"
    // The zoom span is inside the canvas overlay (position: absolute, bottom: 12px, left: 12px)

    // Get initial zoom by reading the % span inside the zoom control cluster
    // The toolbar has no % span — only the canvas bottom-left cluster does
    const zoomSpan = page.locator('span').filter({ hasText: /%/ }).first();
    await expect(zoomSpan).toBeVisible();

    const initialText = await zoomSpan.textContent();
    const initialZoom = parseInt(initialText?.replace('%', '') ?? '100', 10);
    console.log(`[TC-03] Initial zoom: ${initialZoom}%`);

    // The "+" zoom button is near the zoom span; use its position context.
    // The zoom control div has: - | % | + | FIT
    // We locate the + button that immediately follows the zoom span
    // Using: button inside the zoom controls cluster that shows "+"
    // The button has text "+" and is inside position:absolute, bottom area
    // Strategy: click the last "+" button visible in the bottom area of the canvas
    const zoomInBtn = page.locator('button').filter({ hasText: /^\+$/ }).last();
    await expect(zoomInBtn).toBeVisible();
    await zoomInBtn.click();
    await page.waitForTimeout(400);

    const afterText = await zoomSpan.textContent();
    const afterZoom = parseInt(afterText?.replace('%', '') ?? '100', 10);
    console.log(`[TC-03] After zoom in: ${afterZoom}%`);

    expect(afterZoom).toBeGreaterThan(initialZoom);
    await ss(page, 'TC-03-zoom-in');
    console.log('[TC-03] PASS: zoom increased');
  });

  /* ─── TC-04: Zoom - button decreases zoom percentage ────────────── */
  test('TC-04: zoom - button decreases zoom percentage', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    const zoomSpan = page.locator('span').filter({ hasText: /%/ }).first();
    await expect(zoomSpan).toBeVisible();

    // First zoom in to have room to zoom out
    const zoomInBtn = page.locator('button').filter({ hasText: /^\+$/ }).last();
    await zoomInBtn.click();
    await page.waitForTimeout(200);

    const midText = await zoomSpan.textContent();
    const midZoom = parseInt(midText?.replace('%', '') ?? '100', 10);

    const zoomOutBtn = page.locator('button').filter({ hasText: /^-$/ }).last();
    await expect(zoomOutBtn).toBeVisible();
    await zoomOutBtn.click();
    await page.waitForTimeout(400);

    const afterText = await zoomSpan.textContent();
    const afterZoom = parseInt(afterText?.replace('%', '') ?? '100', 10);
    console.log(`[TC-04] Before: ${midZoom}%, After zoom out: ${afterZoom}%`);

    expect(afterZoom).toBeLessThan(midZoom);
    await ss(page, 'TC-04-zoom-out');
    console.log('[TC-04] PASS: zoom decreased');
  });

  /* ─── TC-05: Color picker appears when draw tool selected ────────── */
  test('TC-05: color picker shows 8 swatches when draw tool selected', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // Click the draw tool button (title includes "Freehand Draw")
    const drawBtn = page.locator('button[title*="Freehand Draw"]');
    await expect(drawBtn).toBeVisible();
    await drawBtn.click();
    await page.waitForTimeout(300);

    // DRAW_COLORS has 8 colors — each is a button with title = the hex color
    // They appear as small color swatch buttons (20x20 px) when draw tool active
    // The color swatches have title="<hex color>" format (e.g., title="#282828")
    const colorSwatches = page.locator('button[title^="#"]');
    const swatchCount = await colorSwatches.count();
    console.log(`[TC-05] Color swatch count: ${swatchCount}`);

    expect(swatchCount).toBeGreaterThanOrEqual(8);

    await ss(page, 'TC-05-color-picker-draw-tool');
    console.log('[TC-05] PASS: 8+ color swatches visible with draw tool active');
  });

  /* ─── TC-06: Thickness options appear when draw tool selected ──────── */
  test('TC-06: thickness options (1,2,3,5,8) appear with draw tool', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // Click draw tool
    const drawBtn = page.locator('button[title*="Freehand Draw"]');
    await drawBtn.click();
    await page.waitForTimeout(300);

    // DRAW_WIDTHS = [1, 2, 3, 5, 8] — each rendered as button with title="Npx"
    const widths = [1, 2, 3, 5, 8];
    for (const w of widths) {
      const widthBtn = page.locator(`button[title="${w}px"]`);
      await expect(widthBtn).toBeVisible({ timeout: 5_000 });
      console.log(`[TC-06] Width ${w}px button visible`);
    }

    await ss(page, 'TC-06-thickness-options');
    console.log('[TC-06] PASS: all 5 thickness options visible');
  });

  /* ─── TC-07: UNDO/REDO buttons exist in toolbar ─────────────────── */
  test('TC-07: UNDO and REDO buttons exist in toolbar', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // UNDO button: text "UNDO", title "Undo (Ctrl+Z)"
    const undoBtn = page.locator('button[title*="Undo"]');
    await expect(undoBtn).toBeVisible();

    // REDO button: text "REDO", title "Redo (Ctrl+Shift+Z)"
    const redoBtn = page.locator('button[title*="Redo"]');
    await expect(redoBtn).toBeVisible();

    // Also verify text content
    await expect(undoBtn).toContainText('UNDO');
    await expect(redoBtn).toContainText('REDO');

    await ss(page, 'TC-07-undo-redo-buttons');
    console.log('[TC-07] PASS: UNDO and REDO buttons visible');
  });

  /* ─── TC-08: Right-click canvas shows context menu ───────────────── */
  test('TC-08: right-click on empty canvas shows context menu', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // The canvas wrap div handles onContextMenu — right-click in the center
    // We need to find the canvas container (has the overflow:hidden and onContextMenu)
    // It's a div containing the <canvas> element
    const canvasWrap = page.locator('canvas').locator('..');
    await expect(canvasWrap).toBeVisible();

    // Right-click the canvas wrapper in a safe area
    await canvasWrap.click({ button: 'right', position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    // Context menu should appear with canvas options
    // "Add Sticky Note", "Add Media", "Zoom to Fit", "Undo", "Redo"
    const contextMenu = page.locator('button:has-text("Add Sticky Note")');
    await expect(contextMenu).toBeVisible({ timeout: 5_000 });

    await ss(page, 'TC-08-canvas-context-menu');

    // Dismiss context menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    console.log('[TC-08] PASS: canvas context menu visible on right-click');
  });

  /* ─── TC-09: Zoom controls in bottom-left ────────────────────────── */
  test('TC-09: zoom controls visible in bottom-left of canvas', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // Zoom controls are position:absolute, bottom:12px, left:12px inside the canvas wrapper
    // They contain: - button, % span, + button, FIT button
    const zoomSpan = page.locator('span').filter({ hasText: /%/ }).first();
    await expect(zoomSpan).toBeVisible();

    const fitBtn = page.locator('button').filter({ hasText: 'FIT' });
    await expect(fitBtn).toBeVisible();

    // Take screenshot showing the bottom-left of the canvas
    await ss(page, 'TC-09-zoom-controls-bottom-left');
    console.log('[TC-09] PASS: zoom controls visible in bottom-left');
  });

  /* ─── TC-10: Schema planner canvas right-click context menu ─────── */
  test('TC-10: schema planner canvas right-click shows context menu', async ({ page }) => {
    await signIn(page);
    const projectId = await goToSchema(page);
    console.log(`[TC-10] Using project: ${projectId}`);

    // Verify we're on schema page (toolbar LAYOUT button)
    await expect(page.locator('button:has-text("LAYOUT")').first()).toBeVisible({ timeout: 10_000 });

    // The schema canvas wrap div has onContextMenu (line 1695 in schema page.tsx).
    // It has className="relative border-2 border-dashed border-signal-black/20 overflow-hidden"
    // Use page.mouse.click with right button at a safe canvas coordinate.
    // The canvas takes up most of the vertical space (calc(100vh - 220px)).
    // We dispatch at roughly center-right of the canvas, away from entity cards which
    // tend to spawn near the top-left of the inner transform div.
    const canvasWrap = page.locator('.border-dashed.overflow-hidden').first();
    await expect(canvasWrap).toBeVisible({ timeout: 8_000 });

    const box = await canvasWrap.boundingBox();
    if (box) {
      // Click in the lower-right quadrant (less likely to hit entity cards)
      const clickX = box.x + box.width * 0.8;
      const clickY = box.y + box.height * 0.7;
      await page.mouse.click(clickX, clickY, { button: 'right' });
    } else {
      // Fallback: use absolute page coordinates
      await page.mouse.click(1200, 600, { button: 'right' });
    }
    await page.waitForTimeout(500);

    // Context menu should show: Add Entity, Add Relation, Add Enum, Auto Layout, Fit View
    const addEntityBtn = page.locator('button:has-text("Add Entity")');
    await expect(addEntityBtn).toBeVisible({ timeout: 5_000 });

    await ss(page, 'TC-10-schema-canvas-context-menu');

    // Dismiss by clicking elsewhere
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    // Also click on the page to close in case Escape doesn't close the menu
    await page.mouse.click(100, 100);
    await page.waitForTimeout(200);

    console.log('[TC-10] PASS: schema canvas context menu visible');
  });

  /* ─── TC-11: Schema entity right-click shows color swatches ─────── */
  test('TC-11: schema entity right-click context menu has color swatches', async ({ page }) => {
    await signIn(page);
    await goToSchema(page);

    await expect(page.locator('button:has-text("LAYOUT")').first()).toBeVisible({ timeout: 10_000 });

    // Entity cards are divs with class "shadow-nb bg-white overflow-hidden"
    // positioned absolutely inside the canvas. Check if any exist.
    const entityCards = page.locator('.shadow-nb.bg-white.overflow-hidden');
    const entityCount = await entityCards.count();
    console.log(`[TC-11] Entity card count: ${entityCount}`);

    if (entityCount === 0) {
      // Add an entity via the + ENTITY toolbar button
      console.log('[TC-11] No entities — adding one via + ENTITY');
      await page.locator('button:has-text("+ ENTITY")').first().click();
      await page.waitForTimeout(600);

      // The modal uses an input with placeholder "e.g. Users"
      const nameInput = page.locator('input[placeholder="e.g. Users"]');
      await expect(nameInput).toBeVisible({ timeout: 5_000 });
      await nameInput.fill('TestEntity');

      // Submit via "CREATE" button
      await page.locator('button:has-text("CREATE")').click();
      await page.waitForTimeout(1000);
    }

    // Now find the entity card
    const card = page.locator('.shadow-nb.bg-white.overflow-hidden').first();
    await expect(card).toBeVisible({ timeout: 8_000 });

    await ss(page, 'TC-11-before-entity-rightclick');

    // Right-click the entity card using page.mouse so pointer-events don't interfere
    const cardBox = await card.boundingBox();
    if (cardBox) {
      // Click in the header area of the card (top portion)
      await page.mouse.click(
        cardBox.x + cardBox.width / 2,
        cardBox.y + 16,  // near top = header area
        { button: 'right' }
      );
    } else {
      await card.click({ button: 'right' });
    }
    await page.waitForTimeout(500);

    // Entity context menu should have: Rename, Add Field, Color label + swatches, Delete
    const colorLabel = page.locator('div').filter({ hasText: /^Color$/ }).first();
    await expect(colorLabel).toBeVisible({ timeout: 5_000 });

    // Color swatches: HEADER_COLORS has 8 entries, each is a button with inline style
    // containing width/height 16px and background-color
    const contextMenuSwatches = page.locator('div.px-3.pb-2 button');
    const swatchCount = await contextMenuSwatches.count();
    console.log(`[TC-11] Color swatch count in entity context menu: ${swatchCount}`);
    expect(swatchCount).toBe(8);

    await ss(page, 'TC-11-entity-context-menu-color-swatches');

    // Dismiss
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.mouse.click(100, 100);

    console.log('[TC-11] PASS: entity context menu with 8 color swatches visible');
  });

  /* ─── TC-12: Press H key — hand tool activates ───────────────────── */
  test('TC-12: H key activates hand tool', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // First ensure select tool is active (click it)
    const selectBtn = page.locator('button[title*="Select"]');
    await selectBtn.click();
    await page.waitForTimeout(200);

    // Verify select is active (dark bg)
    const selectBg = await selectBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log(`[TC-12] Select tool bg: ${selectBg}`);

    // Press H to switch to hand tool
    await page.keyboard.press('h');
    await page.waitForTimeout(300);

    // Hand tool button should now be active (backgroundColor = #282828 = dark)
    const handBtn = page.locator('button[title*="Hand"]');
    const handBg = await handBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log(`[TC-12] Hand tool bg after H press: ${handBg}`);

    // Active state = dark background (#282828 = rgb(40, 40, 40))
    // Inactive state = white (#FFFFFF = rgb(255, 255, 255))
    // The bg should be dark (not white) when active
    expect(handBg).not.toBe('rgb(255, 255, 255)');

    await ss(page, 'TC-12-H-key-hand-tool');
    console.log('[TC-12] PASS: H key activates hand tool');
  });

  /* ─── TC-13: Press P key — draw tool activates ───────────────────── */
  test('TC-13: P key activates draw (freehand) tool', async ({ page }) => {
    await signIn(page);
    await goToWhiteboard(page);

    // First ensure select tool is active
    const selectBtn = page.locator('button[title*="Select"]');
    await selectBtn.click();
    await page.waitForTimeout(200);

    // Press P to switch to draw/freehand tool
    await page.keyboard.press('p');
    await page.waitForTimeout(300);

    // Draw tool button should now be active
    const drawBtn = page.locator('button[title*="Freehand Draw"]');
    const drawBg = await drawBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log(`[TC-13] Draw tool bg after P press: ${drawBg}`);

    // Active = dark bg
    expect(drawBg).not.toBe('rgb(255, 255, 255)');

    // Also verify color picker appeared (proof draw tool is active)
    const colorSwatches = page.locator('button[title^="#"]');
    const swatchCount = await colorSwatches.count();
    console.log(`[TC-13] Color swatch count (should be 8): ${swatchCount}`);
    expect(swatchCount).toBeGreaterThanOrEqual(8);

    await ss(page, 'TC-13-P-key-draw-tool');
    console.log('[TC-13] PASS: P key activates draw tool');
  });
});
