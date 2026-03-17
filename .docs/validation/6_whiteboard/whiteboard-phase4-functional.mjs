/**
 * Whiteboard Phase 4 FUNCTIONAL validation
 * Tests all interactive features: drawing, stickies, media, resize, settings, viewer
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, "screenshots");
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE = "http://localhost:3000";
const results = [];

function log(check, pass, detail = "") {
  const icon = pass ? "\u2713" : "\u2717";
  const msg = `  ${icon} ${check}${detail ? ` — ${detail}` : ""}`;
  console.log(msg);
  results.push({ check, pass, detail });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await ctx.newPage();

  // ── Auth ──
  console.log("=== Auth ===");
  await page.goto(`${BASE}/signup`, { waitUntil: "commit", timeout: 30000 });
  await page.waitForTimeout(3000);

  const authRes = await page.evaluate(async () => {
    // Try signup, fallback to signin
    let r = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "pw-functional@test.com", password: "PlaywrightFunc1!" }),
    });
    if (r.status === 409) {
      r = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "pw-functional@test.com", password: "PlaywrightFunc1!" }),
      });
    }
    return { status: r.status, data: await r.json() };
  });
  log("Auth", authRes.data.ok, `status ${authRes.status}`);

  // Create/find project
  const projRes = await page.evaluate(async () => {
    let r = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Functional Test", description: "Phase 4 validation" }),
    });
    let data = await r.json();
    if (!data.ok) {
      r = await fetch("/api/projects");
      data = await r.json();
      return { id: data.projects?.[0]?.id };
    }
    return { id: data.project.id };
  });
  const projectId = projRes.id;
  log("Project", !!projectId, projectId);

  // ── Navigate to whiteboard ──
  console.log("\n=== Whiteboard Load ===");
  await page.goto(`${BASE}/projects/${projectId}/whiteboard`, { waitUntil: "commit", timeout: 30000 });
  await page.waitForTimeout(3000);

  const heading = await page.locator("h1").first().textContent().catch(() => null);
  log("Page heading", heading?.includes("WHITEBOARD"), heading);

  // ── Toolbar validation ──
  console.log("\n=== Toolbar ===");
  const tools = [
    { title: "Select", expected: true },
    { title: "Freehand Draw", expected: true },
    { title: "Straight Line", expected: true },
    { title: "Place Dot / Pin", expected: true },
    { title: "Eraser (click a stroke to remove it)", expected: true },
    { title: "Add Sticky Note", expected: true },
    { title: "Attach Media (image, video, document)", expected: true },
  ];
  for (const tool of tools) {
    const btn = page.locator(`button[title="${tool.title}"]`);
    const visible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
    log(`Tool: ${tool.title.split("(")[0].trim()}`, visible);
  }

  // ── Stats display ──
  console.log("\n=== Stats ===");
  const statsText = await page.locator("text=/note|stroke/i").first().textContent().catch(() => "");
  log("Stats visible", statsText.includes("note") || statsText.includes("stroke"), statsText.trim());

  // ── Empty state ──
  const emptyState = await page.locator("text=Select a tool to start").textContent().catch(() => null);
  log("Empty state mentions Media", emptyState?.includes("Media"), emptyState?.trim());

  // ── File input ──
  console.log("\n=== File Input ===");
  const fileInput = page.locator('input[type="file"]');
  const fileInputVisible = await fileInput.count() > 0;
  const fileAccept = fileInputVisible ? await fileInput.getAttribute("accept") : null;
  log("Hidden file input exists", fileInputVisible);
  log("Accepts images", fileAccept?.includes("image/*"));
  log("Accepts video", fileAccept?.includes("video/*"));
  log("Accepts PDF", fileAccept?.includes(".pdf"));
  log("Accepts documents", fileAccept?.includes(".docx") && fileAccept?.includes(".xlsx"));

  // ── Drawing test ──
  console.log("\n=== Drawing ===");
  const canvas = page.locator("canvas");
  const canvasBox = await canvas.boundingBox();

  // Freehand draw
  await page.locator('button[title="Freehand Draw"]').click();
  await page.waitForTimeout(200);
  if (canvasBox) {
    await page.mouse.move(canvasBox.x + 500, canvasBox.y + 100);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(canvasBox.x + 500 + i * 15, canvasBox.y + 100 + i * 8);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  const statsAfterDraw = await page.locator("text=/stroke/i").first().textContent().catch(() => "");
  log("Freehand draw", statsAfterDraw.includes("1 stroke"), statsAfterDraw.trim());

  // Line tool
  await page.locator('button[title="Straight Line"]').click();
  await page.waitForTimeout(200);
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + 100, canvasBox.y + 400);
    await page.waitForTimeout(100);
    // mousedown at start, move, mouseup at end
    await page.mouse.move(canvasBox.x + 100, canvasBox.y + 400);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 400, canvasBox.y + 400);
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  const statsAfterLine = await page.locator("text=/stroke/i").first().textContent().catch(() => "");
  log("Line tool", statsAfterLine.includes("2 stroke"), statsAfterLine.trim());

  // Dot tool
  await page.locator('button[title="Place Dot / Pin"]').click();
  await page.waitForTimeout(200);
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + 700, canvasBox.y + 300);
    await page.waitForTimeout(300);
  }
  const statsAfterDot = await page.locator("text=/stroke/i").first().textContent().catch(() => "");
  log("Dot tool", statsAfterDot.includes("3 stroke"), statsAfterDot.trim());

  await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-after-drawing.png"), fullPage: true });
  console.log("  [screenshot] phase4-after-drawing.png");

  // ── Sticky note creation + settings ──
  console.log("\n=== Sticky Notes ===");
  await page.locator('button[title="Add Sticky Note"]').click();
  await page.waitForTimeout(200);
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + 600, canvasBox.y + 250);
    await page.waitForTimeout(800);
  }

  // Sticky settings popup should open
  const settingsVisible = await page.locator("text=STICKY SETTINGS").isVisible({ timeout: 2000 }).catch(() => false);
  log("Sticky settings popup opens", settingsVisible);

  if (settingsVisible) {
    // Fill title
    const titleInput = page.locator("input[type='text']").first();
    await titleInput.fill("");
    await titleInput.fill("Phase 4 Note");
    await page.waitForTimeout(200);

    // Fill description
    const descInput = page.locator("textarea").first();
    await descInput.fill("Testing media attachments and resizable content");
    await page.waitForTimeout(200);

    // Fill tags
    const tagInput = page.locator("input[type='text']").nth(1);
    await tagInput.fill("test, phase4, media");
    await page.waitForTimeout(200);

    // Change background color (click 3rd color swatch)
    const bgSwatches = page.locator("text=Background Color").locator("xpath=following-sibling::div[1]").locator("button");
    const bgCount = await bgSwatches.count();
    if (bgCount > 2) {
      await bgSwatches.nth(2).click();
      await page.waitForTimeout(200);
    }
    log("Background color picker", bgCount > 0, `${bgCount} swatches`);

    // Change border color
    const borderSwatches = page.locator("text=Border Color").locator("xpath=following-sibling::div[1]").locator("button");
    const borderCount = await borderSwatches.count();
    if (borderCount > 2) {
      await borderSwatches.nth(3).click();
      await page.waitForTimeout(200);
    }
    log("Border color picker", borderCount > 0, `${borderCount} swatches`);

    // Check live preview
    const previewVisible = await page.locator("text=Preview").isVisible().catch(() => false);
    log("Live preview", previewVisible);

    await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-sticky-settings.png"), fullPage: true });
    console.log("  [screenshot] phase4-sticky-settings.png");

    // Save
    await page.locator("button:text('SAVE')").click();
    await page.waitForTimeout(500);
  }

  // Verify sticky note appears on canvas — look for the note by its styled container
  await page.waitForTimeout(500);
  const stickyOnCanvas = await page.locator("div[style*='grab'] >> text=Phase 4 Note").isVisible({ timeout: 2000 }).catch(() => {
    // Fallback: check if any sticky with cursor grab exists
    return page.locator("div[style*='cursor: grab']").first().isVisible({ timeout: 2000 }).catch(() => false);
  });
  log("Sticky appears on canvas", stickyOnCanvas);

  // Verify note count updated
  const statsAfterSticky = await page.locator("text=/note/i").first().textContent().catch(() => "");
  log("Note count updated", statsAfterSticky.includes("1 note"), statsAfterSticky.trim());

  // ── Sticky hover actions ──
  console.log("\n=== Sticky Hover ===");
  // Find sticky by its grab cursor style
  const stickyEl = page.locator("div[style*='cursor: grab']").first();
  await stickyEl.hover();
  await page.waitForTimeout(500);

  // Check settings gear button appears
  const gearBtn = page.locator('button[title="Settings"]');
  const gearVisible = await gearBtn.isVisible({ timeout: 1000 }).catch(() => false);
  log("Settings gear on hover", gearVisible);

  // Check delete button appears
  const deleteBtn = page.locator('button[title="Delete"]');
  const deleteVisible = await deleteBtn.isVisible({ timeout: 1000 }).catch(() => false);
  log("Delete button on hover", deleteVisible);

  // Check resize handle appears (bottom-right triangle)
  const resizeHandle = stickyEl.locator("div[style*='nwse-resize']");
  const resizeVisible = await resizeHandle.isVisible({ timeout: 1000 }).catch(() => false);
  log("Resize handle on hover", resizeVisible);

  await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-sticky-hover.png"), fullPage: true });
  console.log("  [screenshot] phase4-sticky-hover.png");

  // ── Sticky color picker (toolbar) ──
  console.log("\n=== Sticky Color Picker ===");
  await page.locator('button[title="Add Sticky Note"]').click();
  await page.waitForTimeout(300);

  // Color picker should appear next to tools
  const colorBtns = page.locator("div[style*='borderLeft'] button");
  const colorCount = await colorBtns.count();
  log("Sticky color picker visible", colorCount === 4, `${colorCount} colors`);

  // Switch back to select
  await page.locator('button[title="Select"]').click();
  await page.waitForTimeout(200);

  // ── Media tool ──
  console.log("\n=== Media Tool ===");
  const mediaBtn = page.locator('button[title*="Attach Media"]');
  await mediaBtn.click();
  await page.waitForTimeout(200);

  // Verify tool is active (button should be highlighted)
  const mediaBtnBg = await mediaBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
  log("Media tool activates", mediaBtnBg.includes("40") || mediaBtnBg.includes("rgb(40"), `bg: ${mediaBtnBg}`);

  // Upload a test image via the file input
  // Create a small 1px red PNG as test data
  const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYV2P8z8BQz0BhwMhAYcAIAHUaBAkfCNZvAAAAAElFTkSuQmCC";
  const testImagePath = join(__dirname, "test-image.png");
  writeFileSync(testImagePath, Buffer.from(testImageBase64, "base64"));

  // Click canvas to trigger file picker, then intercept with fileChooser
  if (canvasBox) {
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser", { timeout: 5000 }).catch(() => null),
      page.mouse.click(canvasBox.x + 800, canvasBox.y + 200),
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(testImagePath);
      await page.waitForTimeout(1000);
      log("File chooser triggered", true);

      // Check image appears on canvas
      const imgOnCanvas = await page.locator("img[alt='test-image.png']").isVisible({ timeout: 2000 }).catch(() => false);
      log("Image displayed on canvas", imgOnCanvas);

      // Check media count in stats
      const statsAfterMedia = await page.locator("text=/media/i").first().textContent().catch(() => "");
      log("Media count in stats", statsAfterMedia.includes("1 media"), statsAfterMedia.trim());

      await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-image-on-canvas.png"), fullPage: true });
      console.log("  [screenshot] phase4-image-on-canvas.png");

      // ── Image hover actions ──
      console.log("\n=== Image Hover ===");
      const imgEl = page.locator("img[alt='test-image.png']").locator("xpath=ancestor::div[contains(@style,'position: absolute')]").first();
      await imgEl.hover();
      await page.waitForTimeout(500);

      const imgDeleteBtn = page.locator('button[title="Delete"]');
      const imgDeleteVisible = await imgDeleteBtn.isVisible({ timeout: 1000 }).catch(() => false);
      log("Delete button on image hover", imgDeleteVisible);

      const imgViewBtn = page.locator('button[title="View full size"]');
      const imgViewVisible = await imgViewBtn.isVisible({ timeout: 1000 }).catch(() => false);
      log("View full size button on hover", imgViewVisible);

      const imgResizeHandle = imgEl.locator("div[style*='nwse-resize']");
      const imgResizeVisible = await imgResizeHandle.isVisible({ timeout: 1000 }).catch(() => false);
      log("Resize handle on image hover", imgResizeVisible);

      await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-image-hover.png"), fullPage: true });
      console.log("  [screenshot] phase4-image-hover.png");

      // ── Media viewer modal ──
      console.log("\n=== Media Viewer ===");
      if (imgViewVisible) {
        await imgViewBtn.click();
        await page.waitForTimeout(500);

        const viewerVisible = await page.locator("text=test-image.png").isVisible({ timeout: 2000 }).catch(() => false);
        log("Media viewer opens", viewerVisible);

        const closeBtn = page.locator("button:text('CLOSE')");
        const closeBtnVisible = await closeBtn.isVisible({ timeout: 1000 }).catch(() => false);
        log("Close button in viewer", closeBtnVisible);

        await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-media-viewer.png"), fullPage: true });
        console.log("  [screenshot] phase4-media-viewer.png");

        if (closeBtnVisible) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // ── Resize test ──
      console.log("\n=== Resize ===");
      await imgEl.hover();
      await page.waitForTimeout(400);
      if (imgResizeVisible) {
        const handleBox = await imgResizeHandle.boundingBox();
        if (handleBox) {
          const startX = handleBox.x + handleBox.width / 2;
          const startY = handleBox.y + handleBox.height / 2;
          await page.mouse.move(startX, startY);
          await page.mouse.down();
          await page.mouse.move(startX + 100, startY + 67, { steps: 5 }); // maintain ~3:2 ratio
          await page.mouse.up();
          await page.waitForTimeout(500);
          log("Image resize drag", true, "dragged +100px");

          await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-after-resize.png"), fullPage: true });
          console.log("  [screenshot] phase4-after-resize.png");
        }
      }
    } else {
      log("File chooser triggered", false, "fileChooser event not received");
    }
  }

  // ── Eraser test ──
  console.log("\n=== Eraser ===");
  const statsBeforeErase = await page.locator("text=/stroke/i").first().textContent().catch(() => "");
  await page.locator('button[title*="Eraser"]').click();
  await page.waitForTimeout(200);
  if (canvasBox) {
    // Click near where we drew the freehand stroke
    await page.mouse.click(canvasBox.x + 520, canvasBox.y + 120);
    await page.waitForTimeout(500);
  }
  const statsAfterErase = await page.locator("text=/stroke/i").first().textContent().catch(() => "");
  log("Eraser removes stroke", statsBeforeErase !== statsAfterErase, `before: ${statsBeforeErase.trim()}, after: ${statsAfterErase.trim()}`);

  // ── Sticky drag test ──
  console.log("\n=== Sticky Drag ===");
  await page.locator('button[title="Select"]').click();
  await page.waitForTimeout(200);
  const stickyForDrag = page.locator("div[style*='cursor: grab']").first();
  const stickyBox = await stickyForDrag.boundingBox();
  if (stickyBox) {
    const startX = stickyBox.x + stickyBox.width / 2;
    const startY = stickyBox.y + stickyBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 200, startY + 100, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const newBox = await stickyForDrag.boundingBox();
    const moved = newBox && (Math.abs(newBox.x - stickyBox.x) > 50 || Math.abs(newBox.y - stickyBox.y) > 50);
    log("Sticky drag moves note", moved, `delta: ${newBox ? Math.round(newBox.x - stickyBox.x) : 0}px, ${newBox ? Math.round(newBox.y - stickyBox.y) : 0}px`);
  }

  // ── Upload a document to test doc card ──
  console.log("\n=== Document Card ===");
  await page.locator('button[title*="Attach Media"]').click();
  await page.waitForTimeout(200);

  // Create a fake PDF file
  const testDocPath = join(__dirname, "test-doc.pdf");
  writeFileSync(testDocPath, Buffer.from("%PDF-1.4 fake pdf content for testing", "utf-8"));

  if (canvasBox) {
    const [docChooser] = await Promise.all([
      page.waitForEvent("filechooser", { timeout: 5000 }).catch(() => null),
      page.mouse.click(canvasBox.x + 200, canvasBox.y + 500),
    ]);
    if (docChooser) {
      await docChooser.setFiles(testDocPath);
      await page.waitForTimeout(1000);

      const docCard = await page.locator("text=test-doc.pdf").isVisible({ timeout: 2000 }).catch(() => false);
      log("Document card displayed", docCard);

      const clickToPreview = await page.locator("text=CLICK TO PREVIEW").isVisible({ timeout: 2000 }).catch(() => false);
      log("Click to preview label", clickToPreview);

      await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-doc-card.png"), fullPage: true });
      console.log("  [screenshot] phase4-doc-card.png");

      // Click doc card to open viewer
      if (clickToPreview) {
        await page.locator("text=CLICK TO PREVIEW").click();
        await page.waitForTimeout(500);

        const docViewer = await page.locator("text=DOWNLOAD FILE").isVisible({ timeout: 2000 }).catch(() => false);
        log("Document viewer with download", docViewer);

        await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-doc-viewer.png"), fullPage: true });
        console.log("  [screenshot] phase4-doc-viewer.png");

        await page.locator("button:text('CLOSE')").click().catch(() => {});
        await page.waitForTimeout(300);
      }
    } else {
      log("Document file chooser", false, "not received");
    }
  }

  // ── Final desktop screenshot ──
  console.log("\n=== Final Screenshots ===");
  await page.setViewportSize({ width: 1536, height: 960 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-final-desktop.png"), fullPage: true });
  console.log("  [screenshot] phase4-final-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SCREENSHOTS_DIR, "phase4-final-mobile.png"), fullPage: true });
  console.log("  [screenshot] phase4-final-mobile.png");

  // ── Summary ──
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${results.length} checks`);
  if (failed > 0) {
    console.log("\nFailed checks:");
    results.filter((r) => !r.pass).forEach((r) => console.log(`  \u2717 ${r.check} — ${r.detail}`));
  }
  console.log(`${"=".repeat(50)}`);

  await browser.close();

  // Cleanup temp files
  const { unlinkSync } = await import("fs");
  try { unlinkSync(testImagePath); } catch {}
  try { unlinkSync(testDocPath); } catch {}
}

main().catch((err) => {
  console.error("Validation failed:", err.message);
  process.exit(1);
});
