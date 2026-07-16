/**
 * Bug Investigation Spec
 * Documents 3 specific bugs with screenshots and console captures.
 *
 * Bug 1: Whiteboard marquee resize - bbox moves inversely from items
 * Bug 2: AI chat messages disappear when switching sessions
 * Bug 3: New chat creation delay
 */

import { test, expect } from './helpers';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  '../../../.docs/validation/bug-investigation/screenshots'
);
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const ADMIN_EMAIL = 'admin@ideamgmt.local';
const ADMIN_PASSWORD = 'AdminPass123!';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/signin');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|projects)/, { timeout: 15_000 });
  await page.waitForLoadState('domcontentloaded');
}

function ss(name: string) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

// ─────────────────────────────────────────────────
// BUG 1: Whiteboard marquee resize
// ─────────────────────────────────────────────────
test.describe('Bug 1: Whiteboard marquee resize', () => {
  test('reproduce marquee resize disconnect', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      consoleMessages.push(`[pageerror] ${err.message}`);
    });

    await page.setViewportSize({ width: 1536, height: 960 });
    await signIn(page);
    await page.screenshot({ path: ss('bug1-01-signed-in') });

    // Navigate to projects list to find a project
    await page.goto('/projects');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('bug1-02-projects-list') });

    // Click the first project
    const firstProject = page.locator('a[href*="/projects/"]').first();
    const projectHref = await firstProject.getAttribute('href');
    console.log('First project href:', projectHref);
    await firstProject.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('bug1-03-project-page') });

    // Navigate to whiteboard
    const currentUrl = page.url();
    // Extract project ID from URL
    const projectIdMatch = currentUrl.match(/\/projects\/([^/]+)/);
    const projectId = projectIdMatch ? projectIdMatch[1] : null;
    console.log('Project ID:', projectId);

    if (!projectId) {
      // Try clicking a whiteboard link
      const whiteboardLink = page.locator('a[href*="whiteboard"]').first();
      if (await whiteboardLink.count() > 0) {
        await whiteboardLink.click();
      } else {
        // Manually navigate to whiteboard tab
        await page.locator('text=Whiteboard').first().click();
      }
    } else {
      await page.goto(`/projects/${projectId}/whiteboard`);
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('bug1-04-whiteboard-page') });

    // Find the canvas
    const canvas = page.locator('canvas').first();
    const canvasBounds = await canvas.boundingBox();
    if (!canvasBounds) {
      console.log('Canvas not found');
      await page.screenshot({ path: ss('bug1-ERROR-no-canvas') });
      return;
    }
    console.log('Canvas bounds:', canvasBounds);

    // Step: Select the draw tool (pencil icon)
    // Look for draw tool button
    const drawBtn = page.locator('[title*="Freehand"], [title*="Draw"], [title*="draw"]').first();
    if (await drawBtn.count() > 0) {
      await drawBtn.click();
    } else {
      // Try keyboard shortcut P
      await page.keyboard.press('p');
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: ss('bug1-05-draw-tool-selected') });

    // Draw 3 strokes on the canvas
    const cx = canvasBounds.x + canvasBounds.width / 2;
    const cy = canvasBounds.y + canvasBounds.height / 2;

    // Stroke 1: upper-left area
    await page.mouse.move(cx - 150, cy - 100);
    await page.mouse.down();
    await page.mouse.move(cx - 100, cy - 80);
    await page.mouse.move(cx - 50, cy - 60);
    await page.mouse.move(cx, cy - 50);
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.screenshot({ path: ss('bug1-06-stroke1') });

    // Stroke 2: middle area
    await page.mouse.move(cx - 80, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 40, cy + 20);
    await page.mouse.move(cx + 20, cy + 40);
    await page.mouse.move(cx + 80, cy + 60);
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.screenshot({ path: ss('bug1-07-stroke2') });

    // Stroke 3: lower-right area
    await page.mouse.move(cx + 50, cy - 30);
    await page.mouse.down();
    await page.mouse.move(cx + 80, cy);
    await page.mouse.move(cx + 100, cy + 30);
    await page.mouse.move(cx + 120, cy + 60);
    await page.mouse.up();
    await page.waitForTimeout(400);
    await page.screenshot({ path: ss('bug1-08-all-three-strokes') });

    // Step: Switch to select tool
    const selectBtn = page.locator('[title*="Select"]').first();
    if (await selectBtn.count() > 0) {
      await selectBtn.click();
    } else {
      await page.keyboard.press('v');
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: ss('bug1-09-select-tool-active') });

    // Step: Click empty area to deselect, then drag marquee around all strokes
    // Click away first to clear any selection
    await page.mouse.click(cx + 300, cy + 300);
    await page.waitForTimeout(200);

    // Drag marquee selection around all three strokes
    // Start from well above-left of all strokes, end below-right
    const marqueeStartX = cx - 200;
    const marqueeStartY = cy - 150;
    const marqueeEndX = cx + 160;
    const marqueeEndY = cy + 100;

    await page.mouse.move(marqueeStartX, marqueeStartY);
    await page.mouse.down();
    await page.mouse.move(cx - 150, cy - 100);
    await page.mouse.move(cx, cy - 50);
    await page.mouse.move(cx + 80, cy + 50);
    await page.mouse.move(marqueeEndX, marqueeEndY);
    await page.waitForTimeout(200);
    await page.screenshot({ path: ss('bug1-10-marquee-dragging') });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('bug1-11-marquee-selection-complete') });

    // Step: Look for the selection bbox and resize handle
    // The bbox is a dashed purple border div, resize handle is a small purple square
    const bboxOverlay = page.locator('div[style*="dashed"][style*="A259FF"]').first();
    const resizeHandle = page.locator('div[style*="nwse-resize"]').first();
    const rotateHandle = page.locator('div[style*="grab"][style*="borderRadius"]').first();

    const hasBbox = await bboxOverlay.count() > 0;
    const hasResize = await resizeHandle.count() > 0;
    console.log('Has bbox:', hasBbox, 'Has resize handle:', hasResize);

    if (!hasBbox) {
      await page.screenshot({ path: ss('bug1-ERROR-no-bbox-after-marquee') });
      console.log('No bbox appeared - marquee selection may not have worked');
      // Try a different approach - drag from clear area
      await page.mouse.move(cx - 250, cy - 200);
      await page.mouse.down();
      await page.mouse.move(cx + 200, cy + 150);
      await page.mouse.up();
      await page.waitForTimeout(500);
      await page.screenshot({ path: ss('bug1-12-retry-marquee') });
    } else {
      await page.screenshot({ path: ss('bug1-12-bbox-visible') });

      // Get the resize handle position
      const resizeBounds = await resizeHandle.boundingBox();
      console.log('Resize handle bounds:', resizeBounds);

      if (resizeBounds) {
        // Screenshot showing positions BEFORE resize
        await page.screenshot({ path: ss('bug1-13-before-resize') });

        // Click on resize handle and drag
        const handleCenterX = resizeBounds.x + resizeBounds.width / 2;
        const handleCenterY = resizeBounds.y + resizeBounds.height / 2;

        await page.mouse.move(handleCenterX, handleCenterY);
        await page.waitForTimeout(200);
        await page.screenshot({ path: ss('bug1-14-hover-resize-handle') });

        // Start drag on resize handle
        await page.mouse.down();
        await page.waitForTimeout(100);

        // Move to the right and down (expanding)
        await page.mouse.move(handleCenterX + 40, handleCenterY + 40);
        await page.waitForTimeout(100);
        await page.screenshot({ path: ss('bug1-15-resize-dragging-step1') });

        await page.mouse.move(handleCenterX + 80, handleCenterY + 80);
        await page.waitForTimeout(100);
        await page.screenshot({ path: ss('bug1-16-resize-dragging-step2-disconnect') });

        await page.mouse.move(handleCenterX + 120, handleCenterY + 120);
        await page.waitForTimeout(100);
        await page.screenshot({ path: ss('bug1-17-resize-dragging-step3') });

        await page.mouse.up();
        await page.waitForTimeout(500);
        await page.screenshot({ path: ss('bug1-18-after-resize-final-state') });
      }
    }

    // Log any console errors
    if (consoleMessages.length > 0) {
      console.log('Console messages during Bug 1:', consoleMessages.join('\n'));
    }
    // Save console log to file
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'bug1-console.txt'),
      consoleMessages.join('\n') || '(no console errors)'
    );
  });
});

