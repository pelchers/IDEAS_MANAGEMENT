/* ============================================================
   Generative Geometry — Pass 1
   Recursive Circle Packing  |  p5.js v1.11.3
   ============================================================ */

// --------------- Palette ---------------
const PALETTE = {
  primary:   [225, 29, 72],    // #E11D48  rose
  secondary: [124, 58, 237],   // #7C3AED  violet
  pink:      [236, 72, 153],   // #EC4899  pink
  grayWarm:  [168, 162, 158],  // #A8A29E
  grayDeep:  [120, 113, 108],  // #78716C
  bg:        [250, 250, 249],  // #FAFAF9
};

function depthColor(depth) {
  switch (depth) {
    case 0: return PALETTE.primary;
    case 1: return PALETTE.secondary;
    case 2: return PALETTE.pink;
    default:
      return depth % 2 === 1 ? PALETTE.grayWarm : PALETTE.grayDeep;
  }
}

function strokeForDepth(depth) {
  // Slightly darker stroke per depth
  const base = depthColor(depth);
  return base.map(c => Math.max(0, c - 40));
}

// --------------- State ---------------
let circles = [];
let currentSeed = 0;
let minRadius = 3;
let maxDepth = 3;
let canvasW = 800;
let canvasH = 600;
let p5Canvas;

// --------------- DOM refs ---------------
const elSeedDisplay  = () => document.getElementById('seed-display');
const elFooterSeed   = () => document.getElementById('footer-seed');
const elMinRadius    = () => document.getElementById('slider-min-radius');
const elMaxDepth     = () => document.getElementById('slider-max-depth');
const elValMinRadius = () => document.getElementById('val-min-radius');
const elValMaxDepth  = () => document.getElementById('val-max-depth');
const elBtnRegen     = () => document.getElementById('btn-regenerate');

// --------------- Circle Packing ---------------

/**
 * Pack circles inside a bounding circle (cx, cy, boundR).
 * If boundR is null, pack inside the full rectangular canvas.
 * Returns an array of { x, y, r, depth } objects.
 */
function packCircles(cx, cy, boundR, depth, maxAttempts, minR, maxD) {
  const packed = [];
  if (depth > maxD) return packed;

  const isRootLevel = (boundR === null);
  let attempts = 0;
  let failedInARow = 0;
  const maxFailedInARow = maxAttempts;

  while (failedInARow < maxFailedInARow) {
    attempts++;
    if (attempts > maxAttempts * 3) break;

    // Random candidate position
    let px, py;
    if (isRootLevel) {
      px = random(0, canvasW);
      py = random(0, canvasH);
    } else {
      // Random point inside bounding circle
      const angle = random(TWO_PI);
      const dist  = random(0, boundR);
      px = cx + cos(angle) * dist;
      py = cy + sin(angle) * dist;
    }

    // Find max radius at this point
    let maxR;
    if (isRootLevel) {
      // Constrain to canvas edges
      maxR = min(px, py, canvasW - px, canvasH - py);
    } else {
      // Constrain to bounding circle
      const distToEdge = boundR - dist2d(cx, cy, px, py);
      maxR = distToEdge;
    }

    // Constrain to not overlap existing circles
    for (let i = 0; i < packed.length; i++) {
      const c = packed[i];
      const d = dist2d(px, py, c.x, c.y) - c.r;
      if (d < maxR) maxR = d;
    }

    // Also constrain against parent-level circles (root level only)
    if (isRootLevel) {
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const d = dist2d(px, py, c.x, c.y) - c.r;
        if (d < maxR) maxR = d;
      }
    }

    // Apply padding between circles
    maxR -= 1.5;

    if (maxR >= minR) {
      // Limit max circle size relative to container
      const capR = isRootLevel
        ? min(maxR, min(canvasW, canvasH) * 0.35)
        : min(maxR, boundR * 0.8);

      const r = max(minR, capR);
      packed.push({ x: px, y: py, r: r, depth: depth });
      failedInARow = 0;
    } else {
      failedInARow++;
    }
  }

  return packed;
}