// ─────────────────────────────────────────────────
// BUG 2: AI chat messages disappear when switching sessions
// ─────────────────────────────────────────────────
test.describe('Bug 2: AI chat session persistence', () => {
  test('messages disappear when switching sessions', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      consoleMessages.push(`[pageerror] ${err.message}`);
    });

    await page.setViewportSize({ width: 1536, height: 960 });
    await signIn(page);

    // Step 1: Navigate to /ai
    await page.goto('/ai');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('bug2-01-ai-page-initial') });

    // Step 2: Send a message in the current/default session
    const messageInput = page.locator('textarea, input[type="text"]').filter({ hasText: '' }).last();
    // Try to find the chat input
    const chatInput = page.locator('textarea').first();
    if (await chatInput.count() === 0) {
      await page.screenshot({ path: ss('bug2-ERROR-no-input') });
      console.log('No chat input found');
      return;
    }

    await chatInput.click();
    await chatInput.fill('Hello test message 1');
    await page.screenshot({ path: ss('bug2-02-typed-message1') });

    // Send with Enter or button
    await chatInput.press('Enter');
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('bug2-03-message1-sent') });

    // Wait for AI response (up to 30 seconds)
    const startTime = Date.now();
    let responseReceived = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      // Check if there's a response message (look for assistant message elements)
      const messages = page.locator('[data-role="assistant"], .message-assistant, [class*="assistant"]');
      if (await messages.count() > 0) {
        responseReceived = true;
        break;
      }
      // Also check if any new text appeared after user message
      const allMessages = page.locator('[class*="message"], [class*="chat"]');
      if (await allMessages.count() >= 2) {
        responseReceived = true;
        break;
      }
    }
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Bug 2: Response received: ${responseReceived}, time: ${responseTime}s`);
    await page.screenshot({ path: ss('bug2-04-session1-with-response') });

    // Step 3: Look for "New Chat" button and click it
    const newChatBtn = page.locator('button').filter({ hasText: /new chat|new session/i }).first();
    const altNewChatBtn = page.locator('[title*="New"], [aria-label*="New"]').first();

    let newChatClicked = false;
    if (await newChatBtn.count() > 0) {
      await newChatBtn.click();
      newChatClicked = true;
    } else if (await altNewChatBtn.count() > 0) {
      await altNewChatBtn.click();
      newChatClicked = true;
    } else {
      // Look for + button in sidebar
      const plusBtn = page.locator('button[class*="new"], button svg').filter({ has: page.locator('path[d*="plus"], path[d*="M12"]') }).first();
      if (await plusBtn.count() > 0) {
        await plusBtn.click();
        newChatClicked = true;
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('bug2-05-after-new-chat-click') });
    console.log('New chat clicked:', newChatClicked);

    if (!newChatClicked) {
      // Try finding new chat button with broader search
      await page.screenshot({ path: ss('bug2-ERROR-no-new-chat-button') });

      // Look at all buttons text
      const buttons = page.locator('button');
      const count = await buttons.count();
      const buttonTexts: string[] = [];
      for (let i = 0; i < Math.min(count, 20); i++) {
        const text = await buttons.nth(i).textContent();
        buttonTexts.push(`btn[${i}]: "${text?.trim()}"`);
      }
      console.log('All buttons:', buttonTexts.join(', '));
      fs.writeFileSync(path.join(SCREENSHOT_DIR, 'bug2-buttons.txt'), buttonTexts.join('\n'));
    }

    // Step 4: Send second message in new session
    const chatInput2 = page.locator('textarea').first();
    if (await chatInput2.count() > 0) {
      await chatInput2.click();
      await chatInput2.fill('Hello test message 2');
      await page.screenshot({ path: ss('bug2-06-typed-message2') });
      await chatInput2.press('Enter');
      await page.waitForTimeout(500);
      await page.screenshot({ path: ss('bug2-07-message2-sent') });

      // Wait for response
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1000);
        const allMessages = page.locator('[class*="message"], [class*="chat"]');
        if (await allMessages.count() >= 2) break;
      }
      await page.screenshot({ path: ss('bug2-08-session2-with-response') });
    }

    // Step 5: Click back on first session in sidebar
    // Sessions are usually listed in sidebar - look for session items
    const sessionItems = page.locator('[class*="session"], [class*="chat-item"], [class*="history"]');
    const sessionCount = await sessionItems.count();
    console.log('Session items visible:', sessionCount);

    if (sessionCount >= 2) {
      // Click the first session (which should be session 1)
      await sessionItems.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: ss('bug2-09-switched-back-to-session1') });

      // Check if messages from session 1 are visible
      const session1Messages = page.locator('[class*="message"]');
      const msgCount = await session1Messages.count();
      console.log('Messages visible in session 1 after switch:', msgCount);

      // Look for "Hello test message 1" text
      const msg1Text = page.getByText('Hello test message 1');
      const msg1Visible = await msg1Text.count() > 0;
      console.log('Session 1 message 1 visible:', msg1Visible);

      await page.screenshot({ path: ss('bug2-10-session1-after-switch') });
    } else {
      await page.screenshot({ path: ss('bug2-WARNING-insufficient-sessions') });
      console.log('Could not find enough session items to switch between');

      // Log all visible text to understand the layout
      const bodyText = await page.locator('body').textContent();
      fs.writeFileSync(path.join(SCREENSHOT_DIR, 'bug2-page-text.txt'), bodyText?.substring(0, 3000) || '');
    }

    // Step 6: Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('bug2-11-after-refresh') });

    // Check if any messages are visible after refresh
    const messagesAfterRefresh = page.locator('[class*="message"]');
    const msgCountAfterRefresh = await messagesAfterRefresh.count();
    console.log('Messages visible after refresh:', msgCountAfterRefresh);

    // Check for session restoration
    const sessionAfterRefresh = page.locator('[class*="session"], [class*="chat-item"]');
    const sessionCountAfterRefresh = await sessionAfterRefresh.count();
    console.log('Sessions visible after refresh:', sessionCountAfterRefresh);

    await page.screenshot({ path: ss('bug2-12-final-state-after-refresh') });

    // Save console log
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'bug2-console.txt'),
      consoleMessages.join('\n') || '(no console errors)'
    );
  });
});

// ─────────────────────────────────────────────────
// BUG 3: New chat creation delay
// ─────────────────────────────────────────────────
test.describe('Bug 3: New chat creation delay', () => {
  test('measure time for new session to appear and respond', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.setViewportSize({ width: 1536, height: 960 });
    await signIn(page);

    await page.goto('/ai');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('bug3-01-ai-initial') });

    // Time: click New Chat
    const t0 = Date.now();
    const newChatBtn = page.locator('button').filter({ hasText: /new chat|new session/i }).first();
    if (await newChatBtn.count() > 0) {
      await newChatBtn.click();
    }
    await page.waitForTimeout(500);
    const t1 = Date.now();
    await page.screenshot({ path: ss('bug3-02-new-chat-clicked') });
    console.log(`Time from new chat click to 500ms later: ${t1 - t0}ms`);

    // Type and send a message
    const chatInput = page.locator('textarea').first();
    if (await chatInput.count() > 0) {
      await chatInput.click();
      await chatInput.fill('Hello test message 2');
      await page.screenshot({ path: ss('bug3-03-typed-message') });

      const tSend = Date.now();
      await chatInput.press('Enter');
      await page.waitForTimeout(200);
      await page.screenshot({ path: ss('bug3-04-message-sent') });

      // Wait for session to appear in sidebar
      let sessionAppeared = false;
      let sessionAppearTime = 0;
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(500);
        const sessions = page.locator('[class*="session"], [class*="chat-item"], [class*="history"]');
        if (await sessions.count() > 0) {
          sessionAppeared = true;
          sessionAppearTime = Date.now() - tSend;
          break;
        }
      }
      console.log(`Session appeared in sidebar: ${sessionAppeared}, delay: ${sessionAppearTime}ms`);
      await page.screenshot({ path: ss('bug3-05-waiting-for-session') });

      // Wait for response to start
      let responseStarted = false;
      let responseStartTime = 0;
      for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(1000);
        const assistantMsgs = page.locator('[data-role="assistant"], [class*="assistant-message"]');
        if (await assistantMsgs.count() > 0) {
          responseStarted = true;
          responseStartTime = Date.now() - tSend;
          break;
        }
        // Check if any new message appeared (beyond user's)
        const allMsgs = page.locator('[class*="message"]');
        if (await allMsgs.count() >= 2) {
          responseStarted = true;
          responseStartTime = Date.now() - tSend;
          break;
        }
      }
      console.log(`Response started: ${responseStarted}, delay from send: ${responseStartTime}ms`);
      await page.screenshot({ path: ss('bug3-06-response-started') });

      // Wait for response to finish (no loading indicator)
      await page.waitForTimeout(5000);
      await page.screenshot({ path: ss('bug3-07-final-state') });

      // Save timing info
      const timingReport = [
        `New chat click -> page ready: ${t1 - t0}ms`,
        `Session appeared in sidebar: ${sessionAppeared ? `YES, after ${sessionAppearTime}ms` : 'NO (within 7.5s)'}`,
        `Response started: ${responseStarted ? `YES, after ${responseStartTime}ms` : 'NO (within 30s)'}`,
      ].join('\n');
      console.log('Timing report:\n', timingReport);
      fs.writeFileSync(path.join(SCREENSHOT_DIR, 'bug3-timing.txt'), timingReport);
    }

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'bug3-console.txt'),
      consoleMessages.join('\n') || '(no console messages)'
    );
  });
});