function dist2d(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Build the full recursive circle-packing composition.
 */
function buildComposition() {
  circles = [];
  const attempts = 500;

  // Root-level packing
  const rootCircles = packCircles(0, 0, null, 0, attempts, minRadius, maxDepth);
  circles.push(...rootCircles);

  // Recursive packing inside large circles
  recursivePack(rootCircles, 1, attempts, minRadius, maxDepth);
}

function recursivePack(parentCircles, depth, attempts, minR, maxD) {
  if (depth > maxD) return;

  for (let i = 0; i < parentCircles.length; i++) {
    const parent = parentCircles[i];
    // Only pack inside circles large enough
    if (parent.r < 30) continue;

    const innerPadding = 3;
    const innerR = parent.r - innerPadding;
    if (innerR < minR * 2) continue;

    const childAttempts = Math.max(80, Math.floor(attempts * 0.5));
    const children = packInside(parent.x, parent.y, innerR, depth, childAttempts, minR, maxD);
    circles.push(...children);

    // Recurse deeper
    recursivePack(children, depth + 1, Math.floor(childAttempts * 0.5), minR, maxD);
  }
}

/**
 * Pack circles inside a specific parent circle.
 */
function packInside(cx, cy, boundR, depth, maxAttempts, minR, maxD) {
  const packed = [];
  if (depth > maxD) return packed;

  let failedInARow = 0;
  let attempts = 0;

  while (failedInARow < maxAttempts) {
    attempts++;
    if (attempts > maxAttempts * 4) break;

    // Random point inside bounding circle
    const angle = random(TWO_PI);
    const rDist = random(0, boundR);
    const px = cx + cos(angle) * rDist;
    const py = cy + sin(angle) * rDist;

    // Max radius: distance to bounding edge
    let maxR = boundR - dist2d(cx, cy, px, py);

    // Constrain against siblings
    for (let i = 0; i < packed.length; i++) {
      const c = packed[i];
      const d = dist2d(px, py, c.x, c.y) - c.r;
      if (d < maxR) maxR = d;
    }

    maxR -= 1.5; // padding

    if (maxR >= minR) {
      const capR = min(maxR, boundR * 0.6);
      const r = max(minR, capR);
      packed.push({ x: px, y: py, r: r, depth: depth });
      failedInARow = 0;
    } else {
      failedInARow++;
    }
  }

  return packed;
}

// --------------- p5.js Setup & Draw ---------------

function setup() {
  const container = document.getElementById('canvas-container');
  canvasW = container.offsetWidth;
  canvasH = container.offsetHeight;

  p5Canvas = createCanvas(canvasW, canvasH);
  p5Canvas.parent('canvas-container');

  // Initial seed
  currentSeed = Math.floor(Math.random() * 100000);
  updateSeedDisplay();

  randomSeed(currentSeed);
  buildComposition();

  // Wire up controls
  elBtnRegen().addEventListener('click', regenerate);

  elMinRadius().addEventListener('input', function () {
    elValMinRadius().textContent = this.value + ' px';
  });

  elMaxDepth().addEventListener('input', function () {
    elValMaxDepth().textContent = this.value;
  });
}

function draw() {
  background(250, 250, 249);

  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    const col = depthColor(c.depth);
    const stk = strokeForDepth(c.depth);

    // Breathing animation: gentle pulse
    const phase = frameCount * 0.02 + c.depth * 0.8 + i * 0.003;
    const pulse = map(sin(phase), -1, 1, 0.95, 1.05);
    const r = c.r * pulse;

    // Subtle shadow / glow
    const glowAlpha = map(c.r, minRadius, 120, 8, 30);
    noStroke();
    fill(col[0], col[1], col[2], glowAlpha);
    ellipse(c.x, c.y + 1.5, r * 2 + 4, r * 2 + 4);

    // Main circle fill
    const fillAlpha = map(c.depth, 0, 4, 200, 120);
    fill(col[0], col[1], col[2], fillAlpha);
    stroke(stk[0], stk[1], stk[2], 80);
    strokeWeight(1);
    ellipse(c.x, c.y, r * 2, r * 2);

    // Inner highlight — small specular on bigger circles
    if (c.r > 15) {
      noStroke();
      fill(255, 255, 255, 40);
      const hlOff = r * 0.25;
      ellipse(c.x - hlOff, c.y - hlOff, r * 0.5, r * 0.5);
    }
  }

  // Seed watermark in corner
  noStroke();
  fill(28, 25, 23, 40);
  textFont('JetBrains Mono, monospace');
  textSize(11);
  textAlign(RIGHT, BOTTOM);
  text('seed: ' + currentSeed, canvasW - 12, canvasH - 10);
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  canvasW = container.offsetWidth;
  canvasH = container.offsetHeight;
  resizeCanvas(canvasW, canvasH);

  // Rebuild composition at new size
  randomSeed(currentSeed);
  buildComposition();
}

// --------------- Controls ---------------

function regenerate() {
  minRadius = parseInt(elMinRadius().value, 10);
  maxDepth  = parseInt(elMaxDepth().value, 10);
  currentSeed = Math.floor(Math.random() * 100000);
  updateSeedDisplay();
  randomSeed(currentSeed);
  buildComposition();
}

function updateSeedDisplay() {
  const seedStr = String(currentSeed).padStart(5, '0');
  elSeedDisplay().textContent  = seedStr;
  elFooterSeed().textContent   = seedStr;
}
